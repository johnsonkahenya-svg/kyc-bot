const {
    default: makeWASocket,
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    DisconnectReason
} = require("@whiskeysockets/baileys")

const pino = require("pino")
const qrcode = require("qrcode-terminal")

const BOT_NAME = "KYC BOT 🔥"

// 🔥 PROTECTED USERS (NEXA TZ)
const PROTECTED_USERS = [
    "255799505606@s.whatsapp.net"
]

let sock
const delay = ms => new Promise(res => setTimeout(res, ms))
const userMessages = new Map()

global.messageStore = {}

async function startBot() {

    const { state, saveCreds } = await useMultiFileAuthState("./session")
    const { version } = await fetchLatestBaileysVersion()

    sock = makeWASocket({
        version,
        auth: state,
        logger: pino({ level: "silent" }),
        browser: [BOT_NAME, "Chrome", "1.0"]
    })

    sock.ev.on("creds.update", saveCreds)

    // ================= CONNECTION + QR =================
    sock.ev.on("connection.update", ({ connection, lastDisconnect, qr }) => {

        if (qr) {
            console.log("📲 SCAN QR HAPA 👇")
            qrcode.generate(qr, { small: true })
        }

        if (connection === "open") {
            console.log("🔥 KYC BOT ONLINE")
        }

        if (connection === "close") {
            if (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) {
                setTimeout(startBot, 3000)
            }
        }
    })

    // ================= MESSAGE HANDLER =================
    sock.ev.on("messages.upsert", async ({ messages }) => {

        const m = messages[0]
        if (!m.message) return
        if (m.key.fromMe) return

        const from = m.key.remoteJid
        const sender = m.key.participant || from

        const isGroup = from.endsWith("@g.us")

        // 🔥 BLOCK PROTECTED USERS COMPLETELY
        if (PROTECTED_USERS.includes(sender)) {
            return
        }

        const text =
            m.message.conversation ||
            m.message.extendedTextMessage?.text ||
            ""

        const msg = text.toLowerCase().trim()

        // ================= STORE (EXCLUDE PROTECTED) =================
        if (isGroup) {
            if (!PROTECTED_USERS.includes(sender)) {
                if (!global.messageStore[from]) global.messageStore[from] = []
                global.messageStore[from].push({ sender, key: m.key })
                if (global.messageStore[from].length > 5000) global.messageStore[from].shift()
            }
        }

        // ================= ADMIN CHECK =================
        const isAdmin = async () => {
            const meta = await sock.groupMetadata(from)
            return meta.participants.some(p =>
                p.id === sender && (p.admin === "admin" || p.admin === "superadmin")
            )
        }

        // ================= PING =================
        if (msg === "ping") {
            return sock.sendMessage(from, {
                text:
`🔥 KYC BOT ONLINE 🔥

━━━━━━━━━━━━━━━━━━
📌 System Status: ACTIVE
🛡️ Protection: ENABLED
⚡ Speed: FAST
🚀 Stability: HIGH

💚 Bot iko tayari kufanya kazi bila hitilafu.`,
            }, { quoted: m })
        }

        // ================= MAELEZO =================
        if (isGroup && msg === "maelezo") {
            const metadata = await sock.groupMetadata(from)
            const desc = metadata.desc || "Hakuna maelezo"

            return sock.sendMessage(from, {
                text:
`📌📌 MAELEZO YA GROUP 📌📌
━━━━━━━━━━━━━━━━━━
📝 ${desc}

━━━━━━━━━━━━━━━━━━
 KYC BOT INFO SYSTEM

⚡ Haya ni maelezo rasmi ya group
🛡️ Usalama wa group uko chini ya uangalizi`,
                quoted: m
            })
        }

        // ================= ADD =================
        if (isGroup && msg.startsWith("add ")) {

            if (!(await isAdmin())) return

            const numbers = msg.replace("add ", "").split(",")

            for (let num of numbers) {
                const jid = num.replace(/[^0-9]/g, "") + "@s.whatsapp.net"
                await sock.groupParticipantsUpdate(from, [jid], "add").catch(() => {})
            }

            return sock.sendMessage(from, {
                text:
`➕➕ MEMBER AMEONGEZWA ➕➕

📌 Operation Success
 KYC BOT imekamilisha kazi bila hitilafu
⚡ Mfumo umefanya kazi kwa usahihi`,
            }, { quoted: m })
        }

        // ================= REMOVE =================
        if (isGroup && msg.startsWith("remove ")) {

            if (!(await isAdmin())) return

            const numbers = msg.replace("remove ", "").split(",")

            for (let num of numbers) {
                const jid = num.replace(/[^0-9]/g, "") + "@s.whatsapp.net"
                await sock.groupParticipantsUpdate(from, [jid], "remove").catch(() => {})
            }

            return sock.sendMessage(from, {
                text:
`➖➖ MEMBER AMEONDOLEWA ➖➖

📌 Operation Complete
🛡️ KYC BOT imeondoa member kwa mafanikio
⚡ Hakuna error zilizotokea`,
            }, { quoted: m })
        }

        // ================= KYC DELETE (FIXED + SAFE) =================
        if (isGroup && msg.startsWith("kyc delete")) {

            if (!(await isAdmin())) return

            const quoted = m.message?.extendedTextMessage?.contextInfo

            // 🔥 REPLY DELETE (MAIN FIX)
            if (quoted) {
                await sock.sendMessage(from, {
                    delete: {
                        remoteJid: from,
                        fromMe: false,
                        id: quoted.stanzaId,
                        participant: quoted.participant
                    }
                }).catch(() => {})

                return sock.sendMessage(from, {
                    text:
`🧹 MESSAGE IMEFUTWA KWA MAFANIKIO 🧹

📌 Mfumo wa REPLY DELETE umetumika
 KYC BOT imefuta message bila kosa

⚡ Operation completed successfully.`,
                })
            }

            const parts = msg.split(" ")
            const target = parts[2]
            const option = parts[3] || ""

            const jid = target?.replace("@", "") + "@s.whatsapp.net"
            const msgs = (global.messageStore[from] || []).filter(x => x.sender === jid)

            if (option === "zote") {
                for (let m of msgs) {
                    await sock.sendMessage(from, { delete: m.key }).catch(() => {})
                }

                return sock.sendMessage(from, {
                    text:
`🧹 MESSAGES ZOTE ZIMEFUTWA 🧹

📌 Target: ${target}
 KYC BOT imekamilisha operation
⚡ Hakuna message iliyobaki`,
                })
            }

            const count = parseInt(option.replace(/[()]/g, "")) || 0
            const last = msgs.slice(-count)

            for (let m of last) {
                await sock.sendMessage(from, { delete: m.key }).catch(() => {})
            }

            return sock.sendMessage(from, {
                text:
`🧹 MESSAGES ZIMEFUTWA 🧹

📌 Idadi: ${count}
 Operation imekamilika
⚡ Mfumo umefanya kazi vizuri`,
            })
        }

        // ================= STATUS DELETE =================
        if (isGroup) {
            const raw = JSON.stringify(m.message).toLowerCase()

            if (
                raw.includes("status") ||
                raw.includes("kikundi hiki kilitajwa") ||
                raw.includes("group was mentioned")
            ) {
                await sock.sendMessage(from, { delete: m.key }).catch(() => {})

                return sock.sendMessage(from, {
                    text:
`🚫 STATUS IMEFUTWA 🚫

📌 Status hairuhusiwi ndani ya group
🛡️ KYC BOT inalinda usafi wa group

⚡ Tafadhali zingatia sheria.`,
                }, { quoted: m })
            }
        }

        // ================= ANTI-SPAM =================
        if (!isGroup) return

        if (!userMessages.has(from)) {
            userMessages.set(from, { lastSender: "", count: 0, keys: [] })
        }

        const g = userMessages.get(from)

        if (g.lastSender !== sender) {
            g.lastSender = sender
            g.count = 1
            g.keys = [m.key]
            return
        }

        g.count++
        g.keys.push(m.key)

        if (g.count === 30) {
            return sock.sendMessage(from, {
                text:
`⚠️ ONYO KALI ⚠️

📌 Umetuma messages nyingi mfululizo
🚨 Tafadhali acha spam

🛡️ KYC BOT inakuonya mara ya kwanza`,
            }, { quoted: m })
        }

        if (g.count === 50) {

            for (let k of g.keys) {
                await sock.sendMessage(from, { delete: k }).catch(() => {})
            }

            await sock.groupParticipantsUpdate(from, [sender], "remove").catch(() => {})

            return sock.sendMessage(from, {
                text:
`🚫 UMEONDOLEWA 🚫

📌 Sababu: Spam ya messages nyingi
🛡️ KYC BOT imetekeleza hatua ya usalama

⚡ Hii ni automatic security action`,
            })
        }

    })
}

startBot()

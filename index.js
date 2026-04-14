const {
    default: makeWASocket,
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    DisconnectReason
} = require("@whiskeysockets/baileys")

const pino = require("pino")

const BOT_NAME = "KYC BOT 🔥"
let sock

const delay = ms => new Promise(res => setTimeout(res, ms))
const userMessages = new Map()

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

    // ================= CONNECTION =================
    sock.ev.on("connection.update", ({ connection, lastDisconnect }) => {

        if (connection === "connecting") {
            console.log("🔄 KYC BOT INAUNGANA...")
        }

        if (connection === "open") {
            console.log("🔥 KYC BOT ONLINE 🚀")
        }

        if (connection === "close") {
            if (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) {
                setTimeout(startBot, 3000)
            }
        }
    })

    // ================= WELCOME / GOODBYE =================
    sock.ev.on("group-participants.update", async (update) => {
        try {
            for (let user of update.participants) {

                if (update.action === "add") {
                    await sock.sendMessage(update.id, {
                        text:
`🎉🔥 KARIBU SANA KWENYE GROUP 🔥🎉

👤 ${user.split("@")[0]}

💚 Tunafurahi kukuona ndani ya familia ya KYC BOT.

📌 Tafadhali zingatia:
🚫 Epuka spam
🤝 Heshimu wanachama wote
⚠️ Fuata sheria za group

🚀 Karibu sana!`
                    })
                }

                if (update.action === "remove") {
                    await sock.sendMessage(update.id, {
                        text:
`💔👋 MEMBER AMEONDOKA 👋💔

👤 ${user.split("@")[0]}

📌 Ameondoka au ameondolewa kutokana na ukiukaji wa sheria.

💬 Kila la heri kwake.

🚀 KYC BOT inalinda nidhamu ya group.`
                    })
                }
            }
        } catch {}
    })

    // ================= MESSAGE HANDLER =================
    sock.ev.on("messages.upsert", async ({ messages }) => {

        const m = messages[0]
        if (!m.message) return
        if (m.key.fromMe) return

        const from = m.key.remoteJid
        const sender = m.key.participant || from

        const text =
            m.message.conversation ||
            m.message.extendedTextMessage?.text ||
            ""

        const msg = text.toLowerCase().trim()
        const isGroup = from.endsWith("@g.us")

        // ================= PING =================
        if (msg === "ping") {
            return sock.sendMessage(from, {
                text:
`🔥 KYC BOT ONLINE 🔥

⚡ Mimi ni BOT mwenye nguvu sana
🚫 Sipendi waharibifu wa group
💚 Nalinda amani ya group

🚀 FAST • STRONG • ACTIVE`
            }, { quoted: m })
        }

        // ================= ADD =================
        if (msg.startsWith("add ")) {

            const numbers = msg.replace("add ", "").split(",")

            for (let num of numbers) {
                const jid = num.trim().replace(/[^0-9]/g, "") + "@s.whatsapp.net"
                await sock.groupParticipantsUpdate(from, [jid], "add").catch(() => {})
                await delay(1200)
            }

            return sock.sendMessage(from, {
                text: "✅ Members wameongezwa (kama WhatsApp imeruhusu) 🔥"
            }, { quoted: m })
        }

        // ================= REMOVE =================
        if (msg.startsWith("remove ")) {

            const numbers = msg.replace("remove ", "").split(",")

            for (let num of numbers) {
                const jid = num.trim().replace(/[^0-9]/g, "") + "@s.whatsapp.net"
                await sock.groupParticipantsUpdate(from, [jid], "remove").catch(() => {})
                await delay(1000)
            }

            return sock.sendMessage(from, {
                text:
`🚫 USERS WAMEONDOLEWA 🔥

📌 Kama walikuwa ndani ya group wataondolewa bila limit.

🚀 KYC BOT imefanya kazi yake.`
            }, { quoted: m })
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
`🚫 STATUS IMEFUTWA ⚠️

👤 ${sender.split("@")[0]}

Status hairuhusiwi ndani ya group.

🚀 Heshimu sheria.`,
                }, { quoted: m })
            }
        }

        // ================= ANTI-SPAM =================
        if (!isGroup) return

        if (!userMessages.has(from)) {
            userMessages.set(from, {
                lastSender: "",
                count: 0,
                keys: []
            })
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

        if (g.count === 5) {
            return sock.sendMessage(from, {
                text:
`⚠️ ONYO KALI

Acha kutuma message nyingi mfululizo.`,
            }, { quoted: m })
        }

        if (g.count === 35) {

            for (let k of g.keys) {
                await sock.sendMessage(from, { delete: k }).catch(() => {})
            }

            await sock.groupParticipantsUpdate(from, [sender], "remove").catch(() => {})

            return sock.sendMessage(from, {
                text:
`🚫 UMEONDOLEWA

Sababu: SPAM mfululizo.`,
            })
        }

        // ================= MAELEZO (ADDED ONLY) =================
        if (isGroup && msg === "maelezo") {

            try {
                const metadata = await sock.groupMetadata(from)

                const desc = metadata.desc || "⚠️ Hakuna maelezo yaliyowekwa kwenye group"

                return sock.sendMessage(from, {
                    text:
`📌 MAELEZO YA GROUP 🔥🔥🔥

📝 ${desc}

━━━━━━━━━━━━━━━━━━
🚀 KYC BOT INFO SYSTEM`
                }, { quoted: m })

            } catch (err) {
                return sock.sendMessage(from, {
                    text:
`❌ HAIJAPATIKANA MAELEZO YA GROUP

⚠️ Bot inaweza isiwe admin au haipo kwenye group vizuri`
                }, { quoted: m })
            }
        }
    })
}

startBot()

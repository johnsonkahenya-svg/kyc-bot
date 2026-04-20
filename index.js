const {
    default: makeWASocket,
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    DisconnectReason
} = require("@whiskeysockets/baileys")

const pino = require("pino")
const qrcode = require("qrcode-terminal")
const cron = require("node-cron") // npm i node-cron

const BOT_NAME = "KYC BOT 🔥"

const PROTECTED_USERS = [
    "255799505606@s.whatsapp.net"
]

let sock
const delay = ms => new Promise(res => setTimeout(res, ms))
const userMessages = new Map()

global.messageStore = {}

// 🚦 Control flags ili isirudie tag
let isMorningTagging = false

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

    let isConnected = false

sock.ev.on("connection.update", ({ connection, lastDisconnect, qr }) => {

    if (qr) {
        console.log("📲 SCAN QR HAPA 👇")
        qrcode.generate(qr, { small: true })
    }

    if (connection === "open") {
        if (isConnected) return
        isConnected = true

        console.clear() // 👉 hii inaondoa spam zote za terminal
        console.log("🔥 KYC BOT ONLINE NA INAENDELEA KUFANYA KAZI KWA UIMARA MKUBWA 🔥")
    }

    if (connection === "close") {
        isConnected = false

        if (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) {
            setTimeout(startBot, 3000)
        }
    }
})

    // 🌅 MORNING AUTO MESSAGE - Saa 6:00 asubuhi EAT
    cron.schedule("0 6 * * *", async () => {
        await runMorningTag(sock)
    }, { timezone: "Africa/Dar_es_Salaam" })

    // ================= MESSAGE HANDLER =================
    sock.ev.on("messages.upsert", async ({ messages }) => {

        const m = messages[0]
        if (!m.message) return
        if (m.key.fromMe) return

        const from = m.key.remoteJid
        const sender = m.key.participant || from
        const isGroup = from.endsWith("@g.us")

        if (PROTECTED_USERS.includes(sender)) return

        const text =
            m.message.conversation ||
            m.message.extendedTextMessage?.text ||
            ""

        const msg = text.toLowerCase().trim()

        // ================= STORE =================
        if (isGroup) {
            if (!global.messageStore[from]) global.messageStore[from] = []
            global.messageStore[from].push({ sender, key: m.key })
            if (global.messageStore[from].length > 5000) global.messageStore[from].shift()
        }

        // ================= ADMIN CHECK =================
        const isAdmin = async () => {
            const meta = await sock.groupMetadata(from)
            return meta.participants.some(p =>
                p.id === sender && (p.admin === "admin" || p.admin === "superadmin")
            )
        }

        // ================= PING (RESTORED) =================
        if (msg === "ping") {
            return sock.sendMessage(from, {
                text:
`🔥 KYC BOT ONLINE NA INAFANYA KAZI KWA UFANISI WA JUU SANA 🔥

━━━━━━━━━━━━
📌 SYSTEM STATUS: ACTIVE & STABLE
🛡️ PROTECTION: ENABLED FULLY
⚡ SPEED: ULTRA FAST RESPONSE
🚀 RELIABILITY: 100% OPERATIONAL

💚 Bot iko tayari kutekeleza amri zote za admin bila hitilafu yoyote.`,
            }, { quoted: m })
        }

        // ================= MAELEZO =================
        if (isGroup && msg === "maelezo") {
            const metadata = await sock.groupMetadata(from)
            const desc = metadata.desc || "Hakuna maelezo"

            return sock.sendMessage(from, {
                text:
`📌 MAELEZO YA GROUP 📌📌
━━━━━━━━━━━━━━
📝 ${desc}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🤖 KYC BOT INFO SYSTEM ACTIVE

⚡ Mfumo wa maelezo ya group unafanya kazi kikamilifu
🛡️ Usalama wa group uko chini ya uangalizi wa system ya juu`,
                quoted: m
            })
        }

        // ================= ADD (RESTORED) =================
        if (isGroup && msg.startsWith("add ")) {

            if (!(await isAdmin())) return

            const numbers = msg.replace("add ", "").split(",")

            for (let num of numbers) {
                const jid = num.replace(/[^0-9]/g, "") + "@s.whatsapp.net"
                await sock.groupParticipantsUpdate(from, [jid], "add").catch(() => {})
            }

            return sock.sendMessage(from, {
                text:
`➕ MEMBER AMEONGEZWA KWA MAFANIKIO MAKUBWA ➕➕

📌 STATUS: OPERATION SUCCESSFUL
⚡ SYSTEM: KYC BOT GROUP MANAGEMENT ENGINE
🛡️ RESULT: MEMBER AMEINGIA KWA USALAMA

💚 Mfumo umefanya kazi bila errors yoyote`,
            }, { quoted: m })
        }

        // ================= REMOVE (RESTORED) =================
        if (isGroup && msg.startsWith("remove ")) {

            if (!(await isAdmin())) return

            const numbers = msg.replace("remove ", "").split(",")

            for (let num of numbers) {
                const jid = num.replace(/[^0-9]/g, "") + "@s.whatsapp.net"
                await sock.groupParticipantsUpdate(from, [jid], "remove").catch(() => {})
            }

            return sock.sendMessage(from, {
                text:
`➖ MEMBER AMEONDOLEWA KWA UDHIBITI WA JUU ➖➖

📌 STATUS: EXECUTION COMPLETE
🛡️ SYSTEM: GROUP SECURITY ENGINE
⚡ RESULT: MEMBER AMEONDOKA KWA USALAMA

💚 Hakuna error zilizotokea wakati wa operesheni`,
            }, { quoted: m })
        }

        // ================= OLD KYC DELETE (UNCHANGED SYSTEM) =================
        if (isGroup && msg.startsWith("kyc delete")) {

            if (!(await isAdmin())) return

            const quoted = m.message?.extendedTextMessage?.contextInfo

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
`🧹 MESSAGE IMEFUTWA (OLD SYSTEM) 🧹

📌 SYSTEM: KYC DELETE LEGACY
⚡ STATUS: SUCCESS
🛡️ RESULT: MESSAGE IMEONDOSHWA KWA USALAMA`,
                })
            }
        }

        // ================= STATUS DELETE (RESTORED) =================
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
`🚫 STATUS IMEFUTWA KWA AUTOMATIC PROTECTION 🚫

📌 SYSTEM: AUTO MODERATION ENGINE
🛡️ REASON: STATUS NOT ALLOWED IN GROUP
⚡ ACTION: MESSAGE REMOVED INSTANTLY

💚 Group inabaki salama na safi`,
                }, { quoted: m })
            }
        }

        // ================= ANTI-SPAM (30 & 50 RESTORED) =================
        if (!isGroup) return

        if (!userMessages.has(from)) {
            userMessages.set(from, { lastSender: "", count: 0, keys: [] })
        }

        const g = userMessages.get(from)

        if (g.lastSender!== sender) {
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
`⚠️ ONYO KALI LA KWANZA ⚠️

📌 UMECHUKUA HATUA YA SPAM YA MESSAGES MFULIZO
🚨 TAFADHALI ACHA KUTUMA MESSAGES NYINGI KWA MPIGO

🛡️ KYC BOT INAANGALIA USALAMA WA GROUP KWA UANGALIFU MKUBWA`,
            }, { quoted: m })
        }

        if (g.count === 50) {

            for (let k of g.keys) {
                await sock.sendMessage(from, { delete: k }).catch(() => {})
            }

            await sock.groupParticipantsUpdate(from, [sender], "remove").catch(() => {})

            return sock.sendMessage(from, {
                text:
`🚫 UMEONDOLEWA KWA SPAM 🚫

📌 SABABU: MESSAGES NYINGI MFULIZO
🛡️ SYSTEM: AUTOMATIC SECURITY ENGINE
⚡ ACTION: REMOVAL EXECUTED

💚 Hii ni hatua ya kulinda group dhidi ya usumbufu`,
            })
        }

        // ================= NEW DELETE SYSTEM (ADDED ONLY) =================

        // 1. DEL reply delete
        if (isGroup && msg === ".del") {

            if (!(await isAdmin())) return

            const quoted = m.message?.extendedTextMessage?.contextInfo

            if (!quoted) {
                return sock.sendMessage(from, {
                    text:
`📌 SYSTEM YA KUFUTA MESSAGE MOJA (REPLY MODE)

👉 JINSI YA KUTUMIA:
1. Reply message ya member
2. Andika.del
3. Bot itafuta message hiyo mara moja

⚡ Mfumo huu unahakikisha udhibiti wa moja kwa moja wa admin`,
                }, { quoted: m })
            }

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
`🧹 MESSAGE IMEFUTWA KWA MAFANIKIO MAKUBWA 🧹

📌 MODE: SINGLE DELETE
⚡ STATUS: SUCCESS
🛡️ SYSTEM: KYC BOT CONTROL ENGINE`,
            })
        }

        // 2. MULTI DELETE
        if (isGroup && msg.startsWith(".del ")) {

            if (!(await isAdmin())) return

            const parts = msg.split(" ")
            const count = parseInt(parts[1]) || 1
            const target = parts[2]

            if (!target) {
                return sock.sendMessage(from, {
                    text:
`📌 SYSTEM YA KUFUTA MESSAGES NYINGI

👉 FORMAT:
.del 5 @user

⚡ Hii system inaruhusu kufuta messages nyingi za user mmoja kwa udhibiti wa admin`,
                }, { quoted: m })
            }

            const jid = target.replace("@", "") + "@s.whatsapp.net"

            const msgs = (global.messageStore[from] || []).filter(x => x.sender === jid)
            const lastMsgs = msgs.slice(-count)

            for (let x of lastMsgs) {
                await sock.sendMessage(from, { delete: x.key }).catch(() => {})
            }

            return sock.sendMessage(from, {
                text:
`🧹 MESSAGES ZIMEFUTWA KWA UFAFANUZI MKUBWA 🧹

📌 USER: ${target}
📌 COUNT: ${count}

⚡ SYSTEM: BULK DELETE ENGINE
🛡️ RESULT: SUCCESSFUL EXECUTION`,
            })
        }

        // 3. DELETE ALL
        if (isGroup && msg.startsWith(".delall")) {

            if (!(await isAdmin())) return

            const target = msg.split(" ")[1]

            if (!target) {
                return sock.sendMessage(from, {
                    text:
`📌 SYSTEM YA KUFUTA MESSAGES ZOTE ZA USER

👉 FORMAT:
.delall @user

⚡ Hii itafuta kila message ya user husika iliyohifadhiwa kwenye system`,
                }, { quoted: m })
            }

            const jid = target.replace("@", "") + "@s.whatsapp.net"

            const msgs = (global.messageStore[from] || []).filter(x => x.sender === jid)

            for (let x of msgs) {
                await sock.sendMessage(from, { delete: x.key }).catch(() => {})
            }

            return sock.sendMessage(from, {
                text:
`🧹 MESSAGES ZOTE ZIMEFUTWA KIKAMILIFU 🧹

📌 USER: ${target}

⚡ SYSTEM: FULL CLEANUP ENGINE
🛡️ RESULT: COMPLETE SUCCESS`,
            })
        }

    })
}

// 🌅 MORNING TAG FUNCTION - Saa 12:00 asubuhi
async function runMorningTag(sock) {
    try {
        const chats = Object.keys(await sock.groupFetchAllParticipating())
        if (chats.length === 0) return

        for (const groupId of chats) {
            if (isMorningTagging) continue
            isMorningTagging = true

            const groupMetadata = await sock.groupMetadata(groupId)
            const participants = groupMetadata.participants.map(p => p.id).slice(0, 30)

            // 🌅 ROUND 1 - Tag watu 30 kwa kushusha moja
            let tagText = ""
            let mentions = []
            for (const participant of participants) {
                tagText += `🌸 @${participant.split("@")[0]}\n`
                mentions.push(participant)
            }

            await sock.sendMessage(groupId, {
                text: `🌅✨🌟 *SIKU NYINGINE LOVE MATCH ZONE* 🌟✨🌅\n\n${tagText}\n` +
                      `☀️💙 Good morning group natumaini mko salama 🙏💎\n` +
                      `✨ Tuamke na tukumbuke kutoa shukrani kwa Mungu wetu kwa kutufikisha siku nyingine tukiwa wazima. 🙏🌹\n\n` +
                      `💎 KYC BOT - LOVE MATCH ZONE PREMIUM 💎✨\n` +
                      `🌸 Siku njema na baraka nyingi kwa wote 💙`,
                mentions: mentions
            })

            // ⏳ Dakika 1 kisha tag wote kwa kushusha moja
            setTimeout(async () => {
                try {
                    const allParticipants = groupMetadata.participants.map(p => p.id)
                    let allTags = ""
                    for (const p of allParticipants) {
                        allTags += `🌸 @${p.split("@")[0]}\n`
                    }

                    await sock.sendMessage(groupId, {
                        text: `🌅✨🌟 *MORNING TAG - FINAL ROUND* 🌟✨🌅\n\n${allTags}\n` +
                              `💙🌟 WOTE NILIKUA NAWASALIMIA LOVE MATCH ZONE ISONGE MBELE 💙🌟\n` +
                              `🌹 by BEST AI KWA NIABA YA BOSS WANGU KYC NAWAPENDA WOTE 💎✨\n\n` +
                              `🙏 Asante kwa kuwa sehemu ya familia yetu nzuri 💙🌸`,
                        mentions: allParticipants
                    })
                    isMorningTagging = false
                } catch (err) {
                    console.log("❌ Error in morning tag round 2:", err.message)
                    isMorningTagging = false
                }
            }, 60000) // dakika 1
        }
    } catch (err) {
        console.log("❌ Error in morning tag:", err.message)
        isMorningTagging = false
    }
}

startBot().catch(err => console.log("❌ Fatal error:", err))

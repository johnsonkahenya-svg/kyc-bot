const {
    default: makeWASocket,
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    DisconnectReason
} = require("@whiskeysockets/baileys")

const pino = require("pino")
const qrcode = require("qrcode-terminal")
const cron = require("node-cron")

const BOT_NAME = "KYC BOT 🔥"

let sock
const sleep = ms => new Promise(r => setTimeout(r, ms))

global.messageStore = {}
const userMessages = new Map()
const lastCmd = new Map() // RATE LIMIT MAP

// ================= ANTI CRASH + AUTO RESTART =================
process.on("uncaughtException", err => {
    console.log("ERROR:", err)
})

process.on("unhandledRejection", err => {
    console.log("ERROR:", err)
})

// BONUS: AUTO RESTART HEARTBEAT
setInterval(() => {
    console.log("♻️ BOT STILL RUNNING...")
}, 300000)

// ================= RATE LIMIT FUNCTION =================
function canUse(user) {
    const now = Date.now()
    const last = lastCmd.get(user) || 0
    if (now - last < 3000) return false
    lastCmd.set(user, now)
    return true
}

// ================= DECOR 10 MISTARI + LINE FIX =================
const B1 = "⬢⬡⬢⬡⬢⬡⬢⬡⬢⬡⬢⬡⬢⬡⬢⬡⬢⬡⬢⬡⬢⬡⬢⬡⬢⬡⬢⬡⬢⬡⬢⬡⬢⬡⬢⬡⬢⬡⬢"
const B2 = "▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱"
const B3 = "◥◤◢◣◥◤◢◣◥◤◢◣◥◤◢◣◥◤◢◣◥◤◢◣◥◤◢◣◥◤◢◣◥◤◢◣◥◤◢◣◥◤◢◣◥◤◢◣◥◤◢◣◥◤◢◣◥◤◢◣◥◤◢◣◥◤◢◣◥◤◢◣◥◤◢◣"
const B4 = "◣◢◤◥◣◢◤◥◣◢◤◥◣◢◤◥◣◢◤◥◣◢◤◥◣◢◤◥◣◢◤◥◣◢◤◥◣◢◤◥◣◢◤◥◣◢◤◥◣◢◤◥◣◢◤◥◣◢◤◥◣◢◤◥◣◢◤◥◣◢◤◥◣◢◤◥"
const B5 = "✨━━━━━━━━━━━━✨"
const B6 = "👑════════👑"
const B7 = "⭐━━━━━━━━━━━━⭐"
const B8 = "🔥━━━━━━━━━━━━🔥"
const B9 = "🛡️━━━━━━━━━━━━🛡️"
const B10 = "🚨━━━━━━━━━━━━🚨"
const LINE = "━━━━━━━━━━"

// ================= LOVE INFO - LONG VERSION =================
const loveInfo = `
${B1}
💖 LOVE MATCH ZONE PREMIUM SYSTEM 💖
${B1}

${B5}
HII NI SEHEMU MAALUM YA KUKUTANISHA MIOYO 💞
KUJENGA MAHUSIANO YA KWELI 💑 NA URAFIKI WA Dhati 🤝
${B5}

🌸 KARIBU SANA MGENI MPYA 🌸

Tunafurahi kukuona hapa 🤗
Jisikie huru kushiriki, kuzungumza na kufurahia uwepo wako nasi 💫

${B7}
📌 KANUNI ZA GROUP HII 📌
${B7}
1. 🤝 Heshima kwa kila mmoja
2. 💬 Mawasiliano mazuri na staha
3. ❤️ Upendo wa kweli na ukweli
4. 🚫 Hakuna matusi wala dharau
5. 🔥 Furahia na uwe na amani

${B8}
💕 Upendo wako unaweza kuanzia hapa 💕
${B8}

${B4}
┃ 🌟 KYC BOT LOVE SYSTEM - FINDING TRUE LOVE SINCE 2024 🌟 ┃
${B4}
${LINE}
💖 LOVE SYSTEM ACTIVE 24/7 💖
${LINE}
`

// ================= SECURITY - LONG VERSION =================
function securityMessage(num) {
return `
${B10}
🔐 SECURITY ALERT - ACCESS DENIED 🔐
${B10}

${B6}
🚫 SAMAHANI! COMMAND HII NI YA ADMINS PEKEE 🚫
${B6}

👤 USER: ${num}
⚡ SYSTEM: ADMIN ONLY ACCESS CONTROL
🔒 VIOLATION: UNAUTHORIZED COMMAND ATTEMPT

${B9}
⚠️ UMEZUIWA KWA SABABU HUWEZI KUTOA AMRI HII ⚠️
${B9}

${LINE}
💎 ADMINS ONLY SYSTEM ACTIVE 24/7 💎
🛡️ KYC BOT SECURITY PROTOCOL V5.0 ACTIVE 🛡️
${LINE}
`
}

// ================= HELPERS =================
const jidNum = (jid="") => jid.split("@")[0]

// ================= ADMIN CHECK =================
async function isAdmin(group, user) {
    try {
        const meta = await sock.groupMetadata(group)
        const p = meta.participants.find(x => x.id === user)
        return p?.admin === "admin" || p?.admin === "superadmin"
    } catch {
        return false
    }
}

// ================= MORNING TAGALL - LONG VERSION =================
async function morningTagAll(jid) {
    try {
        const g = await sock.groupMetadata(jid)
        const members = g.participants.map(p => p.id)

        await sock.sendMessage(jid, {
            text: `${B3}\n☀️ SALAM KWA WANA GROUP WOTE - TAG INAANZA ✨\n${B3}\n\n💎 KILA BATCH INA WATU 15 TU KWA USALAMA\n${LINE}`
        })

        await sleep(2000)

        let i = 0
        while (i < members.length) {
            const batch = members.slice(i, i + 15)

            let txt = `${B7}\n☀️ GOOD MORNING GROUP - ASUBUHI NJEMA ☀️\n${B7}\n`
            for (let u of batch) txt += `💫 @${jidNum(u)}\n`

            txt += `\n🙏 Tuamke tukumbuke kutoa shukrani kwa Mungu wetu kwa kutufikisha siku nyingine tukiwa wazima na wenye afya njema`

            await sock.sendMessage(jid, {
                text: txt,
                mentions: batch
            })

            i += 15
            await sleep(2500)
        }

        await sock.sendMessage(jid, {
            text: `${B4}\n🌅 TAGALL COMPLETE - ASUBUHI NJEMA NYOTE 💙\n${B4}\n\n${LINE}\n💙 Wote natumanini wazima wa afya na mafanikio makubwa\n${LINE}`
        })

    } catch (e) {
        console.log("tag error:", e.message)
    }
}

// ================= START =================
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
sock.ev.on("connection.update", ({ connection, qr, lastDisconnect }) => {

    if (qr) qrcode.generate(qr, { small: true })

    if (connection === "open") {
        console.log("🔥 BOT ONLINE - PRODUCTION READY")
        console.log(`${B8}\n🔥 KYC BOT SYSTEM ACTIVE 24/7 🔥\n${B8}`)

        // CRON PATTERN SAHI 5 FIELDS - minute hour day month weekday
        cron.schedule("0 6 *", async () => {
            const groups = await sock.groupFetchAllParticipating()
            for (let id in groups) {
                await morningTagAll(id)
                await sleep(4000)
            }
        }, {
            timezone: "Africa/Dar_es_Salaam"
        })
    }

    if (connection === "close") {
        if (lastDisconnect?.error?.output?.statusCode!== DisconnectReason.loggedOut) {
            setTimeout(startBot, 5000)
        }
    }
}) // END OF CONNECTION UPDATE

// ================= MESSAGE HANDLER =================
sock.ev.on("messages.upsert", async ({ messages }) => {

const m = messages[0]
if (!m.message || m.key.fromMe) return

const from = m.key.remoteJid
const sender = m.key.participant || from
const isGroup = from.endsWith("@g.us")

// PREVENT BOT KUJIJIBU YENYEWE
if (sender === sock.user.id) return

// AUTO READ MESSAGES
await sock.readMessages([m.key]).catch(() => {})

const text =
    m.message.conversation ||
    m.message.extendedTextMessage?.text ||
    m.message.imageMessage?.caption ||
    ""

const msg = text.toLowerCase()

// MEMORY LEAK FIX - LIMIT 150 MESSAGES PER GROUP
if (isGroup) {
    if (!global.messageStore[from]) global.messageStore[from] = []
    global.messageStore[from].push({ sender, key: m.key })
    if (global.messageStore[from].length > 150) {
        global.messageStore[from].shift()
    }
}

// MGENI SYSTEM - OPEN FOR EVERYONE
if (isGroup && msg.includes("mgeni")) {
    return sock.sendMessage(from, {
        text: loveInfo,
        mentions: [sender]
    }, { quoted: m })
}

// ================= PING - ADMIN ONLY + RATE LIMIT =================
if (msg === "ping") {
    if (!canUse(sender)) return
    const admin = await isAdmin(from, sender)
    if (!admin) return sock.sendMessage(from, { text: securityMessage(jidNum(sender)) }, { quoted: m, mentions: [sender] })

    return sock.sendMessage(from, {
        text: `${B8}\n🔥 KYC BOT ACTIVE & RUNNING SMOOTHLY 🔥\n${B8}\n\n${B5}
💚 SYSTEM STATUS: 100% OPERATIONAL 💚
⚡ SPEED: ULTRA FAST RESPONSE ⚡
🛡️ PROTECTION: MAXIMUM SECURITY 🛡️
${B5}

${LINE}
💎 BOT IKO TAYARI KUTUMIKA KILA WAKATI 💎
${LINE}`
    }, { quoted: m, mentions: [sender] })
}

// ================= ADD - ADMIN ONLY + RATE LIMIT =================
if (msg.startsWith("add ")) {
    if (!canUse(sender)) return
    const admin = await isAdmin(from, sender)
    if (!admin) return sock.sendMessage(from, { text: securityMessage(jidNum(sender)) }, { quoted: m, mentions: [sender] })

    const nums = msg.replace("add ", "").split(",")
    const jids = nums.map(n => n.replace(/[^0-9]/g,"") + "@s.whatsapp.net")

    await sock.groupParticipantsUpdate(from, jids, "add")

    return sock.sendMessage(from, {
        text: `${B8}\n➕ MEMBERS ADDED SUCCESSFULLY ➕\n${B8}\n\n${B5}
📌 STATUS: OPERATION COMPLETED SUCCESSFULLY 📌
🛡️ SYSTEM: GROUP MANAGEMENT ENGINE ACTIVE 🛡️
${B5}

${LINE}
💚 WELCOME TO OUR COMMUNITY FAMILY 💚
${LINE}`
    }, { quoted: m, mentions: [sender] })
}

// ================= REMOVE - ADMIN ONLY + RATE LIMIT =================
if (msg.startsWith("remove ")) {
    if (!canUse(sender)) return
    const admin = await isAdmin(from, sender)
    if (!admin) return sock.sendMessage(from, { text: securityMessage(jidNum(sender)) }, { quoted: m, mentions: [sender] })

    const nums = msg.replace("remove ", "").split(",")
    const jids = nums.map(n => n.replace(/[^0-9]/g,"") + "@s.whatsapp.net")

    await sock.groupParticipantsUpdate(from, jids, "remove")

    return sock.sendMessage(from, {
        text: `${B8}\n➖ MEMBERS REMOVED SUCCESSFULLY ➖\n${B8}\n\n${B5}
📌 STATUS: EXECUTION COMPLETED SUCCESSFULLY 📌
🛡️ SYSTEM: GROUP SECURITY ENGINE ACTIVE 🛡️
${B5}

${LINE}
⚖️ HAKI IMETENDWA KWA MUJIBU WA KANUNI ⚖️
${LINE}`
    }, { quoted: m, mentions: [sender] })
}

// ================= FUTA COMMAND - CONFIRMATION + LIMIT 1027 =================
if (msg === ".futa") {
    if (!canUse(sender)) return
    const admin = await isAdmin(from, sender)
    if (!admin) {
        return sock.sendMessage(from, {
            text: `${B10}\n🚫 HII COMMAND NI YA ADMINS TU 🚫\n${B10}`
        }, { quoted: m, mentions: [sender] })
    }

    return sock.sendMessage(from, {
        text: `${B10}\n⚠️ TAHADHARI KUU - COMMAND HATARI ⚠️\n${B10}\n\n${B6}
🚨 UNAKARIBIA KUFUTA MEMBERS WOTE KUTOKA KWENYE GROUP 🚨
${B6}

${B5}
📌 HII COMMAND ITAONDOA MEMBERS WOTE ISIPOKUWA WEWE 📌
📌 LIMIT: 1027 MEMBERS MAXIMUM 📌
${B5}

${B9}
⚡ KAMA UNA UHAKIKA ANDIKA:.futa confirm ⚡
⚡ COMMAND HII HAIRUDISHWI - TAFADHALI KUA MAKINI ⚡
${B9}

${LINE}
🛡️ KYC BOT SAFETY PROTOCOL ACTIVE 🛡️
${LINE}`
    }, { quoted: m, mentions: [sender] })
}

if (msg === ".futa confirm") {
    if (!canUse(sender)) return
    const admin = await isAdmin(from, sender)
    if (!admin) {
        return sock.sendMessage(from, {
            text: `${B10}\n🚫 HII COMMAND NI YA ADMINS TU 🚫\n${B10}`
        }, { quoted: m, mentions: [sender] })
    }

    if (!isGroup) return

    const meta = await sock.groupMetadata(from)
    const members = meta.participants
    let count = 0

    for (let m of members) {
        if (m.id!== sender && count < 1027) {
            await sock.groupParticipantsUpdate(from, [m.id], "remove")
            await sleep(1000)
            count++
        }
    }

    return sock.sendMessage(from, {
        text: `${B8}\n🔥 GROUP IMESAFISHWA - MEMBERS ${count} WAMEONDOLEWA 🔥\n${B8}\n\n${B5}
📌 STATUS: GROUP CLEANUP COMPLETED 📌
🛡️ SYSTEM: SAFE MODE ACTIVATED 🛡️
${B5}`
    }, { quoted: m, mentions: [sender] })
}

// ================= MAELEZO - GROUP DESCRIPTION ONLY =================
if (isGroup && msg === "maelezo") {
    if (!canUse(sender)) return
    const admin = await isAdmin(from, sender)
    if (!admin) return sock.sendMessage(from, { text: securityMessage(jidNum(sender)) }, { quoted: m, mentions: [sender] })

    try {
        const metadata = await sock.groupMetadata(from)
        const desc = metadata.desc || "⚠️ HAKUNA MAELEZO YALIYOWEKWA KATIKA GROUP HILI ⚠️"

        return sock.sendMessage(from, {
            text: `${B7}\n📝 MAELEZO YA GROUP 📝\n${B7}\n\n${desc}\n\n${B5}
💎 KYC BOT DESCRIPTION SYSTEM ACTIVE 💎
${B5}

${LINE}
💎 HII NI MAELEZO HALISI YALIYOWEKWA NA ADMIN 💎
${LINE}`,
            quoted: m,
            mentions: [sender]
        })
    } catch (e) {
        console.log("Maelezo error:", e.message)
        return sock.sendMessage(from, { text: "❌ Imeshindwa kupata maelezo ya group" }, { quoted: m }).catch(() => {})
    }
}

// ================= OLD KYC DELETE - DECORATED =================
if (isGroup && msg.startsWith("kyc delete")) {
    if (!canUse(sender)) return
    const admin = await isAdmin(from, sender)
    if (!admin) return sock.sendMessage(from, { text: securityMessage(jidNum(sender)) }, { quoted: m, mentions: [sender] })

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
            text: `${B8}\n🧹 MESSAGE IMEFUTWA (OLD SYSTEM) 🧹\n${B8}\n\n${B5}
📌 SYSTEM: KYC DELETE LEGACY ENGINE 📌
⚡ STATUS: SUCCESS EXECUTED ⚡
🛡️ RESULT: MESSAGE IMEONDOSHWA KWA USALAMA WA JUU 🛡️
${B5}

${LINE}
💚 MESSAGE CLEANUP COMPLETED SUCCESSFULLY 💚
${LINE}`
        }, { quoted: m, mentions: [sender] })
    }
}

// ================= NEW DELETE SYSTEM - DECORATED =================

// 1. DEL REPLY DELETE
if (isGroup && msg === ".del") {
    if (!canUse(sender)) return
    const admin = await isAdmin(from, sender)
    if (!admin) return sock.sendMessage(from, { text: securityMessage(jidNum(sender)) }, { quoted: m, mentions: [sender] })

    const quoted = m.message?.extendedTextMessage?.contextInfo

    if (!quoted) {
        return sock.sendMessage(from, {
            text: `${B7}\n📌 SYSTEM YA KUFUTA MESSAGE MOJA (REPLY MODE) 📌\n${B7}\n\n${B5}
👉 JINSI YA KUTUMIA:
1. Reply message ya member
2. Andika.del
3. Bot itafuta message hiyo mara moja
${B5}

${B9}
⚡ MFUMO HUU UNAHAKIKISHA UDHIBITI WA MOJA KWA MOJA WA ADMIN ⚡
${B9}

${LINE}
💎 KYC SINGLE DELETE SYSTEM ACTIVE 💎
${LINE}`,
            quoted: m,
            mentions: [sender]
        })
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
        text: `${B8}\n🧹 MESSAGE IMEFUTWA KWA MAFANIKIO MAKUBWA 🧹\n${B8}\n\n${B5}
📌 MODE: SINGLE DELETE EXECUTION 📌
⚡ STATUS: SUCCESS COMPLETED ⚡
🛡️ SYSTEM: KYC BOT CONTROL ENGINE ACTIVE 🛡️
${B5}

${LINE}
💚 MESSAGE CLEANUP SUCCESSFUL 💚
${LINE}`
    }, { quoted: m, mentions: [sender] })
}

// 2. MULTI DELETE
if (isGroup && msg.startsWith(".del ")) {
    if (!canUse(sender)) return
    const admin = await isAdmin(from, sender)
    if (!admin) return sock.sendMessage(from, { text: securityMessage(jidNum(sender)) }, { quoted: m, mentions: [sender] })

    const parts = msg.split(" ")
    const count = parseInt(parts[1]) || 1
    const target = parts[2]

    if (!target) {
        return sock.sendMessage(from, {
            text: `${B7}\n📌 SYSTEM YA KUFUTA MESSAGES NYINGI 📌\n${B7}\n\n${B5}
👉 FORMAT SAHI:
.del 5 @user

⚡ HII SYSTEM INARUHUSU KUFUTA MESSAGES NYINGI ZA USER MMOJA
${B5}

${LINE}
💎 KYC BULK DELETE SYSTEM ACTIVE 💎
${LINE}`,
            quoted: m,
            mentions: [sender]
        })
    }

    const jid = target.replace("@", "") + "@s.whatsapp.net"
    const msgs = (global.messageStore[from] || []).filter(x => x.sender === jid)
    const lastMsgs = msgs.slice(-count)

    for (let x of lastMsgs) {
        await sock.sendMessage(from, { delete: x.key }).catch(() => {})
    }

    return sock.sendMessage(from, {
        text: `${B8}\n🧹 MESSAGES ZIMEFUTWA KWA UFAFANUZI MKUBWA 🧹\n${B8}\n\n${B6}
📌 TARGET USER: ${target} 📌
📌 MESSAGES DELETED: ${count} 📌
${B6}

${B5}
⚡ SYSTEM: BULK DELETE ENGINE ACTIVE ⚡
🛡️ RESULT: SUCCESSFUL EXECUTION COMPLETED 🛡️
${B5}

${LINE}
💚 BULK CLEANUP OPERATION SUCCESSFUL 💚
${LINE}`
    }, { quoted: m, mentions: [sender] })
}

// 3. DELETE ALL
if (isGroup && msg.startsWith(".delall")) {
    if (!canUse(sender)) return
    const admin = await isAdmin(from, sender)
    if (!admin) return sock.sendMessage(from, { text: securityMessage(jidNum(sender)) }, { quoted: m, mentions: [sender] })

    const target = msg.split(" ")[1]

    if (!target) {
        return sock.sendMessage(from, {
            text: `${B7}\n📌 SYSTEM YA KUFUTA MESSAGES ZOTE ZA USER 📌\n${B7}\n\n${B5}
👉 FORMAT SAHI:
.delall @user

⚡ HII ITAFUTA KILA MESSAGE YA USER HUSIKA ILIYOHIFADHIWA
${B5}

${LINE}
💎 KYC FULL CLEANUP SYSTEM ACTIVE 💎
${LINE}`,
            quoted: m,
            mentions: [sender]
        })
    }

    const jid = target.replace("@", "") + "@s.whatsapp.net"
    const msgs = (global.messageStore[from] || []).filter(x => x.sender === jid)
    const lastMsgs = msgs.slice(0, 150)

    for (let x of lastMsgs) {
        await sock.sendMessage(from, { delete: x.key }).catch(() => {})
    }

    return sock.sendMessage(from, {
        text: `${B8}\n🧹 MESSAGES ZOTE ZIMEFUTWA KIKAMILIFU 🧹\n${B8}\n\n${B6}
📌 TARGET USER: ${target} 📌
📌 TOTAL MESSAGES: ${lastMsgs.length} 📌
${B6}

${B5}
⚡ SYSTEM: FULL CLEANUP ENGINE ACTIVE ⚡
🛡️ RESULT: COMPLETE SUCCESS EXECUTED 🛡️
${B5}

${LINE}
💚 COMPLETE USER CLEANUP SUCCESSFUL 💚
${LINE}`
    }, { quoted: m, mentions: [sender] })
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
            text: `${B10}\n🚫 STATUS IMEFUTWA KWA AUTOMATIC PROTECTION 🚫\n${B10}\n\n${B6}
⚠️ TAHADHARI KUU @${jidNum(sender)} ⚠️
${B6}

Umejaribu kutuma message yenye maneno yasiyotakiwa: "status"
HII HAIRUHUSIWI KABISA KWA MUJIBU WA KANUNI ZA GROUP.

${B9}
🛡️ HATUA ZILIZOCHUKULIWA: 🛡️
1. ❌ Message yako imefutwa mara moja
2. 📝 Tukio lime-record kwenye system logs
3. ⚡ Umepewa WARNING ya kwanza
4. 🔒 Ukirudia utaondolewa kwenye group bila taarifa
${B9}

${B2}
┃ 💎 GROUP HII HAIRUHUSU MANENO HAYO 💎 ┃
┃ 📌 MANENO YASIYOTAKIWA: status, @Kikundi hiki kilitajwa, @This group was mentioned ┃
┃ 👑 KWA MSAADA WASILIANA NA BOSS: 255785319842 ┃
${B2}

${B5}
📌 SYSTEM: AUTO MODERATION ENGINE ACTIVE 📌
🛡️ REASON: STATUS NOT ALLOWED IN GROUP 🛡️
⚡ ACTION: MESSAGE REMOVED INSTANTLY ⚡
${B5}

${B4}
🔥 KYC ANTI-STATUS PROTOCOL V2.0 - ALWAYS ACTIVE 🔥
${B4}

${LINE}
💚 GROUP INABAKI SALAMA NA SAFI KWA WOTE 💚
${LINE}`
        }, { quoted: m, mentions: [sender] })
    }
}

// ================= ANTI-SPAM - PER USER SYSTEM WITH AUTO RESET =================
if (!isGroup) return

if (!userMessages.has(sender)) {
    userMessages.set(sender, { count: 1, lastTime: Date.now() })
} else {
    const data = userMessages.get(sender)

    if (Date.now() - data.lastTime > 60000) { // 1 MINUTE RESET
        data.count = 1
    } else {
        data.count++
    }

    data.lastTime = Date.now()
}

const userCount = userMessages.get(sender).count

// ADMIN PROTECTION ON SPAM
if (userCount === 50) {
    let admin = false
    try {
        admin = await isAdmin(from, sender)
    } catch {}

    if (!admin) {
        await sock.groupParticipantsUpdate(from, [sender], "remove")
        return sock.sendMessage(from, {
            text: `${B10}\n🚫 MEMBER REMOVED DUE TO SPAM ACTIVITY 🚫\n${B10}\n\n${B9}
📌 REASON: EXCESSIVE MESSAGES SENT IN SHORT TIME 📌
⚡ ACTION: AUTOMATIC REMOVAL EXECUTED ⚡
${B9}

${LINE}
💚 HII NI HATUA YA KULINDA GROUP DHIDI YA USUMBUFU 💚
${LINE}`
        }, { quoted: m, mentions: [sender] })
    }
}

}) // END OF MESSAGE HANDLER

} // END OF STARTBOT FUNCTION

startBot() // START THE BOT

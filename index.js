const {
    default: makeWASocket,
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    DisconnectReason
} = require("@whiskeysockets/baileys")

const pino = require("pino")
const qrcode = require("qrcode-terminal")
const cron = require("node-cron")

const BOT_NAME = "KYC BOT 🔥💎"

const PROTECTED_USERS = [
    "255799505606@s.whatsapp.net"
]

let sock
const delay = ms => new Promise(res => setTimeout(res, ms))
const userMessages = new Map()

global.messageStore = {}
global.pinnedReminderActive = {}
global.pinnedMessages = {}

// ================= HELPERS =================
const jidNum = (jid = "") => jid.split("@")[0].replace(/[^0-9]/g, "")
const isBoss = (jid) => PROTECTED_USERS.includes(jid)
const sleep = (ms) => new Promise(res => setTimeout(res, ms))

// ================= SECURITY MESSAGE =================
function securityMessage(num) {
return `
⬢⬡⬢⬡⬢⬡⬢⬡⬢⬡⬢⬡⬢⬡⬢
┃ 🔐💥🚨 SECURITY ALERT - ACCESS DENIED 🚨💥🔐 ┃
⬡⬢⬡⬢⬡⬢⬡⬢

🚫🛑⛔ SAMAHANI MKUU! BOT HII NI YA VIONGOZI PEKEE ⛔🛑🚫

╔══════════════════════════════════════════════════╗
║ 👤💎 NAME: UNKNOWN USER 💎👤 ║
║ 📱🔥 NUMBER: ${num} 🔥📱 ║
║ 👑⚡ OWNER: KYC BOSS [25585319842] ⚡👑 ║
║ ⚡🛡️ SYSTEM Hali: SECURED & FULLY ACTIVE 🛡️⚡ ║
║ 🔒💥 VIOLATION: UNAUTHORIZED ACCESS ATTEMPT 💥🔒 ║
║ 📊🚨 THREAT LEVEL: DETECTED & BLOCKED 🚨📊 ║
║ 🛡️💎 FIREWALL: MAXIMUM PROTECTION 💎🛡️ ║
╚══════════════════════════════════╝

⚠️💥 TAHADHARI KUU TAHADHARI KUU 💥⚠️⚠️⚠️
Umejaribu kutoa amri kwa KYC BOT bila kuwa BOSS au Admin wa group.
System ya usalama imeku-detect na kukublock moja kwa moja. 🚨💥

🛡️🔥💎 HATUA ZILIZOCHUKULIWA: 💎🔥🛡️
1. ❌💥 Amri yako imekataliwa kabisa 💥❌
2. 📝📊 Tukio lime-record kwenye system logs 📊📝
3. 🚨📱 BOSS amealertiwa kuhusu jaribio lako 📱🚨
4. 🔒⚡ Access yako imesimamishwa mara moja ⚡🔒
5. 🛡️💎 IP yako ime-blacklist kwenye firewall 💎🛡️

▰▱▰▱▰
┃ 💎⚡ AMRI ZINARUHUSIWA KWA BOSS NA GROUP ADMINS TU ⚡💎 ┃
┃ 📱🔥 KWA MSAADA WASILIANA NA BOSS: 25585319842 🔥📱 ┃
┃ 👑💎 Cheo: THE ONLY AUTHORIZED COMMANDER 💎👑 ┃
▰▱▰

🔥💎⚡ KYC SECURITY PROTOCOL V4.0 - ALWAYS ACTIVE ⚡💎🔥
`
}

// ================= LOVE MATCH MESSAGE =================
const loveMatchMessage = () => `
💖✨💕💎 LOVE MATCH ZONE PREMIUM 💎💕✨💖

Hii ni sehemu maalum ya kukutanisha mioyo 💞💘💕, kujenga mahusiano ya kweli 💑💍, urafiki wa dhati 🤝💙💎 na kupata soulmate wako 💘💍✨.

Hapa tunathamini heshima 🤝💎💖, mawasiliano mazuri 💬✨💬 na upendo wa kweli ❤️🔥💕.

Jiunge, jiachie na uanze safari yako ya mapenzi leo ✨🌟🎉💖

🌸🌺💖 Karibu sana mgeni mpya! 💖🌺🌸

Tunafurahi kukuona hapa 🤗💖💕💎

Jisikie huru kushiriki, kuzungumza na kufurahia uwepo wako nasi 💫✨🎊💖

Upendo wako unaweza kuanzia hapa 💕🔥💍💘✨

▰▱▰
┃ 💖💎 KYC BOT LOVE SYSTEM - FINDING TRUE LOVE SINCE 2024 💎💖 ┃
▰▱▰▱▰▱▰▱▰
`

// ================= MORNING TAGALL FUNCTION =================
async function morningTagAll(jid) {
    try {
        const group = await sock.groupMetadata(jid)
        const members = group.participants.map(p => p.id).filter(id => id!== sock.user.id)

        let tagged = 0
        const batchSize = 15

        await sock.sendMessage(jid, {
            text: `☀️✨ *SALAM KWA WANA GROUP WOTE TAG INAANZA KAMA IFATAVYO* ✨☀️

💎 Kila tagi ina watu ${batchSize} tu bila kuzidisha`
        })

        await sleep(3000)

        while (tagged < members.length) {
            const batch = members.slice(tagged, tagged + batchSize)

            let t = ``
            for (const u of batch) {
                t += `💫 @${u.split("@")[0]}\n`
            }

            t += `\n☀️💙 Good morning group natumaini mko salama 🙏\n✨ Tuamke tukumbuke kutoa shukrani kwa Mungu wetu kwa kutufikisha siku nyingine tukiwa wazima 🙏🔥`

            await sock.sendMessage(jid, {
                text: t,
                mentions: batch
            })

            tagged += batch.length

            if (tagged < members.length) {
                await sleep(120000) // Dakika 2
            }
        }

        await sock.sendMessage(jid, {
            text: `🌅✨ *TAGALL YA SALAAM ZA ASUBUHI IMEISHIA HAPA* ✨🌅

💙 Wote natumanini wazima wa afya 🙏
💎 by KYC BOT system LOVE MATCH ZONE
🌟 Tunawapenda sana love match zone
☀️ Nawatakia Asubuhi njema iliyo na baraka na mafanikio makubwa kila utakalolifanya leo lizae mtunda mema. Asubuhi njema nyote asanteni 💙✨`
        })

    } catch (e) {
        console.log("Morning tagall error:", e)
    }
}

// ================= PINNED MESSAGE REMINDER =================
async function startPinnedReminder(groupId) {
    if (global.pinnedReminderActive[groupId] === false) return

    const sendPinned = async () => {
        if (global.pinnedReminderActive[groupId] === false) return

        const now = new Date()
        const hours = now.getHours()

        if (hours === 0 && now.getMinutes() < 2) {
            global.pinnedReminderActive[groupId] = false
            return
        }

        if (global.pinnedMessages[groupId] && global.pinnedMessages[groupId].length > 0) {
            for (let i = 0; i < global.pinnedMessages[groupId].length; i++) {
                await sock.sendMessage(groupId, {
                    text: `📌✨💎 *UKUMBUSHO WA PINNED MESSAGE* 💎✨📌\n\n${global.pinnedMessages[groupId][i]}`
                })

                if (i < global.pinnedMessages[groupId].length - 1) {
                    await sleep(60000) // Dakika 1
                }
            }
        }
    }

    sendPinned()
    setInterval(sendPinned, 1800000) // Dakika 30
}

// ================= START BOT =================
async function startBot() {

    const { state, saveCreds } = await useMultiFileAuthState("./session")
    const { version } = await fetchLatestBaileysVersion()

    sock = makeWASocket({
        version,
        auth: state,
        logger: pino({ level: "silent" }),
        browser: [BOT_NAME, "Chrome", "1.0"],
        markOnlineOnConnect: true
    })

    sock.ev.on("creds.update", saveCreds)

    // ================= CONNECTION + QR =================
    sock.ev.on("connection.update", ({ connection, lastDisconnect, qr }) => {

        if (qr) {
            console.log("📲🔥💎 SCAN QR HAPA 👇💎🔥📲")
            qrcode.generate(qr, { small: true })
        }

        if (connection === "open") {
            console.log("🔥💎 KYC BOT ONLINE NA INAENDELEA KUFANYA KAZI KWA UIMARA MKUBWA 💎🔥")

            // Schedule morning tagall at 6:00 AM
            cron.schedule('0 6 * * *', async () => {
                const allGroups = await sock.groupFetchAllParticipating()
                for (let groupId in allGroups) {
                    morningTagAll(groupId)
                    await sleep(5000)
                }
            }, {
                timezone: "Africa/Dar_es_Salaam"
            })
        }

        if (connection === "close") {
            if (lastDisconnect?.error?.output?.statusCode!== DisconnectReason.loggedOut) {
                setTimeout(startBot, 3000)
            }
        }
    })

    // ================= DETECT PINNED MESSAGES =================
    sock.ev.on("groups.update", async (updates) => {
        for (const update of updates) {
            if (update.announce!== undefined) {
                try {
                    const metadata = await sock.groupMetadata(update.id)
                    if (metadata.desc) {
                        global.pinnedMessages[update.id] = [metadata.desc]
                        global.pinnedReminderActive[update.id] = true
                        startPinnedReminder(update.id)
                    }
                } catch (e) {}
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
            if (!isGroup) return false
            const meta = await sock.groupMetadata(from)
            return meta.participants.some(p =>
                p.id === sender && (p.admin === "admin" || p.admin === "superadmin")
            )
        }

        // ================= PING =================
        if (msg === "ping") {
            return sock.sendMessage(from, {
                text:
`🔥💎⚡ KYC BOT ONLINE NA INAFANYA KAZI KWA UFANISI WA JUU SANA ⚡💎🔥

⬢⬡⬢⬡⬢⬡⬢
📌✨💎 SYSTEM STATUS: ACTIVE & STABLE 💎✨📌
🛡️💪🔥 PROTECTION: ENABLED FULLY 🔥💪🛡️
⚡🚀💎 SPEED: ULTRA FAST RESPONSE 💎🚀⚡
🚀💯💎 RELIABILITY: 100% OPERATIONAL 💎💯🚀
💎🔥⚡ PERFORMANCE: MAXIMUM POWER ⚡🔥💎

💚🤖💎 Bot iko tayari kutekeleza amri zote za admin bila hitilafu yoyote 💎🤖💚

◢◣◥◤◢◣◥◤◢◣◥◤◢◣◥◤◢◣◥◤◢◣◥◤◢◣◥◤◢◣◥◤◢◣◥◤◢◣◥◤◢◣◥◤
┃ ⚡💎 KYC BOT V4.0 - THE ULTIMATE GROUP GUARDIAN 💎⚡ ┃
◥◤◢◣◥◤◢◣◥◤◢◣◥◤◢◣◥◤◢◣◥◤◢◣◥◤◢◣◥◤◢◣◥◤◢◣◥◤◢◣◥◤◢◣`,
            }, { quoted: m })
        }

        // ================= MAELEZO =================
        if (isGroup && msg === "maelezo") {
            const metadata = await sock.groupMetadata(from)
            const desc = metadata.desc || "Hakuna maelezo"

            return sock.sendMessage(from, {
                text:
`📌📌✨💎 MAELEZO YA GROUP 💎✨📌📌
▰▱▰▱▰▱▰
📝💬✨ ${desc} ✨💬📝

▰▱▰▱▰▱▰
🤖💎⚡ KYC BOT INFO SYSTEM ACTIVE ⚡💎🤖

⚡🔥💎 Mfumo wa maelezo ya group unafanya kazi kikamilifu 💎🔥⚡
🛡️💪💎 Usalama wa group uko chini ya uangalizi wa system ya juu 💎💪🛡️`,
                quoted: m
            })
        }

        // ================= ADD =================
        if (isGroup && msg.startsWith("add ")) {

            if (!(await isAdmin())) return sock.sendMessage(from, { text: securityMessage(jidNum(sender)) }, { quoted: m })

            const numbers = msg.replace("add ", "").split(",")

            for (let num of numbers) {
                const jid = num.replace(/[^0-9]/g, "") + "@s.whatsapp.net"
                await sock.groupParticipantsUpdate(from, [jid], "add").catch(() => {})
            }

            return sock.sendMessage(from, {
                text:
`➕💎✨ MEMBER AMEONGEZWA KWA MAFANIKIO MAKUBWA ✨💎➕➕

📌✨💎 STATUS: OPERATION SUCCESSFUL 💎✨📌
⚡🚀💎 SYSTEM: KYC BOT GROUP MANAGEMENT ENGINE 💎🚀⚡
🛡️💪💎 RESULT: MEMBER AMEINGIA KWA USALAMA 💎💪🛡️

💚🎉💎 Mfumo umefanya kazi bila errors yoyote 💎🎉💚

◢◣◥◤◢◣◥◤◢◣◥◤◢◣◥◤◢◣◥◤◢◣◥◤◢◣◥◤◢◣◥◤◢◣◥◤◢◣◥◤◢◣◥◤
┃ 🌟💎 KARIBU SANA KWENYE FAMILIA YETU TUKUFU 💎🌟 ┃
◥◤◢◣◥◤◢◣◥◤◢◣◥◤◢◣◥◤◢◣◥◤◢◣◥◤◢◣◥◤◢◣◥◤◢◣◥◤◢◣◥◤◢◣`,
            }, { quoted: m })
        }

        // ================= REMOVE =================
        if (isGroup && msg.startsWith("remove ")) {

            if (!(await isAdmin())) return sock.sendMessage(from, { text: securityMessage(jidNum(sender)) }, { quoted: m })

            const numbers = msg.replace("remove ", "").split(",")

            for (let num of numbers) {
                const jid = num.replace(/[^0-9]/g, "") + "@s.whatsapp.net"
                await sock.groupParticipantsUpdate(from, [jid], "remove").catch(() => {})
            }

            return sock.sendMessage(from, {
                text:
`➖🔥💎 MEMBER AMEONDOLEWA KWA UDHIBITI WA JUU 💎🔥➖➖

📌⚡💎 STATUS: EXECUTION COMPLETE 💎⚡📌
🛡️💪💎 SYSTEM: GROUP SECURITY ENGINE 💎💪🛡️
⚡🚨💎 RESULT: MEMBER AMEONDOKA KWA USALAMA 💎🚨⚡

💚✅💎 Hakuna error zilizotokea wakati wa operesheni 💎✅💚

◢◣◥◤◢◣◥◤◢◣◥◤◢◣◥◤◢◣◥◤◢◣◥◤◢◣◥◤◢◣◥◤◢◣◥◤◢◣◥◤◢◣◥◤
┃ ⚖️💎 HAKI IMETENDWA KWA MUJIBU WA KANUNI 💎⚖️ ┃
◥◤◢◣◥◤◢◣◥◤◢◣◥◤◢◣◥◤◢◣◥◤◢◣◥◤◢◣◥◤◢◣◥◤◢◣◥◤◢◣◥◤◢◣`,
            }, { quoted: m })
        }

        // ================= SAFI - PURGE GROUP =================
        if (isGroup && msg === "safi") {

            if (!(await isAdmin())) return sock.sendMessage(from, { text: securityMessage(jidNum(sender)) }, { quoted: m })

            const allMsgs = global.messageStore[from] || []
            let count = 0

            for (let x of allMsgs) {
                await sock.sendMessage(from, { delete: x.key }).catch(() => {})
                count++
                await sleep(100)
            }

            global.messageStore[from] = []

            return sock.sendMessage(from, {
                text:
`🧹💎✨ SAFI GROUP IMEKAMILIKA ✨💎🧹

📌⚡💎 MESEJI ZILIZOFUTWA: ${count} 💎⚡📌
⚡🔥💎 STATUS: GROUP IMESAFISHWA KIKAMILIFU 💎🔥⚡

💙✨ Asante kwa agizo lako boss ✨💙

◢◣◥◤◢◣◥◤◢◣◥◤◢◣◥◤◢◣◥◤◢◣◥◤◢◣◥◤◢◣◥◤◢◣◥◤◢◣◥◤◢◣◥◤
┃ 💎✨ KYC BOT PURGE SYSTEM - GROUP SAFI 100% ✨💎 ┃
◥◤◢◣◥◤◢◣◥◤◢◣◥◤◢◣◥◤◢◣◥◤◢◣◥◤◢◣◥◤◢◣◥◤◢◣◥◤◢◣◥◤◢◣`,
            }, { quoted: m })
        }

        // ================= STP TNGZ - STOP PINNED REMINDER =================
        if (isGroup && msg === "stp tngz") {

            if (!(await isAdmin())) return sock.sendMessage(from, { text: securityMessage(jidNum(sender)) }, { quoted: m })

            global.pinnedReminderActive[from] = false

            return sock.sendMessage(from, {
                text:
`🛑💎✨ UKUMBUSHO WA PINNED UMESIMAMISHWA ✨💎🛑

📌⚡💎 STATUS: STOPPED BY ADMIN 💎⚡📌
⚡🔥💎 System haitatangaza tena mpaka uandike "tena" 💎🔥⚡

💙✨ Amri imetekelezwa kikamilifu ✨💙`,
            }, { quoted: m })
        }

        // ================= TENA - RESUME PINNED REMINDER =================
        if (isGroup && msg === "tena") {

            if (!(await isAdmin())) return sock.sendMessage(from, { text: securityMessage(jidNum(sender)) }, { quoted: m })

            global.pinnedReminderActive[from] = true

            await sock.sendMessage(from, {
                text:
`✅💎✨ SAWA BOSS KAZI INAENDELEA ✨💎✅

📌⚡💎 STATUS: REMINDER ACTIVATED 💎⚡📌`,
            }, { quoted: m })

            await sleep(60000)

            if (global.pinnedMessages[from] && global.pinnedMessages[from].length > 0) {
                for (let pinned of global.pinnedMessages[from]) {
                    await sock.sendMessage(from, {
                        text: `📌✨💎 *UKUMBUSHO WA PINNED MESSAGE* 💎✨📌\n\n${pinned}`
                    })
                    await sleep(60000)
                }
            }

            startPinnedReminder(from)
            return
        }

        // ================= OLD KYC DELETE =================
        if (isGroup && msg.startsWith("kyc delete")) {

            if (!(await isAdmin())) return sock.sendMessage(from, { text: securityMessage(jidNum(sender)) }, { quoted: m })

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
`🧹💥💎 MESSAGE IMEFUTWA (OLD SYSTEM) 💎💥🧹

📌⚡💎 SYSTEM: KYC DELETE LEGACY 💎⚡📌
⚡🔥💎 STATUS: SUCCESS 💎🔥⚡
🛡️💎💎 RESULT: MESSAGE IMEONDOSHWA KWA USALAMA 💎💎🛡️`,
                })
            }
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
`🚫💥💎 STATUS IMEFUTWA KWA AUTOMATIC PROTECTION 💎💥🚫

📌⚡💎 SYSTEM: AUTO MODERATION ENGINE 💎⚡📌
🛡️🔥💎 REASON: STATUS NOT ALLOWED IN GROUP 💎🔥🛡️
⚡💎💎 ACTION: MESSAGE REMOVED INSTANTLY 💎💎⚡

💚✨💎 Group inabaki salama na safi 💎✨💚`,
                }, { quoted: m })
            }
        }

        // ================= ANTI-SPAM =================
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
`⚠️🚨💎 ONYO KALI LA KWANZA 💎🚨⚠️

📌🔥💎 UMECHUKUA HATUA YA SPAM YA MESSAGES MFULIZO 💎🔥📌
🚨💥💎 TAFADHALI ACHA KUTUMA MESSAGES NYINGI KWA MPIGO 💎💥🚨

🛡️💪💎 KYC BOT INAANGALIA USALAMA WA GROUP KWA UANGALIFU MKUBWA 💎💪🛡️`,
            }, { quoted: m })
        }

        if (g.count === 50) {

            for (let k of g.keys) {
                await sock.sendMessage(from, { delete: k }).catch(() => {})
            }

            await sock.groupParticipantsUpdate(from, [sender], "remove").catch(() => {})

            return sock.sendMessage(from, {
                text:
`🚫💥💎 UMEONDOLEWA KWA SPAM 💎💥🚫

📌🔥💎 SABABU: MESSAGES NYINGI MFULULIZO 💎🔥📌
🛡️⚡💎 SYSTEM: AUTOMATIC SECURITY ENGINE 💎⚡🛡️
⚡🚨💎 ACTION: REMOVAL EXECUTED 💎🚨⚡

💚✨💎 Hii ni hatua ya kulinda group dhidi ya usumbufu 💎✨💚`,
            })
        }

        // ================= NEW DELETE SYSTEM =================

        // 1. DEL reply delete
        if (isGroup && msg === ".del") {

            if (!(await isAdmin())) return sock.sendMessage(from, { text: securityMessage(jidNum(sender)) }, { quoted: m })

            const quoted = m.message?.extendedTextMessage?.contextInfo

            if (!quoted) {
                return sock.sendMessage(from, {
                    text:
`📌💎💎 SYSTEM YA KUFUTA MESSAGE MOJA (REPLY MODE) 💎💎📌

👉✨💎 JINSI YA KUTUMIA: 💎✨👈
1. 📌💎 Reply message ya member 💎📌
2. ✍️💎 Andika.del 💎✍️
3. ⚡💎 Bot itafuta message hiyo mara moja 💎⚡

⚡🔥💎 Mfumo huu unahakikisha udhibiti wa moja kwa moja wa admin 💎🔥⚡`,
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
`🧹💥💎 MESSAGE IMEFUTWA KWA MAFANIKIO MAKUBWA 💎💥🧹

📌⚡💎 MODE: SINGLE DELETE 💎⚡📌
⚡🔥💎 STATUS: SUCCESS 💎🔥⚡
🛡️💎💎 SYSTEM: KYC BOT CONTROL ENGINE 💎💎🛡️`,
            })
        }

        // 2. MULTI DELETE
        if (isGroup && msg.startsWith(".del ")) {

            if (!(await isAdmin())) return sock.sendMessage(from, { text: securityMessage(jidNum(sender)) }, { quoted: m })

            const parts = msg.split(" ")
            const count = parseInt(parts[1]) || 1
            const target = parts[2]

            if (!target) {
                return sock.sendMessage(from, {
                    text:
`📌💎💎 SYSTEM YA KUFUTA MESSAGES NYINGI 💎💎📌

👉✨💎 FORMAT: 💎✨👈
.del 5 @user

⚡🔥💎 Hii system inaruhusu kufuta messages nyingi za user mmoja kwa udhibiti wa admin 💎🔥⚡`,
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
`🧹💥💎 MESSAGES ZIMEFUTWA KWA UFAFANUZI MKUBWA 💎💥🧹

📌👤💎 USER: ${target} 💎👤📌
📌🔢💎 COUNT: ${count} 💎🔢📌

⚡🚀💎 SYSTEM: BULK DELETE ENGINE 💎🚀⚡
🛡️💎💎 RESULT: SUCCESSFUL EXECUTION 💎💎🛡️`,
            })
        }

        // 3. DELETE ALL
        if (isGroup && msg.startsWith(".delall")) {

            if (!(await isAdmin())) return sock.sendMessage(from, { text: securityMessage(jidNum(sender)) }, { quoted: m })

            const target = msg.split(" ")[1]

            if (!target) {
                return sock.sendMessage(from, {
                    text:
`📌💎💎 SYSTEM YA KUFUTA MESSAGES ZOTE ZA USER 💎💎📌

👉✨💎 FORMAT: 💎✨👈
.delall @user

⚡🔥💎 Hii itafuta kila message ya user husika iliyohifadhiwa kwenye system 💎🔥⚡`,
                }, { quoted: m })
            }

            const jid = target.replace("@", "") + "@s.whatsapp.net"

            const msgs = (global.messageStore[from] || []).filter(x => x.sender === jid)

            for (let x of msgs) {
                await sock.sendMessage(from, { delete: x.key }).catch(() => {})
            }

            return sock.sendMessage(from, {
                text:
`🧹💥💎 MESSAGES ZOTE ZIMEFUTWA KIKAMILIFU 💎💥🧹

📌👤💎 USER: ${target} 💎👤📌

⚡🚀💎 SYSTEM: FULL CLEANUP ENGINE 💎🚀⚡
🛡️💎💎 RESULT: COMPLETE SUCCESS 💎💎🛡️`,
            })
        }

        // ================= MGENI AUTO REPLY - UPGRADED =================
        if (/\bmgeni\b/i.test(text)) {
            return sock.sendMessage(from, {
                text: loveMatchMessage()
            }, { quoted: m })
        }

    })
}

startBot()

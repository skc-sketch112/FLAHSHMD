const { makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys")
const qrcode = require("qrcode-terminal")

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("./auth")
    const sock = makeWASocket({ auth: state })

    sock.ev.on("connection.update", ({ connection, qr }) => {
        if (qr) {
    console.log("📱 Scan QR here:")
    console.log(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qr)}`)
        }          
        }
        if (connection === "open") {
            console.log("✅ Bot connected successfully!")
        }
        if (connection === "close") {
            console.log("❌ Connection closed. Restarting...")
            startBot()
        }
    })

    sock.ev.on("creds.update", saveCreds)

    // Example auto-reply
    sock.ev.on("messages.upsert", async ({ messages }) => {
        const msg = messages[0]
        if (!msg.message || msg.key.fromMe) return
        const from = msg.key.remoteJid
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text

        if (text?.toLowerCase() === "hi") {
            await sock.sendMessage(from, { text: "Hello 👋, I am alive!" })
        }
    })
}

startBot(
sock.ev.on("messages.upsert", async (m) => {
    const msg = m.messages[0]
    if (!msg.message) return

    const from = msg.key.remoteJid
    let text = ""

    if (msg.message.conversation) text = msg.message.conversation
    else if (msg.message.extendedTextMessage) text = msg.message.extendedTextMessage.text
    else if (msg.message.imageMessage && msg.message.imageMessage.caption) text = msg.message.imageMessage.caption

    if (!text) return // ignore non-text messages

    text = text.trim().toLowerCase()

    // ✅ Simple auto-reply
    if (text === "hi") {
        await sock.sendMessage(from, { text: "👋 Hello! Bot is alive." })
    }

    // ✅ Command system (prefix !)
    if (text.startsWith("!")) {
        const args = text.split(" ")
        const command = args.shift().slice(1)

        if (command === "ping") {
            await sock.sendMessage(from, { text: "🏓 Pong!" })
        }
    }
})

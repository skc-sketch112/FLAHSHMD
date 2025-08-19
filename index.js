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
        if (connection === "open") {
            console.log("✅ Bot connected successfully!")
        }
        if (connection === "close") {
            console.log("❌ Connection closed. Restarting...")
            startBot()
        }
    })
      
  sock.ev.on("messages.upsert", async (m) => {
    const msg = m.messages[0]
    if (!msg.message) return

    const from = msg.key.remoteJid
    let text = ""

    // ✅ Extract text from different message types
    if (msg.message.conversation) {
        text = msg.message.conversation
    } else if (msg.message.extendedTextMessage) {
        text = msg.message.extendedTextMessage.text
    } else if (msg.message.imageMessage && msg.message.imageMessage.caption) {
        text = msg.message.imageMessage.caption
    }

    if (!text) return
    text = text.trim().toLowerCase()

    // ✅ Test auto-reply
    if (text === "hi") {
        await sock.sendMessage(from, { text: "👋 Hello! I’m alive." })
    }

    // ✅ Example command
    if (text === "!ping") {
        await sock.sendMessage(from, { text: "🏓 Pong!" })
    }
})

const { makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys")
const qrcode = require("qrcode-terminal")

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("./auth")
    const sock = makeWASocket({ auth: state })

    sock.ev.on("connection.update", ({ connection, qr }) => {
        if (qr) {
            console.log("📱 Scan this QR code:")
            qrcode.generate(qr, { small: true })
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

startBot()

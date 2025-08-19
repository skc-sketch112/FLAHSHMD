const fs = require("fs");
const path = require("path");

// Load plugins
const plugins = new Map();
fs.readdirSync(path.join(__dirname, "plugins")).forEach(file => {
    if (file.endsWith(".js")) {
        const plugin = require(`./plugins/${file}`);
        plugins.set(plugin.name, plugin);
    }
}); fs = requ
    { makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys")
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

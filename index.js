const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion
} = require("@whiskeysockets/baileys")
const pino = require("pino")
const path = require("path")
const fs = require("fs")

async function startBot() {
    const { version } = await fetchLatestBaileysVersion()
    const authDir = path.join(__dirname, "auth_info")
    const { state, saveCreds } = await useMultiFileAuthState(authDir)

    const sock = makeWASocket({
        version,
        logger: pino({ level: "silent" }),
        printQRInTerminal: true,
        auth: state,
    })

    // 🔌 Plugin Loader
    const commands = new Map()
    const pluginsDir = path.join(__dirname, "plugins")

    if (!fs.existsSync(pluginsDir)) {
        fs.mkdirSync(pluginsDir)
        console.log("📂 'plugins' folder created. Add your plugin files inside it!")
    }

    fs.readdirSync(pluginsDir).forEach(file => {
        if (file.endsWith(".js")) {
            const cmd = require(path.join(pluginsDir, file))
            commands.set(cmd.name, cmd)
        }
    })

    // Connection handling
    sock.ev.on("connection.update", ({ connection, qr, lastDisconnect }) => {
        if (qr) {
            console.log("📲 Scan this QR to connect:")
            console.log(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qr)}`)
        }

        if (connection === "close") {
            const shouldReconnect =
                lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut
            console.log("❌ Connection closed. Reconnect:", shouldReconnect)
            if (shouldReconnect) startBot()
        } else if (connection === "open") {
            console.log("✅ Connected to WhatsApp!")
        }
    })

    sock.ev.on("creds.update", saveCreds)

    // 📩 Listen for messages
    sock.ev.on("messages.upsert", async ({ messages }) => {
        const msg = messages[0]
        if (!msg || msg.key.fromMe) return

        const sender = msg.key.remoteJid

        // Extract text message
        let textMessage =
            msg.message?.conversation ||
            msg.message?.extendedTextMessage?.text ||
            msg.message?.imageMessage?.caption ||
            msg.message?.videoMessage?.caption ||
            ""

        textMessage = textMessage.trim()
        console.log(`💬 Message from ${sender}: ${textMessage}`)

        // Prefix system
        const prefix = "."
        if (!textMessage.startsWith(prefix)) return

        cons

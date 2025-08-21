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

    // 🔗 QR Code Link
    sock.ev.on("connection.update", ({ connection, qr, lastDisconnect }) => {
        if (qr) {
            console.log("📲 Scan this QR to connect:")
            console.log(
                `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qr)}`
            )
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

    // 📦 Load Plugins
    const commands = new Map()
    fs.readdirSync("./commands").forEach(file => {
        if (file.endsWith(".js")) {
            const cmd = require(`./commands/${file}`)
            commands.set(cmd.name, cmd)
        }
    })

    // 📩 Message Handler
    sock.ev.on("messages.upsert", async ({ messages }) => {
        const msg = messages[0]
        if (!msg) return

        const sender = msg.key.remoteJid
        let textMessage =
            msg.message?.conversation ||
            msg.message?.extendedTextMessage?.text ||
            msg.message?.imageMessage?.caption ||
            msg.message?.videoMessage?.caption ||
            ""

        textMessage = textMessage.trim()
        console.log(`💬 Message from ${sender}: ${textMessage}`)

        const prefix = "."
        if (!textMessage.startsWith(prefix)) return

        const commandName = textMessage.slice(prefix.length).toLowerCase()

        if (commands.has(commandName)) {
            try {
                await commands.get(commandName).execute(sock, sender, msg)
            } catch (e) {
                console.error("❌ Command error:", e)
                await sock.sendMessage(sender, { text: "⚠️ Command error" })
            }
        }
    })
}

startBot()

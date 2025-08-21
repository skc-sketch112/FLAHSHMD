// index.js
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason
} = require("@whiskeysockets/baileys")
const pino = require("pino")
const fs = require("fs")
const path = require("path")

// 📦 Commands Map
const commands = new Map()

// 📂 Plugins Loader
const pluginsDir = path.join(__dirname, "plugins")
if (!fs.existsSync(pluginsDir)) {
  fs.mkdirSync(pluginsDir)
  console.log("📂 'plugins' folder created. Add your plugin files inside it!")
}

fs.readdirSync(pluginsDir).forEach(file => {
  if (file.endsWith(".js")) {
    try {
      const cmd = require(path.join(pluginsDir, file))
      if (cmd && cmd.name && typeof cmd.execute === "function") {
        commands.set(cmd.name, cmd)
        console.log(`✅ Loaded plugin: ${cmd.name}`)
      } else {
        console.log(`⚠️ Skipping invalid plugin (missing name/execute): ${file}`)
      }
    } catch (err) {
      console.error(`❌ Error loading plugin ${file}:`, err.message)
    }
  }
})

// 📲 Start WhatsApp Bot
async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("auth_info")
  const sock = makeWASocket({
    logger: pino({ level: "silent" }),
    printQRInTerminal: true,
    auth: state
  })

  // Show QR in link format too
  sock.ev.on("connection.update", (update) => {
    const { connection, qr } = update
    if (qr) {
      console.log("📲 Scan this QR to connect:")
      console.log(
        `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qr)}`
      )
    }
    if (connection === "close") {
      const reason = new Error(update.lastDisconnect?.error)?.output?.statusCode
      if (reason !== DisconnectReason.loggedOut) {
        console.log("❌ Connection closed. Reconnecting...")
        startBot()
      } else {
        console.log("🚪 Logged out. Delete auth_info and scan again.")
      }
    }
    if (connection === "open") {
      console.log("✅ Connected to WhatsApp!")
    }
  })

  sock.ev.on("creds.update", saveCreds)

  // 📩 Listen for messages
  sock.ev.on("messages.upsert", async (m) => {
    const msg = m.messages[0]
    if (!msg.message || msg.key.fromMe) return

    const sender = msg.key.remoteJid
    const body =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      msg.message.imageMessage?.caption ||
      ""

    if (!body) return

    const args = body.trim().split(/ +/)
    const commandName = args.shift().toLowerCase()

    if (commands.has(commandName)) {
      try {
        await commands.get(commandName).execute(sock, msg, args)
      } catch (err) {
        console.error("⚠️ Error executing command:", err)
        await sock.sendMessage(sender, { text: "❌ Error running command!" })
      }
    }
  })
}

startBot()

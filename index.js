const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion
} = require("@whiskeysockets/baileys");

const pino = require("pino");
const fs = require("fs");
const path = require("path");

// ==========================
// 🔥 Plugin Loader
// ==========================
const plugins = {};
function loadPlugins() {
  const pluginDir = path.join(__dirname, "plugins");
  if (!fs.existsSync(pluginDir)) fs.mkdirSync(pluginDir);

  fs.readdirSync(pluginDir).forEach((file) => {
    if (file.endsWith(".js")) {
      const plugin = require(path.join(pluginDir, file));
      plugins[plugin.name] = plugin;
      console.log(`✅ Plugin loaded: ${plugin.name}`);
    }
  });
}
loadPlugins();

// ==========================
// 🔥 WhatsApp Connection
// ==========================
async function startSock() {
  const { state, saveCreds } = await useMultiFileAuthState("./session");
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    logger: pino({ level: "silent" }),
    auth: state,
    version,
    printQRInTerminal: true // QR for local use
  });

  // 🔑 Pairing code method (for Render/Heroku)
  if (!sock.authState.creds.registered) {
    const phoneNumber = process.env.PHONE_NUMBER; // Set in Render ENV
    if (update.pairingCode) {
    console.log("🔑 Pairing Code:", update.pairingCode);
    }
    
    }
  }

  // Save session
  sock.ev.on("creds.update", saveCreds);

  // Auto reconnect
  sock.ev.on("connection.update", (update) => {
    const { connection } = update;
    if (connection === "close") {
      console.log("❌ Connection closed. Reconnecting...");
      startSock();
    } else if (connection === "open") {
      console.log("✅ Connected to WhatsApp!");
    }
  });

  // ==========================
  // 🔥 Message Handler
  // ==========================
  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const from = msg.key.remoteJid;
    const type = Object.keys(msg.message)[0];
    const body =
      type === "conversation"
        ? msg.message.conversation
        : type === "extendedTextMessage"
        ? msg.message.extendedTextMessage.text
        : "";

    if (!body.startsWith("!")) return; // Command prefix
    const [cmd, ...args] = body.slice(1).split(" ");

    if (plugins[cmd]) {
      try {
        await plugins[cmd].run(sock, msg, args);
      } catch (err) {
        console.error(`❌ Error in ${cmd}:`, err);
        await sock.sendMessage(from, { text: "⚠️ Error running command" });
      }
    } else {
      await sock.sendMessage(from, { text: "❌ Unknown command" });
    }
  });
}

startSock();

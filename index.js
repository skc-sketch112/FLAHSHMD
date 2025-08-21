const {
  default: makeWASocket,
  useMultiFileAuthState
} = require("@whiskeysockets/baileys");
const express = require("express");
const qrcode = require("qrcode");
const pino = require("pino");
const fs = require("fs");
const path = require("path");

// Store latest QR
let latestQR = null;

// Load all plugins
const plugins = {};
function loadPlugins() {
  const pluginPath = path.join(__dirname, "plugins");
  if (!fs.existsSync(pluginPath)) fs.mkdirSync(pluginPath);

  fs.readdirSync(pluginPath).forEach((file) => {
    if (file.endsWith(".js")) {
      const pluginName = file.replace(".js", "");
      try {
        const plugin = require(path.join(pluginPath, file));
        plugins[pluginName] = plugin;
        console.log(`✅ Loaded plugin: ${pluginName}`);
      } catch (err) {
        console.error(`❌ Failed to load plugin ${pluginName}:`, err);
      }
    }
  });
}

// Start bot
async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("./auth_info");

  const sock = makeWASocket({
    printQRInTerminal: false, // QR will be on web instead
    auth: state,
    logger: pino({ level: "silent" })
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      latestQR = qr;
      console.log("📲 New QR generated. Open /qr in browser to scan.");
    }

    if (connection === "open") {
      console.log("✅ Bot connected!");
      latestQR = null;
    }

    if (connection === "close") {
      console.log("⚠️ Connection closed. Reconnecting...");
      startBot();
    }
  });

  // Handle commands
  sock.ev.on("messages.upsert", async ({ messages }) => {
    const m = messages[0];
    if (!m.message || m.key.fromMe) return;

    const from = m.key.remoteJid;
    const text =
      m.message.conversation ||
      m.message.extendedTextMessage?.text ||
      "";

    if (!text.startsWith("!")) return;

    const [cmd, ...args] = text.slice(1).trim().split(" ");
    const command = cmd.toLowerCase();

    if (plugins[command]) {
      try {
        await plugins[command].run(sock, from, args, m);
      } catch (err) {
        console.error(`❌ Error in plugin ${command}:`, err);
        await sock.sendMessage(from, { text: "⚠️ Error executing command." });
      }
    } else {
      await sock.sendMessage(from, { text: `❌ Unknown command: ${command}` });
    }
  });
}

// Web server to show QR
const app = express();

app.get("/", (req, res) => {
  res.send(
    "✅ WhatsApp Bot is running.<br/>Go to <a href='/qr'>/qr</a> to scan QR."
  );
});

app.get("/qr", async (req, res) => {
  if (!latestQR) {
    return res.send("No QR available (already connected or not generated yet).");
  }
  const qrImage = await qrcode.toDataURL(latestQR);
  res.send(`<h2>📲 Scan this QR with WhatsApp</h2><img src="${qrImage}"/>`);
});

// Start web server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌐 Server running on http://localhost:${PORT}`);
});

// Load plugins and start bot
loadPlugins();
startBot();

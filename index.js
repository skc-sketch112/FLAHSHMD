const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion
} = require("@whiskeysockets/baileys");
const fs = require("fs");
const path = require("path");
const readline = require("readline");
const pino = require("pino");

// 📌 Console input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
function ask(q) {
  return new Promise((res) => rl.question(q, res));
}

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("./auth_info");
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    logger: pino({ level: "silent" }),
    printQRInTerminal: false // ❌ No QR
  });

  sock.ev.on("creds.update", saveCreds);

  // 🔄 Connection status
  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === "open") console.log("✅ Bot connected successfully!");
    else if (connection === "close") {
      console.log("⚠️ Connection closed, reconnecting...");
      startBot();
    }
  });

  // 📌 First-time login with phone number
  if (!state.creds.registered) {
    const phoneNumber = await ask("📲 Enter WhatsApp number with country code (e.g., +919876543210): ");
    const code = await sock.requestPairingCode(phoneNumber.trim());
    console.log(`🔑 Your pairing code is: ${code}`);
    console.log("👉 Enter this code in WhatsApp → Linked Devices → Link with code.");
    rl.close();
  }

  // 📂 Load plugins dynamically
  const plugins = {};
  const pluginsDir = path.join(__dirname, "plugins");

  function loadPlugins() {
    fs.readdirSync(pluginsDir).forEach((file) => {
      if (file.endsWith(".js")) {
        const pluginPath = path.join(pluginsDir, file);
        delete require.cache[require.resolve(pluginPath)];
        try {
          const plugin = require(pluginPath);
          plugins[plugin.name] = plugin;
          console.log(`✅ Loaded plugin: ${plugin.name}`);
        } catch (err) {
          console.error(`❌ Error loading ${file}:`, err);
        }
      }
    });
  }

  loadPlugins();

  // 📌 Command handler
  sock.ev.on("messages.upsert", async ({ messages }) => {
    const m = messages[0];
    if (!m.message || m.key.fromMe) return;

    const from = m.key.remoteJid;
    const text =
      m.message.conversation ||
      m.message.extendedTextMessage?.text ||
      "";

    if (!text.startsWith("!")) return;
    const args = text.trim().split(/\s+/);
    const command = args.shift().slice(1).toLowerCase();

    if (plugins[command]) {
      try {
        await plugins[command].run(sock, from, args, m);
      } catch (e) {
        console.error(`❌ Error in command ${command}:`, e);
        await sock.sendMessage(from, { text: "⚠️ Error executing command." });
      }
    } else {
      await sock.sendMessage(from, { text: `❌ Unknown command: ${command}` });
    }
  });
}

startBot();

// index.js
const {
    default: makeWASocket,
    useMultiFileAuthState,
    fetchLatestBaileysVersion
} = require("@whiskeysockets/baileys");
const fs = require("fs");
const path = require("path");

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("auth_info");
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: false // disable QR in terminal
    });

    sock.ev.on("creds.update", saveCreds);

    // If first time login → show pairing code in console
    if (!sock.authState.creds.registered) {
        const code = await sock.requestPairingCode("91XXXXXXXXXX"); // <- your phone number with country code
        console.log(`🔗 Pairing Code: ${code}`);
        console.log("⚡ Open WhatsApp > Linked Devices > Link with phone number > Enter this code.");
    }

    // 📂 Load plugins dynamically
    const plugins = [];
    const pluginDir = path.join(__dirname, "plugins");

    fs.readdirSync(pluginDir).forEach(file => {
        if (file.endsWith(".js")) {
            try {
                const plugin = require(path.join(pluginDir, file));
                plugins.push(plugin);
                console.log(`✅ Loaded plugin: ${plugin.name || file}`);
            } catch (err) {
                console.error(`❌ Failed to load plugin ${file}:`, err);
            }
        }
    });

    // 📩 Message handler
    sock.ev.on("messages.upsert", async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const jid = msg.key.remoteJid;
        const text =
            msg.message.conversation ||
            msg.message.extendedTextMessage?.text ||
            msg.message.imageMessage?.caption ||
            "";

        plugins.forEach(plugin => {
            try {
                plugin.run(sock, msg, jid, text);
            } catch (err) {
                console.error(`${plugin.name || "Unknown plugin"} error:`, err);
            }
        });
    });
}

startBot().catch(err => console.error("❌ Bot crashed:", err));

const {
    makeWASocket,
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const fs = require("fs");
const path = require("path");

// 🔥 Load all plugins dynamically
let plugins = {};
function loadPlugins() {
    plugins = {};
    const pluginDir = path.join(__dirname, "plugins");
    if (!fs.existsSync(pluginDir)) fs.mkdirSync(pluginDir);

    fs.readdirSync(pluginDir).forEach((file) => {
        if (file.endsWith(".js")) {
            try {
                let plugin = require(path.join(pluginDir, file));
                plugins[plugin.name] = plugin;
                console.log(`✅ Loaded plugin: ${plugin.name}`);
            } catch (e) {
                console.log(`❌ Failed to load plugin ${file}:`, e);
            }
        }
    });
}

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("./session");
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        logger: pino({ level: "silent" }),
        printQRInTerminal: true,
        auth: state,
        browser: ["Ubuntu", "Chrome", "20.0.04"],
    });

    // 🔥 Pairing Code login
    if (!sock.authState.creds.registered) {
        const phoneNumber = process.env.NUMBER || "";
        if (!phoneNumber) {
            console.log("❌ Please set NUMBER=your_whatsapp_number_with_countrycode in env.");
            process.exit(1);
        }
        let code = await sock.requestPairingCode(phoneNumber);
        console.log("✅ Your Pairing Code:", code);
        console.log("📱 Open WhatsApp → Linked Devices → Link with Phone Number → Enter this code.");
    }

    sock.ev.on("connection.update", (update) => {
        const { connection } = update;
        if (connection === "close") {
            console.log("❌ Connection closed. Reconnecting...");
            startBot();
        } else if (connection === "open") {
            console.log("✅ Successfully connected to WhatsApp!");
        }
    });

    sock.ev.on("creds.update", saveCreds);

    // 🔥 Message handler with prefix !
    sock.ev.on("messages.upsert", async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const from = msg.key.remoteJid;
        const text =
            msg.message.conversation ||
            msg.message.extendedTextMessage?.text ||
            "";

        if (!text.startsWith("!")) return; // only commands with "."
        const [command, ...args] = text.slice(1).trim().split(/\s+/);

        if (plugins[command]) {
            try {
                await plugins[command].run(sock, msg, args);
            } catch (e) {
                console.error(`❌ Error in plugin ${command}:`, e);
                await sock.sendMessage(from, { text: "⚠️ Error while executing command." });
            }
        } else {
            await sock.sendMessage(from, { text: "❓ Unknown command." });
        }
    });
}

// load all plugins before start
loadPlugins();
startBot();

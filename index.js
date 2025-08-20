// index.js
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys");
const pino = require("pino");
const fs = require("fs");
const path = require("path");

// Command prefix
const PREFIX = "!";

// Load plugins
let plugins = {};
function loadPlugins() {
    plugins = {};
    const pluginDir = path.join(__dirname, "plugins");
    if (!fs.existsSync(pluginDir)) fs.mkdirSync(pluginDir);

    const files = fs.readdirSync(pluginDir).filter(file => file.endsWith(".js"));
    for (const file of files) {
        const plugin = require(path.join(pluginDir, file));
        if (plugin.name && plugin.run) {
            plugins[plugin.name] = plugin;
            console.log(`✅ Loaded plugin: ${plugin.name}`);
        }
    }
}

// Start bot
async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("session");

    const sock = makeWASocket({
        logger: pino({ level: "silent" }),
        printQRInTerminal: true,
        auth: state
    });

    // Save creds
    sock.ev.on("creds.update", saveCreds);

    // Connection updates
    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === "close") {
            const reason = new Error(lastDisconnect?.error)?.output?.statusCode;
            if (reason === DisconnectReason.loggedOut) {
                console.log("❌ Logged out. Scan QR again!");
                startBot();
            } else {
                console.log("🔄 Reconnecting...");
                startBot();
            }
        } else if (connection === "open") {
            console.log("✅ Bot connected!");
        }
    });

    // Listen for messages
    sock.ev.on("messages.upsert", async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message) return;

        const from = msg.key.remoteJid;
        const body =
            msg.message.conversation ||
            msg.message.extendedTextMessage?.text ||
            msg.message.imageMessage?.caption ||
            "";

        if (!body.startsWith(PREFIX)) return;

        const args = body.slice(PREFIX.length).trim().split(/ +/);
        const command = args.shift().toLowerCase();

        if (plugins[command]) {
            try {
                await plugins[command].run(sock, from, args, msg);
            } catch (err) {
                console.error(`❌ Error in command ${command}:`, err);
                await sock.sendMessage(from, { text: "⚠️ Error executing command." });
            }
        }
    });

    return sock;
}

// Load plugins and start bot
loadPlugins();
startBot();

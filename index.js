// index.js
const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason
} = require("@whiskeysockets/baileys");
const qrcode = require("qrcode-terminal");
const pino = require("pino");
const fs = require("fs");
const path = require("path");

const prefix = "."; // command prefix
let plugins = new Map();

async function loadPlugins(sock) {
    const pluginsDir = path.join(__dirname, "plugins");

    if (!fs.existsSync(pluginsDir)) {
        fs.mkdirSync(pluginsDir);
    }

    plugins.clear();
    fs.readdirSync(pluginsDir).forEach(file => {
        if (file.endsWith(".js")) {
            const plugin = require(path.join(pluginsDir, file));
            if (plugin.name && typeof plugin.run === "function") {
                plugins.set(plugin.name, plugin);
                console.log(`✅ Loaded plugin: ${plugin.name}`);
            }
        }
    });
}

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("session");

    const sock = makeWASocket({
        logger: pino({ level: "silent" }),
        auth: state,
        printQRInTerminal: true, // prints QR in console
    });

    // load all plugins
    await loadPlugins(sock);

    sock.ev.on("creds.update", saveCreds);

    // Connection & QR
    sock.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            // Show QR as link
            const qrLink = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qr)}`;
            console.log("📱 Scan QR from console OR open this link to scan:\n", qrLink);
        }

        if (connection === "close") {
            const reason = new Error(lastDisconnect?.error)?.output?.statusCode;
            if (reason === DisconnectReason.loggedOut) {
                console.log("❌ Session logged out. Delete 'session' folder and restart.");
                fs.rmSync("session", { recursive: true, force: true });
                startBot();
            } else {
                console.log("🔄 Reconnecting...");
                startBot();
            }
        }

        if (connection === "open") {
            console.log("✅ Bot connected to WhatsApp!");
        }
    });

    // Message handler
    sock.ev.on("messages.upsert", async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const from = msg.key.remoteJid;
        const type = Object.keys(msg.message)[0];
        const text =
            type === "conversation"
                ? msg.message.conversation
                : type === "extendedTextMessage"
                ? msg.message.extendedTextMessage.text
                : "";

        if (!text.startsWith(prefix)) return;

        const args = text.slice(prefix.length).trim().split(/ +/);
        const command = args.shift().toLowerCase();

        if (plugins.has(command)) {
            try {
                await plugins.get(command).run(sock, from, args, msg);
            } catch (err) {
                console.error(`❌ Error in ${command}:`, err);
                await sock.sendMessage(from, { text: "⚠️ Error while running command." });
            }
        }
    });

    return sock;
}

startBot();

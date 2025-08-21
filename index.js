const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const fs = require("fs");
const path = require("path");

// ✅ Parse text from any type of message
function getTextMessage(msg) {
    if (!msg.message) return "";

    if (msg.message.conversation) return msg.message.conversation;
    if (msg.message.extendedTextMessage) return msg.message.extendedTextMessage.text;
    if (msg.message.imageMessage && msg.message.imageMessage.caption) return msg.message.imageMessage.caption;
    if (msg.message.videoMessage && msg.message.videoMessage.caption) return msg.message.videoMessage.caption;

    return "";
}

// ✅ Load plugins
function loadPlugins() {
    const plugins = {};
    const pluginDir = path.join(__dirname, "plugins");

    if (!fs.existsSync(pluginDir)) {
        fs.mkdirSync(pluginDir);
    }

    fs.readdirSync(pluginDir).forEach(file => {
        if (file.endsWith(".js")) {
            try {
                const plugin = require(path.join(pluginDir, file));
                if (plugin.name && plugin.run) {
                    plugins[plugin.name] = plugin;
                    console.log(`✅ Loaded plugin: ${plugin.name}`);
                }
            } catch (err) {
                console.error(`❌ Failed to load plugin ${file}:`, err);
            }
        }
    });

    return plugins;
}

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("session");

    const sock = makeWASocket({
        logger: pino({ level: "silent" }),
        auth: state,
        printQRInTerminal: true,
    });

    sock.ev.on("creds.update", saveCreds);

    const plugins = loadPlugins();
    const prefix = ".";

    sock.ev.on("messages.upsert", async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const text = getTextMessage(msg);
        const from = msg.key.remoteJid;

        console.log("📩 New message:", text);

        if (!text.startsWith(prefix)) return;

        const args = text.slice(prefix.length).trim().split(/ +/);
        const cmd = args.shift().toLowerCase();

        if (plugins[cmd]) {
            try {
                await plugins[cmd].run(sock, from, args, msg);
            } catch (err) {
                console.error(`❌ Error running command ${cmd}:`, err);
            }
        }
    });

    sock.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
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

    return sock;
}

startBot();

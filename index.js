  const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
} = require("@whiskeysockets/baileys");
const P = require("pino");
const qrcode = require("qrcode-terminal");
const fs = require("fs");
const path = require("path");

// 🔌 Plugin loader
function loadPlugins(sock) {
    const pluginsDir = path.join(__dirname, "plugins");
    fs.readdirSync(pluginsDir).forEach(file => {
        if (file.endsWith(".js")) {
            try {
                const plugin = require(path.join(pluginsDir, file));
                if (plugin && typeof plugin.run === "function") {
                    console.log(`✅ Plugin loaded: ${file.replace(".js", "")}`);
                    plugin.run(sock);
                }
            } catch (err) {
                console.error(`❌ Failed to load plugin ${file}:`, err.message);
            }
        }
    });
}

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("./auth");

    const sock = makeWASocket({
        auth: state,
        logger: P({ level: "silent" }),
    });

    // 🔑 Handle connection updates
    sock.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect, qr, pairingCode } = update;

        if (qr) {
            console.log("📲 Scan this QR to log in:");
            qrcode.generate(qr, { small: true });
        }

        if (pairingCode) {
            console.log("🔑 Pairing Code:", pairingCode);
        }

        if (connection === "close") {
            const shouldReconnect =
                lastDisconnect?.error?.output?.statusCode !==
                DisconnectReason.loggedOut;
            console.log("❌ Connection closed, reconnecting:", shouldReconnect);
            if (shouldReconnect) startBot();
        } else if (connection === "open") {
            console.log("✅ Successfully connected to WhatsApp!");
        }
    });

    // 🔐 Save creds when updated
    sock.ev.on("creds.update", saveCreds);

    // 🔌 Load plugins
    loadPlugins(sock);
}

startBot();

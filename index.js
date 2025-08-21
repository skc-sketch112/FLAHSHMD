const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const fs = require("fs");
const path = require("path");
const qrcode = require("qrcode");
const open = require("open"); // auto open QR link in browser

// 🔌 Load Plugins Automatically
const plugins = {};
const pluginFiles = fs.readdirSync(path.join(__dirname, "plugins")).filter(f => f.endsWith(".js"));
for (const file of pluginFiles) {
    const plugin = require(path.join(__dirname, "plugins", file));
    plugins[plugin.name] = plugin;
    console.log(`✅ Loaded plugin: ${plugin.name}`);
}

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("session");

    const sock = makeWASocket({
        logger: pino({ level: "silent" }),
        printQRInTerminal: false, // ❌ disable terminal QR
        auth: state
    });

    // 🔗 Connection updates
    sock.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect, qr } = update;

        // ✅ Show QR as Link + auto open in browser
        if (qr) {
            qrcode.toDataURL(qr, async (err, url) => {
                if (err) return console.error("QR Error:", err);
                console.log("🔗 Scan QR in your browser:", url);
                await open(url); // opens automatically in default browser
            });
        }

        if (connection === "close") {
            const reason = lastDisconnect?.error?.output?.statusCode;
            if (reason === DisconnectReason.loggedOut) {
                console.log("❌ Logged out. Delete session and restart.");
                process.exit(1);
            } else {
                console.log("🔄 Reconnecting...");
                startBot();
            }
        } else if (connection === "open") {
            console.log("✅ Bot connected!");
        }
    });

    sock.ev.on("creds.update", saveCreds);

    // 📩 Command Handler
    sock.ev.on("messages.upsert", async ({ messages }) => {
        const m = messages[0];
        if (!m.message) return;

        const from = m.key.remoteJid;
        const body = m.message.conversation || m.message.extendedTextMessage?.text;
        if (!body) return;

        if (body.startsWith("!")) {
            const args = body.slice(1).trim().split(/ +/);
            const command = args.shift().toLowerCase();

            if (plugins[command]) {
                try {
                    await plugins[command].run(sock, from, args, m);
                } catch (err) {
                    console.error(`❌ Error running ${command}:`, err);
                    await sock.sendMessage(from, { text: "⚠️ Error running command." });
                }
            } else {
                await sock.sendMessage(from, { text: `❌ Unknown command: ${command}` });
            }
        }
    });
}

startBot();

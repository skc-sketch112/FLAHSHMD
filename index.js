// index.js
const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const fs = require("fs");

// ✅ Extract plain text from any WhatsApp message
function getText(msg) {
    try {
        if (!msg.message) return "";

        if (msg.message.conversation) return msg.message.conversation;
        if (msg.message.extendedTextMessage) return msg.message.extendedTextMessage.text;
        if (msg.message.imageMessage?.caption) return msg.message.imageMessage.caption;
        if (msg.message.videoMessage?.caption) return msg.message.videoMessage.caption;

        if (msg.message.ephemeralMessage) return getText(msg.message.ephemeralMessage.message);
        if (msg.message.viewOnceMessageV2) return getText(msg.message.viewOnceMessageV2.message);

    } catch (e) {
        console.error("❌ getText error:", e);
    }
    return "";
}

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("session");

    const sock = makeWASocket({
        logger: pino({ level: "silent" }),
        auth: state,
        printQRInTerminal: true // show QR in console
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            // ✅ Generate a scan link with online QR
            const qrLink = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qr)}`;
            console.log("\n📱 Scan this QR in console OR open this link in browser:");
            console.log(qrLink, "\n");
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

    // ✅ Handle incoming messages
    sock.ev.on("messages.upsert", async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const from = msg.key.remoteJid;
        const text = getText(msg);

        console.log("📩 RAW TEXT:", text);

        if (!text) return;
        if (!text.startsWith(".")) return;

        const args = text.slice(1).trim().split(/ +/);
        const cmd = args.shift().toLowerCase();

        console.log("⚡ Command:", cmd);

        if (cmd === "ping") {
            await sock.sendMessage(from, { text: "🏓 Pong! Bot is alive." });
        } else if (cmd === "menu") {
            await sock.sendMessage(from, { text: "✨ Menu:\n• .ping\n• .menu" });
        } else {
            await sock.sendMessage(from, { text: `❌ Unknown command: ${cmd}` });
        }
    });

    return sock;
}

startBot();

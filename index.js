// index.js
const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const fs = require("fs");
const path = require("path");

// ✅ Universal text extractor
function extractMessageText(msg) {
    try {
        const m = msg.message;
        if (!m) return "";

        if (m.conversation) return m.conversation;
        if (m.extendedTextMessage) return m.extendedTextMessage.text;
        if (m.imageMessage?.caption) return m.imageMessage.caption;
        if (m.videoMessage?.caption) return m.videoMessage.caption;
        if (m.buttonsResponseMessage) return m.buttonsResponseMessage.selectedButtonId;
        if (m.listResponseMessage) return m.listResponseMessage.singleSelectReply.selectedRowId;
        if (m.ephemeralMessage) return extractMessageText(m.ephemeralMessage.message);
        if (m.viewOnceMessageV2) return extractMessageText(m.viewOnceMessageV2.message);
    } catch (e) {
        console.error("❌ extractMessageText error:", e);
    }
    return "";
}

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("session");

    const sock = makeWASocket({
        logger: pino({ level: "silent" }),
        auth: state,
        printQRInTerminal: true
    });

    sock.ev.on("creds.update", saveCreds);

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

    // ✅ Message handler
    const prefix = ".";
    sock.ev.on("messages.upsert", async ({ messages }) => {
        const msg = messages[0];

        // 🔍 Debug: log raw message
        console.log("📩 RAW MESSAGE:", JSON.stringify(msg, null, 2));

        if (!msg.message || msg.key.fromMe) return;

        const from = msg.key.remoteJid;
        const text = extractMessageText(msg);

        if (!text) return;
        if (!text.startsWith(prefix)) return;

        const args = text.slice(prefix.length).trim().split(/ +/);
        const cmd = args.shift().toLowerCase();

        console.log("⚡ Command detected:", cmd);

        // ✅ Basic built-in commands
        if (cmd === "ping") {
            await sock.sendMessage(from, { text: "🏓 Pong! Bot is alive." });
        } else if (cmd === "menu") {
            await sock.sendMessage(from, {
                text: `✨ *Bot Menu* ✨\n\n• .ping - Test bot\n• .menu - Show this menu`
            });
        } else {
            await sock.sendMessage(from, { text: `❌ Unknown command: ${cmd}` });
        }
    });

    return sock;
}

startBot();

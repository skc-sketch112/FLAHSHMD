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

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("session");

    const sock = makeWASocket({
        logger: pino({ level: "silent" }),
        auth: state,
        printQRInTerminal: true, // still prints in console
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            // Generate QR code link
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

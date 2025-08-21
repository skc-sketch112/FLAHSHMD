// index.js
const {
    makeWASocket,
    useMultiFileAuthState,
    makeCacheableSignalKeyStore,
    Browsers
} = require("@whiskeysockets/baileys");
const P = require("pino");

async function connectBot() {
    const { state, saveCreds } = await useMultiFileAuthState("session");

    const sock = makeWASocket({
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, P({ level: "silent" }))
        },
        // 🚫 Disable QR output completely
        printQRInTerminal: false,
        logger: P({ level: "silent" }),
        browser: Browsers.macOS("Safari")
    });

    sock.ev.on("connection.update", async (update) => {
        const { connection } = update;

        if (connection === "open") {
            console.log("✅ Bot connected successfully!");
        }

        if (connection === "close") {
            console.log("❌ Connection closed. Reconnecting...");
            connectBot();
        }

        // ✅ Only run pairing code login once
        if (!state.creds.registered) {
            let phoneNumber = process.env.NUMBER; // set in ENV: +919876543210
            if (!phoneNumber) {
                console.log("⚠️ Please set NUMBER in environment variables.");
                return;
            }
            try {
                const code = await sock.requestPairingCode(phoneNumber);
                console.log(`🔑 Pairing code for ${phoneNumber}: ${code}`);
            } catch (e) {
                console.error("❌ Failed to get pairing code:", e);
            }
        }
    });

    sock.ev.on("creds.update", saveCreds);

    // Simple command handler
    sock.ev.on("messages.upsert", async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const from = msg.key.remoteJid;
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text;

        if (!text) return;

        if (text === "!ping") {
            await sock.sendMessage(from, { text: "🏓 Pong!" });
        }
    });
}

connectBot();

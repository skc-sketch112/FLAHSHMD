const {
    makeWASocket,
    useMultiFileAuthState,
    DisconnectReason
} = require("@whiskeysockets/baileys");
const fs = require("fs");
const path = require("path");

const prefix = "!"; // change your command prefix here

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("auth_info");

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false // QR is disabled, using pairing code instead
    });

    // 🔑 Pairing code login
    if (!sock.authState.creds.registered) {
        try {
            const code = await sock.requestPairingCode("91XXXXXXXXXX"); // your number here
            console.log(`🔗 Pairing Code: ${code}`);
            console.log("⚡ Enter this code in WhatsApp > Linked Devices > Link with phone number.");
        } catch (err) {
            console.error("❌ Pairing code error:", err);
        }
    }

    // 🔄 Save session
    sock.ev.on("creds.update", saveCreds);

    // 📦 Load plugins dynamically
    const plugins = new Map();
    const pluginsDir = path.join(__dirname, "plugins");

    if (fs.existsSync(pluginsDir)) {
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

    // 💬 Handle messages
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
                await sock.sendMessage(from, { text: "⚠️ Command error." });
            }
        }
    });

    // 🔌 Connection handling
    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === "close") {
            const shouldReconnect =
                lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log("Connection closed. Reconnecting:", shouldReconnect);
            if (shouldReconnect) startBot();
        } else if (connection === "open") {
            console.log("✅ Connected to WhatsApp");
        }
    });
}

startBot();

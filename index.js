const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys");
const fs = require("fs");
const path = require("path");

// --- Load plugins ---
const plugins = new Map();
fs.readdirSync(path.join(__dirname, "plugins")).forEach(file => {
    if (file.endsWith(".js")) {
        const plugin = require(`./plugins/${file}`);
        plugins.set(plugin.name, plugin);
    }
});

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("auth");
    const sock = makeWASocket({ auth: state, printQRInTerminal: true }); // ✅ QR will show in terminal

    // ✅ Auto-reconnect if disconnected
    sock.ev.on("connection.update", (update) => {
      if (qr) {
    console.log("📱 Scan QR here:")
    console.log(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qr)}`
        const { connection, lastDisconnect } = update;
        if (connection === "close") {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log("❌ Connection closed. Reconnecting...", shouldReconnect);
            if (shouldReconnect) {
                startBot();
            }
        } else if (connection === "open") {
            console.log("✅ Bot connected successfully!");
        }
    });

    // ✅ Listen to messages
    sock.ev.on("messages.upsert", async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message) return;

        const from = msg.key.remoteJid;
        const text =
            msg.message.conversation ||
            msg.message.extendedTextMessage?.text ||
            msg.message.imageMessage?.caption;

        if (!text) return;

        // ✅ Command handler
        if (text.startsWith("!")) {
            const args = text.slice(1).trim().split(" ");
            const command = args.shift().toLowerCase();

            const plugin = plugins.get(command);
            if (plugin) {
                try {
                    await plugin.run(sock, from, args, plugins);
                } catch (err) {
                    await sock.sendMessage(from, { text: `⚠️ Error: ${err.message}` });
                }
            } else {
                await sock.sendMessage(from, { text: `❌ Unknown command: ${command}\nType *!menu* for help.` });
            }
        }
    });

    sock.ev.on("creds.update", saveCreds);
}

startBot();

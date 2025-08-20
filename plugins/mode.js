// plugins/mode.js

let botMode = "public"; // default mode

// set your owner number (without +, just countrycode+number)
const ownerNumber = "919476189681"; // example: India number

module.exports = {
    name: "mode",
    description: "Change bot working mode (public/self)",
    run: async (sock, from, args, msg) => {
        try {
            const sender = msg.key.participant || msg.key.remoteJid;

            // Normalize number (remove @s.whatsapp.net)
            const senderNumber = sender.replace(/[@:.]/g, "").replace("swhatsappnet", "");

            // Check if user is owner
            if (!sender.includes(ownerNumber)) {
                return sock.sendMessage(from, { text: "❌ Only bot owner can change mode." });
            }

            // Show current mode
            if (!args[0]) {
                return sock.sendMessage(from, { 
                    text: `⚙️ Current Mode: *${botMode.toUpperCase()}*\n\nUsage:\n👉 !mode public\n👉 !mode self`
                });
            }

            const newMode = args[0].toLowerCase();

            if (newMode !== "public" && newMode !== "self") {
                return sock.sendMessage(from, { 
                    text: "⚠️ Invalid mode. Available: `public`, `self`"
                });
            }

            botMode = newMode;

            await sock.sendMessage(from, { 
                text: `✅ Bot mode changed to *${botMode.toUpperCase()}*`
            });

        } catch (err) {
            console.error("Mode command error:", err);
            await sock.sendMessage(from, { text: "❌ Error changing mode. See logs." });
        }
    },
    getMode: () => botMode
};

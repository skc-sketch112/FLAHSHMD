// plugins/mode.js

let botMode = "public"; // default mode

module.exports = {
    name: "mode",
    description: "Change bot working mode (public/self)",
    run: async (sock, from, args, msg, isOwner) => {
        try {
            if (!isOwner) {
                return sock.sendMessage(from, { text: "❌ Only bot owner can change mode." });
            }

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
            await sock.sendMessage(from, { text: "❌ Error changing mode." });
        }
    },
    getMode: () => botMode // helper function to check mode in other plugins
};

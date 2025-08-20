module.exports = {
    name: "moon",
    description: "Send a moon 🌙",
    run: async (sock, from) => {
        try {
            const moons = [
                "🌙",
                "🌕",
                "🌖",
                "🌗",
                "🌘",
                "🌑",
                "🌒",
                "🌓",
                "🌔",
                "🌝",
                "🌚",
                "🌙✨🌙✨🌙"
            ];

            const msg = moons[Math.floor(Math.random() * moons.length)];
            await sock.sendMessage(from, { text: `🌙 *Shining bright like the moon...*\n\n${msg}` });
        } catch (err) {
            console.error("Moon command error:", err);
            await sock.sendMessage(from, { text: "❌ Failed to send moon. Try again later." });
        }
    }
};

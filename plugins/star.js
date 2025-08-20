module.exports = {
    name: "star",
    description: "Send shining stars ✨",
    run: async (sock, from) => {
        try {
            const stars = [
                "⭐",
                "✨",
                "🌟",
                "💫",
                "🌠",
                "⭐️⭐️⭐️⭐️⭐️",
                "✨✨✨✨✨",
                "🌟🌟🌟🌟🌟"
            ];

            const msg = stars[Math.floor(Math.random() * stars.length)];
            await sock.sendMessage(from, { text: `🌌 *Wishing upon a star...*\n\n${msg}` });
        } catch (err) {
            console.error("Star command error:", err);
            await sock.sendMessage(from, { text: "❌ Failed to send stars. Try again later." });
        }
    }
};

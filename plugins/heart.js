module.exports = {
    name: "heart",
    description: "Send a lovely heart ❤️",
    run: async (sock, from) => {
        try {
            const hearts = [
                "❤️",
                "💖",
                "💕",
                "💞",
                "💘",
                "💓",
                "💗",
                "❣️",
                "💟",
                "😍❤️😍❤️😍"
            ];

            const asciiHearts = [
                "❣️❣️❣️❣️❣️",
                "💖💖💖💖💖",
                "💕💕💕💕💕",
                "💘  💘\n 💘💘\n  💘"
            ];

            // Randomly choose between normal hearts and ASCII styled hearts
            const msg = Math.random() > 0.5 
                ? hearts[Math.floor(Math.random() * hearts.length)] 
                : asciiHearts[Math.floor(Math.random() * asciiHearts.length)];

            await sock.sendMessage(from, { text: `💌 *Here’s a heart for you:*\n\n${msg}` });

        } catch (err) {
            console.error("Heart command error:", err);
            await sock.sendMessage(from, { text: "❌ Failed to send heart. Try again later." });
        }
    }
};

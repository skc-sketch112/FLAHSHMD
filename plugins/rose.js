module.exports = {
    name: "rose",
    description: "Send a beautiful rose 🌹",
    run: async (sock, from) => {
        try {
            const roses = [
                "🌹",
                "🥀",
                "🌺",
                "🌷",
                "🌹🌹🌹🌹🌹",
                "🌹❤️🌹❤️🌹",
                "🌹🌹🌹\n🌹🌹🌹\n🌹🌹🌹"
            ];

            const msg = roses[Math.floor(Math.random() * roses.length)];
            await sock.sendMessage(from, { text: `💐 *A rose for you...*\n\n${msg}` });
        } catch (err) {
            console.error("Rose command error:", err);
            await sock.sendMessage(from, { text: "❌ Failed to send rose. Try again later." });
        }
    }
};

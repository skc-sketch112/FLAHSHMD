// plugins/morning.js
module.exports = {
    name: "morning",
    description: "Send a beautiful good morning message",
    run: async (sock, from, args, msg) => {
        try {
            const sender = msg.pushName || "Friend";

            const messages = [
                `🌞 Good Morning, ${sender}! 🌸\nMay your day be filled with positivity and success.`,
                `✨ Rise and shine, ${sender}! ☕ Wishing you a day full of smiles.`,
                `🌻 Hello ${sender}, wake up with determination and go to bed with satisfaction. 🌅`,
                `🌼 Good Morning ${sender}! 🌞\nLet your day be as bright as your smile.`
            ];

            // Pick random message
            const text = messages[Math.floor(Math.random() * messages.length)];

            // Try sending with an image first
            try {
                await sock.sendMessage(from, {
                    image: { url: "https://source.unsplash.com/600x400/?morning,sunrise,nature" },
                    caption: text,
                    mentions: [msg.key.participant || from]
                });
            } catch {
                // If image fetch fails, fallback to text-only
                await sock.sendMessage(from, {
                    text,
                    mentions: [msg.key.participant || from]
                });
            }

        } catch (err) {
            console.error("Morning command error:", err);
            await sock.sendMessage(from, { text: "❌ Failed to send morning message. Try again later." });
        }
    }
};

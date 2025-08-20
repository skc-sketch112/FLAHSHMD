// morning.js
module.exports = {
    name: "morning",
    description: "Send a good morning message with quotes",
    run: async (sock, from, args, msg) => {
        try {
            const morningQuotes = [
                "🌞 Good Morning! Wishing you a day full of positivity and smiles.",
                "☀️ Rise and shine! May your day be filled with joy and success.",
                "🌻 Good Morning! Remember, every day is a new chance to shine.",
                "🌅 Wake up and embrace the new opportunities of today. Good Morning!",
                "✨ Each morning is a fresh beginning. Have a wonderful day ahead!",
                "🌤️ Good Morning! Start your day with gratitude and happiness.",
                "🌼 A beautiful morning for a beautiful soul like you. Good Morning!"
            ];

            const quote = morningQuotes[Math.floor(Math.random() * morningQuotes.length)];

            let text;
            let mentions = [];

            // If user mentions someone
            if (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
                const mentioned = msg.message.extendedTextMessage.contextInfo.mentionedJid[0];
                mentions = [mentioned];
                text = `🌅 Good Morning @${mentioned.split('@')[0]} 🌅\n\n${quote}`;
            } else {
                text = `🌅 Good Morning 🌅\n\n${quote}`;
            }

            // Optional: Send with image
            await sock.sendMessage(from, {
                image: { url: "https://source.unsplash.com/600x400/?morning,sunrise,nature" }, // Random morning image
                caption: text,
                mentions
            });
        } catch (err) {
            console.error("Morning error:", err);
            await sock.sendMessage(from, { text: "❌ Failed to send morning message. Try again later." });
        }
    }
};

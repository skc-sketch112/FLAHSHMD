// plugins/morning.js
module.exports = {
    name: "morning",
    description: "Send a random Good Morning message",
    run: async (sock, from, args) => {
        const goodMorningMessages = [
            "🌞✨ Good morning! Wake up and shine bright like the sun today. 🌼",
            "☀️🌸 Rise and shine! A beautiful day is waiting for you. 💫",
            "🌄💛 Good morning! Start your day with positivity and happiness. 🌟",
            "🌞💐 Wishing you a day full of smiles, love, and endless energy. 💪",
            "☕✨ Good morning! Grab your coffee and conquer the day ahead. 🚀",
            "🌅💖 May your morning be as wonderful as your heart. ❤️"
        ];

        // pick a random message
        const message = goodMorningMessages[Math.floor(Math.random() * goodMorningMessages.length)];

        await sock.sendMessage(from, { text: message });
    }
};

// plugins/love.js
module.exports = {
    name: "love",
    description: "Send a random love/romantic message 💖",
    run: async (sock, from, args) => {
        const loveMessages = [
            "❤️ You are the reason I smile every day. 💫",
            "💖 My heart beats only for you. 💕",
            "🌹 Loving you is the best decision I’ve ever made. 🌟",
            "💞 You are my today and all of my tomorrows. 🥰",
            "😍 Just a reminder: you mean the world to me. 🌍❤️",
            "💘 Every love story is beautiful, but ours is my favorite. 💌",
            "💕 You + Me = Forever 🌙✨",
            "❤️ I fall in love with you more and more every single day. 🌹"
        ];

        // pick a random love message
        const message = loveMessages[Math.floor(Math.random() * loveMessages.length)];

        await sock.sendMessage(from, { text: message });
    }
};

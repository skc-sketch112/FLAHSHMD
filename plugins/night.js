// plugins/night.js
module.exports = {
    name: "night",
    description: "Send a random Good Night message",
    run: async (sock, from, args) => {
        const goodNightMessages = [
            "🌙✨ Good night! May your dreams be as sweet as your smile. 😴💤",
            "💤🌌 The stars are shining bright, wishing you a peaceful night. 🌙",
            "😴✨ Close your eyes, drift into dreams, and wake up refreshed. 🌌",
            "🌙💫 Good night! Forget worries and let your soul rest. 💤",
            "💤🌠 Sweet dreams! May tomorrow bring joy and success. 🌞",
            "🌙⭐ Sleep peacefully, recharge your soul, and shine tomorrow. 🌟"
        ];

        // pick a random message
        const message = goodNightMessages[Math.floor(Math.random() * goodNightMessages.length)];

        await sock.sendMessage(from, { text: message });
    }
};

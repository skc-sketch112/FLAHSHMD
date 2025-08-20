// plugins/night.js
const fetch = require("node-fetch");

const PIXABAY_API_KEY = "51874106-2a96202d9815d07ac95dba697"; // put your API key here

module.exports = {
    name: "night",
    description: "Send a beautiful good night message with image",
    run: async (sock, from, args, msg) => {
        try {
            const sender = msg.pushName || "Friend";

            const messages = [
                `🌙 Good Night, ${sender}! 🌌\nMay your dreams be sweet and your sleep peaceful.`,
                `✨ Sleep well, ${sender}! 🌠 Tomorrow is waiting with new opportunities.`,
                `😴 Good Night ${sender}, relax your mind and recharge for a bright tomorrow.`,
                `🌌 Sweet dreams, ${sender}! 🌙 May your night be calm and full of rest.`
            ];

            const text = messages[Math.floor(Math.random() * messages.length)];

            // Fetch random night-related image from Pixabay
            const url = `https://pixabay.com/api/?key=${51874106-2a96202d9815d07ac95dba697}&q=good+night&image_type=photo&orientation=horizontal&safesearch=true&per_page=50`;
            const res = await fetch(url);
            const json = await res.json();

            if (!json.hits || json.hits.length === 0) {
                return sock.sendMessage(from, { text: text }); // fallback to text only
            }

            // Pick a random image
            const img = json.hits[Math.floor(Math.random() * json.hits.length)].largeImageURL;

            // Send message with image
            await sock.sendMessage(from, {
                image: { url: img },
                caption: text,
                mentions: [msg.key.participant || from]
            });

        } catch (err) {
            console.error("Night command error:", err);
            await sock.sendMessage(from, { text: "❌ Failed to fetch good night message. Try again later." });
        }
    }
};

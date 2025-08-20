// plugins/night.js

const PIXABAY_API_KEY = "51874106-2a96202d9815d07ac95dba697"; // Replace with your Pixabay API key

module.exports = {
    name: "night",
    description: "Send a good night message with image",
    run: async (sock, from, args, msg) => {
        try {
            const sender = msg.pushName || "Friend";

            const messages = [
                `🌙 Good Night, ${sender}! 😴✨\nMay your dreams be sweet and peaceful.`,
                `💤 Sleep well, ${sender}! 🌌\nMay the stars guard your rest tonight.`,
                `🌠 Good Night ${sender}! 🌙\nWishing you a restful and beautiful sleep.`,
                `😴 Time to rest, ${sender}! 🌃\nRecharge for a new day tomorrow.`
            ];

            const text = messages[Math.floor(Math.random() * messages.length)];

            // Fetch night images from Pixabay
            const url = `https://pixabay.com/api/?key=${51874106-2a96202d9815d07ac95dba697}&q=good+night&image_type=photo&orientation=horizontal&safesearch=true&per_page=50`;
            const res = await fetch(url);  // ✅ native fetch (no require)
            const json = await res.json();

            if (!json.hits || json.hits.length === 0) {
                return sock.sendMessage(from, { text }); // fallback to text only
            }

            // Pick a random image
            const img = json.hits[Math.floor(Math.random() * json.hits.length)].largeImageURL;

            // Send image + caption
            await sock.sendMessage(from, {
                image: { url: img },
                caption: text,
                mentions: [msg.key.participant || from]
            });

        } catch (err) {
            console.error("Night command error:", err);
            await sock.sendMessage(from, { text: "❌ Failed to send night message. Try again later." });
        }
    }
};

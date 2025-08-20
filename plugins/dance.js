// plugins/dance.js
const fetch = require("node-fetch");

module.exports = {
    name: "dance",
    description: "Send a random dance GIF",
    run: async (sock, from, args) => {
        try {
            // You can change this search term for other fun categories
            const url = `https://g.tenor.com/v1/search?q=dance&key=LIVDSRZULELA&limit=10`;

            const res = await fetch(url);
            const json = await res.json();

            if (!json || !json.results || json.results.length === 0) {
                return await sock.sendMessage(from, { text: "❌ No dance GIFs found. Try again later." });
            }

            // Pick a random GIF from results
            const randomGif = json.results[Math.floor(Math.random() * json.results.length)].media[0].gif.url;

            await sock.sendMessage(from, {
                video: { url: randomGif },
                gifPlayback: true,
                caption: "💃 Here’s a random dance for you!"
            });

        } catch (err) {
            console.error("Dance command error:", err);
            await sock.sendMessage(from, { text: "❌ Error fetching dance GIF. Try again later." });
        }
    }
};

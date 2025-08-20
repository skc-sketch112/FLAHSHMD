// plugins/pinterest.js
const fetch = require("node-fetch");

module.exports = {
    name: "pinterest",
    description: "Search images from Pinterest",
    run: async (sock, from, args) => {
        if (!args || args.length < 1) {
            return await sock.sendMessage(from, {
                text: "❌ Usage: `!pinterest <search query>`\n\nExample: `!pinterest anime girl`"
            });
        }

        const query = args.join(" ");
        const url = `https://api.xyroinee.xyz/api/pinterest?search=${encodeURIComponent(query)}`;

        try {
            const res = await fetch(url);
            const data = await res.json();

            if (!data || !data.data || data.data.length === 0) {
                return await sock.sendMessage(from, { text: `⚠️ No results found for *${query}*` });
            }

            // pick a random image
            const image = data.data[Math.floor(Math.random() * data.data.length)];

            await sock.sendMessage(from, {
                image: { url: image },
                caption: `🔎 Pinterest result for: *${query}*`
            });

        } catch (err) {
            console.error("Pinterest command error:", err);
            await sock.sendMessage(from, {
                text: "❌ Failed to fetch Pinterest image. Try again later."
            });
        }
    }
};

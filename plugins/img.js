// plugins/img.js
const fetch = require("node-fetch");

const UNSPLASH_ACCESS_KEY = "Uebb0QGhkVela_0V0ZidmqYXDqAEHRYpV2UnemVHgLY"; // 🔑 Replace with your Unsplash Access Key

module.exports = {
    name: "img",
    description: "Search and get HD images",
    run: async (sock, from, args) => {
        try {
            if (!args || args.length < 1) {
                return sock.sendMessage(from, { text: "⚠️ Usage: `!img <search term> [count]`\nExample: `!img cats 5`" });
            }

            // If last argument is a number → set as count
            let count = 3; // default
            if (!isNaN(args[args.length - 1])) {
                count = Math.min(parseInt(args.pop()), 10); // max 10
            }

            const query = args.join(" ");
            const url = `https://api.unsplash.com/search/photos?page=1&per_page=${count}&query=${encodeURIComponent(query)}&client_id=${UNSPLASH_ACCESS_KEY}`;

            const res = await fetch(url);
            const data = await res.json();

            if (!data.results || data.results.length === 0) {
                return sock.sendMessage(from, { text: `❌ No images found for *${query}*.` });
            }

            for (const img of data.results) {
                await sock.sendMessage(from, {
                    image: { url: img.urls.regular },
                    caption: `📸 *${query}*`
                });
            }

        } catch (err) {
            console.error("Image command error:", err);
            await sock.sendMessage(from, { text: "❌ Error fetching images. Try again later." });
        }
    }
};

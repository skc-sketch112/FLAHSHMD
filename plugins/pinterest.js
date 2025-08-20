// plugins/pinterest.js
const fetch = require("node-fetch");

// Get your free API key from: https://pixabay.com/api/docs/
const PIXABAY_API_KEY = "YOUR_PIXABAY_API_KEY";  

module.exports = {
    name: "pinterest",
    description: "Search images from Pinterest / Pixabay",
    run: async (sock, from, args) => {
        if (!args || args.length < 1) {
            return await sock.sendMessage(from, {
                text: "❌ Usage: `!pinterest <search query>`\n\nExample: `!pinterest anime girl`"
            });
        }

        const query = args.join(" ");
        let imageUrl = null;

        try {
            // 1. Try free xyroinee API
            const url = `https://api.xyroinee.xyz/api/pinterest?search=${encodeURIComponent(query)}`;
            const res = await fetch(url);
            const data = await res.json();

            if (data && data.data && data.data.length > 0) {
                imageUrl = data.data[Math.floor(Math.random() * data.data.length)];
            }
        } catch (err) {
            console.warn("⚠️ xyroinee API failed, trying Pixabay...");
        }

        // 2. If xyroinee fails, use Pixabay
        if (!imageUrl) {
            try {
                const res = await fetch(`https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(query)}&image_type=photo&per_page=50`);
                const json = await res.json();

                if (json && json.hits && json.hits.length > 0) {
                    const random = json.hits[Math.floor(Math.random() * json.hits.length)];
                    imageUrl = random.largeImageURL;
                }
            } catch (err) {
                console.error("Pixabay fetch error:", err);
            }
        }

        // Final check
        if (!imageUrl) {
            return await sock.sendMessage(from, {
                text: `❌ Failed to fetch image for: *${query}*. Try again later.`
            });
        }

        // Send image
        await sock.sendMessage(from, {
            image: { url: imageUrl },
            caption: `🔎 Result for: *${query}*`
        });
    }
};

module.exports = {
    name: "img",
    description: "Fetch random images from Unsplash",
    run: async (sock, from, args) => {
        if (!args || args.length === 0) {
            return await sock.sendMessage(from, { text: "❌ Please provide a query.\nExample: `!img cat`" });
        }

        const query = args.join(" ");
        await sock.sendMessage(from, { text: `🔍 Searching for images: *${query}* ...` });

        try {
            // ✅ Generate multiple random Unsplash links
            const urls = [
                `https://source.unsplash.com/600x400/?${encodeURIComponent(query)}&sig=${Math.random()}`,
                `https://source.unsplash.com/600x400/?${encodeURIComponent(query)}&sig=${Math.random()}`,
                `https://source.unsplash.com/600x400/?${encodeURIComponent(query)}&sig=${Math.random()}`
            ];

            for (let url of urls) {
                await sock.sendMessage(from, {
                    image: { url },
                    caption: `✅ Here is an image for: *${query}*`
                });
            }

        } catch (err) {
            console.error(err);
            await sock.sendMessage(from, { text: "⚠️ Failed to fetch images. Try again later." });
        }
    }
};

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
            // ✅ Send 3 random Unsplash images directly
            for (let i = 0; i < 3; i++) {
                const url = `https://source.unsplash.com/600x400/?${encodeURIComponent(query)}&sig=${Date.now()}${i}`;

                await sock.sendMessage(from, {
                    image: { url },
                    caption: `✅ Image result for: *${query}*`
                });
            }

        } catch (err) {
            console.error(err);
            await sock.sendMessage(from, { text: "⚠️ Error while sending images." });
        }
    }
};

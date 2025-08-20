module.exports = {
    name: "img",
    description: "Fetch a random image based on a query",
    run: async (sock, from, args) => {
        if (!args || args.length === 0) {
            return await sock.sendMessage(from, { text: "❌ Please provide a query.\nExample: `!img cat`" });
        }

        const query = args.join(" ");
        await sock.sendMessage(from, { text: `🔎 Searching Unsplash for: *${query}* ...` });

        try {
            const url = `https://source.unsplash.com/600x400/?${encodeURIComponent(query)}`;
            await sock.sendMessage(from, {
                image: { url },
                caption: `✅ Image result for: *${query}*`
            });
        } catch (err) {
            console.error(err);
            await sock.sendMessage(from, { text: "❌ Error while fetching image." });
        }
    }
};

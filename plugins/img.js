module.exports = {
    name: "img",
    description: "Generate an image from a query",
    run: async (sock, from, args) => {
        if (!args || args.length === 0) {
            return await sock.sendMessage(from, { text: "❌ Please provide a query.\nExample: `!img cat with crown`" });
        }

        const query = args.join(" ");
        await sock.sendMessage(from, { text: `🎨 Generating image for: *${query}* ...` });

        try {
            const url = `https://api.nekobot.xyz/imagegen?type=changemymind&text=${encodeURIComponent(query)}`;
            const res = await fetch(url);
            const json = await res.json();

            if (!json || !json.message) {
                return await sock.sendMessage(from, { text: "⚠️ Failed to generate image. Try again!" });
            }

            await sock.sendMessage(from, {
                image: { url: json.message },
                caption: `✅ Here is your image for: *${query}*`
            });

        } catch (err) {
            console.error(err);
            await sock.sendMessage(from, { text: "❌ Error while generating image." });
        }
    }
};

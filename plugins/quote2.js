// plugins/quote.js
const fetch = require("node-fetch");

module.exports = {
    name: "quote",
    aliases: ["inspire", "motivate", "wisdom"],
    description: "Get a random inspirational quote with a styled image",
    run: async (sock, from) => {
        try {
            // 1) Fetch random quote
            const res = await fetch("https://zenquotes.io/api/random");
            const data = await res.json();

            if (!data || !data[0]) {
                return sock.sendMessage(from, { text: "⚠️ No quote found. Try again later." });
            }

            const quote = data[0].q;
            const author = data[0].a;

            // 2) Encode quote + author for image
            const text = encodeURIComponent(`"${quote}"\n\n— ${author}`);

            // 3) Use dummyimage.com to create styled image (no API key needed)
            const imageUrl = `https://dummyimage.com/800x400/1e293b/ffffff.png&text=${text}`;

            // 4) Send image card
            await sock.sendMessage(from, {
                image: { url: imageUrl },
                caption: "✨ Here’s your inspirational quote!"
            });

        } catch (err) {
            console.error("Quote fetch error:", err);
            await sock.sendMessage(from, { text: "❌ Error fetching quote. Try again later." });
        }
    }
};

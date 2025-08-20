// plugins/quote.js
const fetch = require("node-fetch");

module.exports = {
    name: "quote",
    description: "Get a random inspirational quote",
    run: async (sock, from) => {
        try {
            // Free API (no key required)
            const res = await fetch("https://zenquotes.io/api/random");
            const data = await res.json();

            if (!data || !data[0]) {
                return sock.sendMessage(from, { text: "⚠️ No quote found. Try again later." });
            }

            const quote = data[0].q;
            const author = data[0].a;

            await sock.sendMessage(from, { 
                text: `💡 *${quote}*\n\n— ${author}` 
            });

        } catch (err) {
            console.error("Quote fetch error:", err);
            await sock.sendMessage(from, { text: "❌ Error fetching quote. Try again later." });
        }
    }
};

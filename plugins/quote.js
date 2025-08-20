// plugins/quote.js
module.exports = {
    name: "quote",
    description: "Get a random inspirational quote",
    run: async (sock, from, args) => {
        try {
            const res = await fetch("https://zenquotes.io/api/random");
            const data = await res.json();

            if (!data || !data[0] || !data[0].q) {
                return sock.sendMessage(from, { text: "⚠️ Could not fetch a quote. Try again!" });
            }

            await sock.sendMessage(from, {
                text: `🌟 *Random Quote* 🌟\n\n"${data[0].q}"\n\n— *${data[0].a}*`
            });
        } catch (err) {
            console.error("Quote fetch error:", err);
            await sock.sendMessage(from, { text: "❌ Error while fetching quote." });
        }
    }
};

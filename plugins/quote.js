// plugins/quote.js
module.exports = {
    name: "quote",
    description: "Get a random inspirational quote",
    run: async (sock, from, args) => {
        try {
            const res = await fetch("https://api.quotable.io/random");
            const data = await res.json();

            if (!data || !data.content) {
                return sock.sendMessage(from, { text: "⚠️ Could not fetch a quote. Try again!" });
            }

            await sock.sendMessage(from, {
                text: `🌟 *Random Quote* 🌟\n\n"${data.content}"\n\n— *${data.author}*`
            });
        } catch (err) {
            console.error("Quote fetch error:", err);
            await sock.sendMessage(from, { text: "❌ Error while fetching quote." });
        }
    }
};

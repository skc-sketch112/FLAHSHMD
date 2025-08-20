// plugins/fact.js
const fetch = require("node-fetch");

module.exports = {
    name: "fact",
    aliases: ["funfact", "didyouknow"],
    description: "Get a random fun fact",
    run: async (sock, from) => {
        try {
            // Fetch a random fact
            const res = await fetch("https://uselessfacts.jsph.pl/random.json?language=en");
            const data = await res.json();

            if (!data || !data.text) {
                return sock.sendMessage(from, { text: "⚠️ No fact found. Try again later." });
            }

            const fact = data.text;

            // Send nicely formatted fact
            await sock.sendMessage(from, {
                text: `🧠 *Did You Know?*\n\n${fact}`
            });

        } catch (err) {
            console.error("Fact fetch error:", err);
            await sock.sendMessage(from, { text: "❌ Error fetching fact. Try again later." });
        }
    }
};

const fetch = require("node-fetch");

module.exports = {
    name: "logo",
    description: "Generate a stylish text logo",
    run: async (sock, from, args) => {
        try {
            if (!args || args.length < 1) {
                return await sock.sendMessage(from, { 
                    text: "❌ Usage: `!logo <your text>`\n\nExample: `!logo Sourav`" 
                });
            }

            const text = args.join(" ");
            const url = `https://api.popcat.xyz/text?text=${encodeURIComponent(text)}`;

            // fetch fancy styled text
            const res = await fetch(url);
            const data = await res.text();

            await sock.sendMessage(from, { 
                text: `✨ *Here’s your Logo:*\n\n${data}` 
            });

        } catch (err) {
            console.error("Logo command error:", err);
            await sock.sendMessage(from, { text: "❌ Failed to generate logo. Try again later." });
        }
    }
};

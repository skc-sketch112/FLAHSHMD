// plugins/logo.js
const fetch = require("node-fetch");

module.exports = {
    name: "logo",
    description: "Generate a stylish text logo",
    run: async (sock, from, args) => {
        try {
            if (!args || args.length < 1) {
                return await sock.sendMessage(from, {
                    text: "❌ Usage: `!logo <style> <your text>`\n\nExample: `!logo neon Sourav`"
                });
            }

            const style = args[0].toLowerCase();
            const text = args.slice(1).join(" ");

            if (!text) {
                return await sock.sendMessage(from, { text: "⚠️ Please provide text after style.\nExample: `!logo glitch Sourav`" });
            }

            // TextPro styles
            const styles = {
                neon: "https://textpro.me/create-glowing-neon-light-text-effect-online-free-1061.html",
                glitch: "https://textpro.me/create-impressive-glitch-text-effects-online-1027.html",
                gradient: "https://textpro.me/online-multicolor-3d-gradient-text-effect-generator-1080.html",
                space: "https://textpro.me/create-space-3d-text-effect-online-985.html",
                steel: "https://textpro.me/steel-text-effect-online-921.html"
            };

            if (!styles[style]) {
                return await sock.sendMessage(from, {
                    text: `⚠️ Invalid style. Available styles:\n\n${Object.keys(styles).map(s => `👉 ${s}`).join("\n")}`
                });
            }

            const apiUrl = `https://api.akuari.my.id/ephoto/textpro?url=${encodeURIComponent(styles[style])}&text=${encodeURIComponent(text)}`;

            const res = await fetch(apiUrl);
            const json = await res.json();

            if (!json || !json.result) {
                return await sock.sendMessage(from, { text: "❌ Failed to generate logo. Try again later." });
            }

            await sock.sendMessage(from, {
                image: { url: json.result },
                caption: `✨ *${style.toUpperCase()} Logo for:* ${text}`
            });

        } catch (err) {
            console.error("Logo command error:", err);
            await sock.sendMessage(from, { text: "❌ Error generating logo. Try again later." });
        }
    }
};

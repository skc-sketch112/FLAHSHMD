const fetch = require("node-fetch");

module.exports = {
    name: "logo",
    description: "Generate stylish text logos (fancy, bold, glitch, etc.)",
    run: async (sock, from, args) => {
        try {
            if (!args || args.length < 2) {
                return await sock.sendMessage(from, { 
                    text: "❌ Usage: `!logo <style> <your text>`\n\nExample:\n`!logo fancy Sourav`\n`!logo bold Sourav`\n`!logo glitch Sourav`"
                });
            }

            const style = args[0].toLowerCase();
            const text = args.slice(1).join(" ");

            // map styles to PopCat API endpoints
            const styles = {
                fancy: "fancy",
                bold: "bold",
                glitch: "glitchtext",   // glitch style
                bubble: "bubble",       // bubble letters
                spooky: "spooky",       // spooky font
                tiny: "tiny"            // tiny text
            };

            if (!styles[style]) {
                return await sock.sendMessage(from, { 
                    text: `⚠️ Invalid style. Available styles:\n${Object.keys(styles).join(", ")}`
                });
            }

            const url = `https://api.popcat.xyz/${styles[style]}?text=${encodeURIComponent(text)}`;
            const res = await fetch(url);

            // some endpoints return { text: "..." }, some return { glitch: "..." }
            const data = await res.json();
            let output = data.text || data.glitch || null;

            if (!output) {
                return await sock.sendMessage(from, { text: "❌ Could not generate logo. Try again later." });
            }

            await sock.sendMessage(from, { 
                text: `✨ *Here’s your ${style} logo:*\n\n${output}`
            });

        } catch (err) {
            console.error("Logo command error:", err);
            await sock.sendMessage(from, { text: "❌ Failed to generate logo. Try again later." });
        }
    }
};

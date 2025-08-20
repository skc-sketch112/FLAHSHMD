module.exports = {
    name: "animal",
    description: "Send different animal emojis 🐶🐱🐼",
    run: async (sock, from, args) => {
        try {
            const animals = [
                "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯"
            ];

            if (args[0] && !isNaN(args[0])) {
                const index = parseInt(args[0]) - 1;
                if (index >= 0 && index < animals.length) {
                    return await sock.sendMessage(from, { text: `🐾 *Animal ${args[0]}*\n\n${animals[index]}` });
                } else {
                    return await sock.sendMessage(from, { text: `⚠️ Choose between 1 and ${animals.length}.` });
                }
            }

            let list = animals.map((a, i) => `*Animal ${i+1}* → ${a}`).join("\n");
            await sock.sendMessage(from, { text: `🐾 *Available Animals*\n\n${list}\n\n👉 Use !animal <number>` });
        } catch (err) {
            console.error("Animal error:", err);
            await sock.sendMessage(from, { text: "❌ Failed to send animal list." });
        }
    }
};

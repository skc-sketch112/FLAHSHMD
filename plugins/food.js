module.exports = {
    name: "food",
    description: "Send different food emojis 🍔🍕🍩",
    run: async (sock, from, args) => {
        try {
            const foods = [
                "🍏", "🍊", "🍌", "🍉", "🍇", "🍓", "🍔", "🍕", "🍟", "🍩"
            ];

            if (args[0] && !isNaN(args[0])) {
                const index = parseInt(args[0]) - 1;
                if (index >= 0 && index < foods.length) {
                    return await sock.sendMessage(from, { text: `🍴 *Food ${args[0]}*\n\n${foods[index]}` });
                } else {
                    return await sock.sendMessage(from, { text: `⚠️ Choose between 1 and ${foods.length}.` });
                }
            }

            let list = foods.map((f, i) => `*Food ${i+1}* → ${f}`).join("\n");
            await sock.sendMessage(from, { text: `🍴 *Available Foods*\n\n${list}\n\n👉 Use !food <number>` });
        } catch (err) {
            console.error("Food error:", err);
            await sock.sendMessage(from, { text: "❌ Failed to send food list." });
        }
    }
};

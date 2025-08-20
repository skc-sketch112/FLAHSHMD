module.exports = {
    name: "flag",
    description: "Send different country flags 🌍",
    run: async (sock, from, args) => {
        try {
            const flags = [
                "🇮🇳", "🇺🇸", "🇬🇧", "🇯🇵", "🇰🇷", "🇨🇦", "🇦🇺", "🇫🇷", "🇩🇪", "🇧🇷"
            ];

            if (args[0] && !isNaN(args[0])) {
                const index = parseInt(args[0]) - 1;
                if (index >= 0 && index < flags.length) {
                    return await sock.sendMessage(from, { text: `🏳️ *Flag ${args[0]}*\n\n${flags[index]}` });
                } else {
                    return await sock.sendMessage(from, { text: `⚠️ Choose between 1 and ${flags.length}.` });
                }
            }

            let list = flags.map((f, i) => `*Flag ${i+1}* → ${f}`).join("\n");
            await sock.sendMessage(from, { text: `🏳️ *Available Flags*\n\n${list}\n\n👉 Use !flag <number>` });
        } catch (err) {
            console.error("Flag error:", err);
            await sock.sendMessage(from, { text: "❌ Failed to send flag list." });
        }
    }
};

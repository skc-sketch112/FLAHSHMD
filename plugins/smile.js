module.exports = {
    name: "smile",
    description: "Send different smile emojis 🙂😁😎",
    run: async (sock, from, args) => {
        try {
            const smiles = [
                "🙂", "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😎"
            ];

            if (args[0] && !isNaN(args[0])) {
                const index = parseInt(args[0]) - 1;
                if (index >= 0 && index < smiles.length) {
                    return await sock.sendMessage(from, { text: `😊 *Smile ${args[0]}*\n\n${smiles[index]}` });
                } else {
                    return await sock.sendMessage(from, { text: `⚠️ Choose between 1 and ${smiles.length}.` });
                }
            }

            let list = smiles.map((s, i) => `*Smile ${i+1}* → ${s}`).join("\n");
            await sock.sendMessage(from, { text: `😊 *Available Smiles*\n\n${list}\n\n👉 Use !smile <number>` });
        } catch (err) {
            console.error("Smile error:", err);
            await sock.sendMessage(from, { text: "❌ Failed to send smile list." });
        }
    }
};

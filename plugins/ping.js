module.exports = {
    name: "ping",
    description: "Check if bot is alive",
    run: async (sock, from) => {
        await sock.sendMessage(from, { text: "🏓 Pong! Bot is alive." });
    }
};

// plugins/ping.js
module.exports = {
    name: "ping",
    description: "Check if the bot is alive",
    run: async (sock, from, args) => {
        await sock.sendMessage(from, { text: "🏓 Pong! Bot is alive ✅ sourav_md v 4.19.15" });
    }
};

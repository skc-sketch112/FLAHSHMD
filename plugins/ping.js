module.exports = {
    name: "ping",
    description: "Replies with pong",
    run: async (sock, from, args, msg) => {
        console.log("⚡ Ping command triggered!");
        await sock.sendMessage(from, { text: "🏓 pong!SOURAV_MD V 4.10.15" }, { quoted: msg });
    }
};

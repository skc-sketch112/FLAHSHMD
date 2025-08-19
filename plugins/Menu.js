module.exports = {
    name: "menu",
    description: "Show all available commands",
    run: async (sock, from, args, plugins) => {
        let menuText = "📖 *Bot Menu*\n\n"

        plugins.forEach(p => {
            menuText += `👉 !${p.name} - ${p.description}\n`
        })

        await sock.sendMessage(from, { text: menuText })
    }
}

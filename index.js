sock.ev.on("messages.upsert", async (m) => {
    const msg = m.messages[0]
    if (!msg.message) return

    const from = msg.key.remoteJid
    let text = ""

    if (msg.message.conversation) text = msg.message.conversation
    else if (msg.message.extendedTextMessage) text = msg.message.extendedTextMessage.text
    else if (msg.message.imageMessage && msg.message.imageMessage.caption) text = msg.message.imageMessage.caption

    if (!text) return // ignore non-text messages

    text = text.trim().toLowerCase()

    // ✅ Simple auto-reply
    if (text === "hi") {
        await sock.sendMessage(from, { text: "👋 Hello! Bot is alive." })
    }

    // ✅ Command system (prefix !)
    if (text.startsWith("!")) {
        const args = text.split(" ")
        const command = args.shift().slice(1)

        if (command === "ping") {
            await sock.sendMessage(from, { text: "🏓 Pong!" })
        }
    }
})

const path = require("path");

module.exports = {
    name: "menu",
    description: "Show bot menu with image and styled text",
    run: async (sock, from, args, plugins) => {
        // Banner image (your uploaded file path)
        const bannerPath = path.join(__dirname, "../media/menu.jpg"); 
        // Make sure you save your image inside a folder like `/media/menu.jpg`

        // Styled menu text
        let menuText = `
╭━〔 *SOURAV_MD BOT* 〕━╮
┃ 👑 Owner » Sourav
┃ 🤖 Prefix » !
┃ 📦 Framework » Node.js
┃ 🔌 Library » Baileys MD
┃ ☁️ Hosting » Heroku / Render
╰━━━━━━━━━━━━━━━╯

📜 *Available Commands* 📜
`;

        // Auto-list all plugins
        for (const plugin of plugins.values()) {
            menuText += `✨ *!${plugin.name}* → ${plugin.description || "No description"}\n`;
        }

        menuText += `
━━━━━━━━━━━━━━━
💡 Example: *!ping*
        `;

        // Send banner image + menu text
        await sock.sendMessage(from, {
            image: { url: "https://files.catbox.moe/qcv0ls.jpg" }, // Or use local `bannerPath`
            caption: menuText
        });
    }
};

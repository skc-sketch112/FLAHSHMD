const fs = require("fs");
const path = require("path");

module.exports = {
    name: "menu",
    description: "Show bot menu",
    run: async (sock, from) => {
        try {
            // Banner Image
            const banner = "https://files.catbox.moe/qcv0ls.jpg"; // Change to your own image URL

            // Bot Info
            const botInfo = `
╭━━━〔 🤖 *SOURAV_MD* 🤖 〕━━━╮
┃   ✦『 𝗨𝗟𝗧𝗜𝗠𝗔𝗧𝗘 𝗕𝗢𝗧 𝗠𝗘𝗡𝗨 』✦
╰━━━━━━━━━━━━━━━━━━━━╯

📌 *BOT INFORMATION*
━━━━━━━━━━━━━━━━━
👑 Owner » @SOURAV
🤖 Baileys » Multi Device
💻 Type » NodeJs
🚀 Platform » RENDER/OTHERPLATFORNM
━━━━━━━━━━━━━━━━━
`;

            // Load commands dynamically
            const pluginsDir = path.join(__dirname);
            const files = fs.readdirSync(pluginsDir).filter(file => file.endsWith(".js"));

            let menuList = "📂 *AVAILABLE COMMANDS* 📂\n\n";
            files.forEach(file => {
                if (file !== "menu.js") {
                    const command = require(path.join(pluginsDir, file));
                    menuList += `⚡ !${command.name} → ${command.description || "No description"}\n`;
                }
            });

            // Final menu message
            const menuText = `${botInfo}\n${menuList}\n━━━━━━━━━━━━━━━━━\n🌐 DARKZONE-MD BOT`;

            await sock.sendMessage(from, {
                image: { url: banner },
                caption: menuText
            });

        } catch (err) {
            console.error("Menu error:", err);
            await sock.sendMessage(from, { text: "❌ Failed to load menu." });
        }
    }
};
        

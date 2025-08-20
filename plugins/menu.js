// plugins/menu.js
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "menu",
  description: "Show all available commands",
  run: async (sock, from) => {
    try {
      // Read plugin files
      const pluginFiles = fs.readdirSync(path.join(__dirname))
        .filter(f => f.endsWith(".js") && f !== "menu.js");

      // Prepare categories
      const categories = {
        MEDIA: [],
        KNOWLEDGE: [],
        UTILITY: [],
        OTHERS: []
      };

      for (const file of pluginFiles) {
        const plugin = require(path.join(__dirname, file));
        if (plugin.name && plugin.description) {
          if (["song", "img"].includes(plugin.name)) {
            categories.MEDIA.push(plugin);
          } else if (["quran", "quote", "fact"].includes(plugin.name)) {
            categories.KNOWLEDGE.push(plugin);
          } else if (["menu", "help"].includes(plugin.name)) {
            categories.UTILITY.push(plugin);
          } else {
            categories.OTHERS.push(plugin);
          }
        }
      }

      // Build menu text
      let menuText = "╔══✪〘 🤖 BOT MENU 〙✪══╗\n\n";

      if (categories.MEDIA.length > 0) {
        menuText += "🎶 *MEDIA*\n";
        for (const cmd of categories.MEDIA) {
          menuText += `   ➤ !${cmd.name} → ${cmd.description}\n`;
        }
        menuText += "\n";
      }

      if (categories.KNOWLEDGE.length > 0) {
        menuText += "📚 *KNOWLEDGE*\n";
        for (const cmd of categories.KNOWLEDGE) {
          menuText += `   ➤ !${cmd.name} → ${cmd.description}\n`;
        }
        menuText += "\n";
      }

      if (categories.UTILITY.length > 0) {
        menuText += "⚙️ *UTILITY*\n";
        for (const cmd of categories.UTILITY) {
          menuText += `   ➤ !${cmd.name} → ${cmd.description}\n`;
        }
        menuText += "\n";
      }

      if (categories.OTHERS.length > 0) {
        menuText += "✨ *OTHERS*\n";
        for (const cmd of categories.OTHERS) {
          menuText += `   ➤ !${cmd.name} → ${cmd.description}\n`;
        }
        menuText += "\n";
      }

      menuText += "╚════════════════════╝\n";

      // Send menu with banner image
      await sock.sendMessage(from, {
        image: { url: "https://files.catbox.moe/qcv0ls.jpg" }, // replace with your own banner link
        caption: menuText
      });

    } catch (err) {
      console.error("Menu error:", err);
      await sock.sendMessage(from, { text: "❌ Failed to load menu." });
    }
  }
};

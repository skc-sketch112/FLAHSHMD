module.exports = {
    name: "menu",
    description: "Show bot menu with image and styled text",
    run: async (sock, from) => {
        const menuText = `
╭─❒ 「 *SOURAV_MD* 」
│
│ 『 *ULTIMATE BOT MENU* 』
│
├─❒ BOT INFORMATION
│ 👑 Owner »SOURAV
│ 🤖 Baileys » Multi Device
│ 💻 Type » NodeJs
│ 🚀 Platform »RENDER
│
╰───────────────❒
`;

        await sock.sendMessage(from, {
            image: { url: "https://files.catbox.moe/qcv0ls.jpg" }, // 🔥 your banner image URL
            caption: menuText
        });
    }
};

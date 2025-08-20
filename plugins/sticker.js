// plugins/sticker.js
const { Sticker, StickerTypes } = require("wa-sticker-formatter");
const { downloadMediaMessage } = require("@whiskeysockets/baileys");

module.exports = {
    name: "sticker",
    description: "Convert image/video to sticker",
    run: async (sock, from, args, msg) => {
        try {
            let buffer;

            // Case 1: If replied to image/video
            if (msg.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
                const quoted = {
                    message: msg.message.extendedTextMessage.contextInfo.quotedMessage
                };
                buffer = await downloadMediaMessage(quoted, "buffer", {}, { logger: console });
            }
            // Case 2: If image/video sent directly
            else if (msg.message?.imageMessage || msg.message?.videoMessage) {
                buffer = await downloadMediaMessage(msg, "buffer", {}, { logger: console });
            }
            // Case 3: If URL provided
            else if (args[0] && args[0].startsWith("http")) {
                buffer = args[0]; // url directly supported
            }

            if (!buffer) {
                return sock.sendMessage(from, {
                    text: "⚠️ Send or reply to an *image/video* with `!sticker`\nOr use: `!sticker <image_url>`"
                });
            }

            // Create sticker
            const sticker = new Sticker(buffer, {
                pack: "MyBot Stickers",
                author: "StickerBot",
                type: StickerTypes.FULL,
                quality: 80
            });

            await sock.sendMessage(from, await sticker.toMessage());

        } catch (err) {
            console.error("Sticker command error:", err);
            await sock.sendMessage(from, { text: "❌ Error creating sticker. Check terminal logs." });
        }
    }
};

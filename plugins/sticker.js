// plugins/sticker.js
const { Sticker, StickerTypes } = require("wa-sticker-formatter");

module.exports = {
    name: "sticker",
    description: "Convert image/video to sticker",
    run: async (sock, from, args, msg) => {
        try {
            const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

            // Check if user replied to an image or video
            if (quoted && (quoted.imageMessage || quoted.videoMessage)) {
                let mediaType = quoted.imageMessage ? "image" : "video";
                let buffer = await sock.downloadMediaMessage({ message: quoted });
                
                if (!buffer) {
                    return sock.sendMessage(from, { text: "❌ Failed to download media." });
                }

                const sticker = new Sticker(buffer, {
                    pack: "MyBot Stickers",
                    author: "StickerBot",
                    type: StickerTypes.FULL,
                    quality: 80
                });

                await sock.sendMessage(from, await sticker.toMessage());
                return;
            }

            // If direct image/video (not reply)
            if (msg.message.imageMessage || msg.message.videoMessage) {
                let buffer = await sock.downloadMediaMessage(msg);

                if (!buffer) {
                    return sock.sendMessage(from, { text: "❌ Failed to download media." });
                }

                const sticker = new Sticker(buffer, {
                    pack: "MyBot Stickers",
                    author: "StickerBot",
                    type: StickerTypes.FULL,
                    quality: 80
                });

                await sock.sendMessage(from, await sticker.toMessage());
                return;
            }

            // If user gives an image URL
            if (args[0] && args[0].startsWith("http")) {
                const sticker = new Sticker(args[0], {
                    pack: "MyBot Stickers",
                    author: "StickerBot",
                    type: StickerTypes.FULL,
                    quality: 80
                });

                await sock.sendMessage(from, await sticker.toMessage());
                return;
            }

            // If nothing found
            return sock.sendMessage(from, {
                text: "⚠️ Send or reply to an *image/video* with the command:\n👉 `!sticker`\nOr use:\n👉 `!sticker <image_url>`"
            });

        } catch (err) {
            console.error("Sticker command error:", err);
            await sock.sendMessage(from, { text: "❌ Error creating sticker. Try again later." });
        }
    }
};

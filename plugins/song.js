const yts = require("yt-search");
const ytdl = require("ytdl-core");
const fs = require("fs");

module.exports = {
    name: "song",
    description: "Download songs from YouTube",
    run: async (sock, from, args) => {
        if (!args || args.length === 0) {
            return await sock.sendMessage(from, { text: "❌ Please provide a song name.\nExample: `.song shape of you`" });
        }

        const query = args.join(" ");
        await sock.sendMessage(from, { text: `🎵 Searching for: *${query}* ...` });

        try {
            // Search song on YouTube
            const search = await yts(query);
            if (!search.videos.length) {
                return await sock.sendMessage(from, { text: "⚠️ No results found!" });
            }

            const video = search.videos[0]; // First result
            const stream = ytdl(video.url, { filter: "audioonly", quality: "highestaudio" });

            const filePath = `./${video.videoId}.mp3`;
            const writeStream = fs.createWriteStream(filePath);
            stream.pipe(writeStream);

            writeStream.on("finish", async () => {
                await sock.sendMessage(from, {
                    audio: { url: filePath },
                    mimetype: "audio/mp4",
                    ptt: false
                }, { quoted: null });

                fs.unlinkSync(filePath); // delete after sending
            });

        } catch (err) {
            console.error("Song download error:", err);
            await sock.sendMessage(from, { text: "❌ Error while downloading song. Try again later." });
        }
    }
};

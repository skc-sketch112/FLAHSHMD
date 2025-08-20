// plugins/song.js
const yts = require("yt-search");
const ytdl = require("ytdl-core");

module.exports = {
    name: "song",
    description: "Download a song from YouTube or send its link",
    run: async (sock, from, args) => {
        if (!args || args.length === 0) {
            return sock.sendMessage(from, { text: "❌ Provide a song name.\nExample: `!song shape of you`" });
        }

        const query = args.join(" ");
        await sock.sendMessage(from, { text: `🎵 Searching for: *${query}* ...` });

        try {
            // 🔍 Search YouTube
            const search = await yts(query);
            const video = search.videos && search.videos[0];
            if (!video) {
                return sock.sendMessage(from, { text: "⚠️ No results found." });
            }

            // 🟢 Try downloading
            try {
                const stream = ytdl(video.url, { filter: "audioonly", quality: "highestaudio" });
                const chunks = [];
                for await (const chunk of stream) {
                    chunks.push(chunk);
                }
                const audioBuffer = Buffer.concat(chunks);

                // If file too big (>16MB), WhatsApp may reject
                if (audioBuffer.length > 15 * 1024 * 1024) {
                    throw new Error("File too big for WhatsApp");
                }

                await sock.sendMessage(from, {
                    audio: audioBuffer,
                    mimetype: "audio/mpeg",
                    fileName: `${video.title}.mp3`,
                    ptt: false
                });

            } catch (downloadErr) {
                console.error("Song download error:", downloadErr);

                // Fallback: Send YouTube link + thumbnail
                await sock.sendMessage(from, {
                    image: { url: video.thumbnail },
                    caption: `❌ Could not download.\n\n🎵 *${video.title}*\n🔗 ${video.url}`
                });
            }

        } catch (err) {
            console.error("Song search error:", err);
            await sock.sendMessage(from, { text: "❌ Something went wrong. Try again later." });
        }
    }
};

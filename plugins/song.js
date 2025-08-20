// plugins/song.js
const yts = require("yt-search");
const ytdl = require("ytdl-core");
const fs = require("fs");
const os = require("os");
const path = require("path");

module.exports = {
    name: "song",
    description: "Download a song from YouTube and send as audio",
    run: async (sock, from, args) => {
        if (!args || args.length === 0) {
            return sock.sendMessage(from, { text: "❌ Provide a song name.\nExample: `!song shape of you`" });
        }

        const query = args.join(" ");
        await sock.sendMessage(from, { text: `🎵 Searching: *${query}* ...` });

        try {
            // 🔎 Search on YouTube
            const search = await yts(query);
            const video = search.videos && search.videos[0];
            if (!video) return sock.sendMessage(from, { text: "⚠️ No results found." });

            const id = video.videoId;
            const tmpDir = os.tmpdir();
            const outPath = path.join(tmpDir, `${id}.webm`); // audio file

            // 📥 Download audio-only stream
            await new Promise((resolve, reject) => {
                const rs = ytdl(video.url, { filter: "audioonly", quality: "highestaudio" });
                const ws = fs.createWriteStream(outPath);
                rs.pipe(ws);
                rs.on("error", reject);
                ws.on("error", reject);
                ws.on("finish", resolve);
            });

            // 🎶 Send audio
            await sock.sendMessage(from, {
                audio: { url: outPath },
                mimetype: "audio/webm",
                fileName: `${video.title}.webm`,
                ptt: false
            });

            // 🧹 Cleanup
            try { fs.unlinkSync(outPath); } catch {}

        } catch (err) {
            console.error("Song download error:", err);
            await sock.sendMessage(from, { text: "❌ Song download failed. Try again later." });
        }
    }
};

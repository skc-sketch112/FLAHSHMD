// plugins/song.js
const yts = require("yt-search");
const ytdl = require("ytdl-core");
const fs = require("fs");
const os = require("os");
const path = require("path");

module.exports = {
  name: "song",
  description: "Download a song from YouTube and send as MP3",
  run: async (sock, from, args) => {
    if (!args || args.length === 0) {
      return sock.sendMessage(from, { text: "❌ Provide a song name.\nExample: `!song shape of you`" });
    }

    const query = args.join(" ");
    await sock.sendMessage(from, { text: `🎵 Searching: *${query}* ...` });

    try {
      const search = await yts(query);
      const video = search.videos && search.videos[0];
      if (!video) return sock.sendMessage(from, { text: "⚠️ No results found." });

      // ⚡ Check duration (limit to 10 minutes)
      if (video.seconds > 600) {
        return sock.sendMessage(from, { text: "⚠️ Song is too long (limit: 10 minutes)." });
      }

      const id = video.videoId;
      const tmpDir = os.tmpdir();
      const outPath = path.join(tmpDir, `${id}.mp3`);

      // Download audio-only
      await new Promise((resolve, reject) => {
        const stream = ytdl(video.url, { filter: "audioonly", quality: "highestaudio" })
          .pipe(fs.createWriteStream(outPath));
        stream.on("finish", resolve);
        stream.on("error", reject);
      });

      // ⚡ Check file size (WhatsApp limit ~16MB)
      const stats = fs.statSync(outPath);
      if (stats.size > 16 * 1024 * 1024) { // 16MB
        fs.unlinkSync(outPath);
        return sock.sendMessage(from, { text: "⚠️ File too large for WhatsApp (limit: 16MB)." });
      }

      // Send song
      await sock.sendMessage(from, {
        audio: { url: outPath },
        mimetype: "audio/mpeg",
        fileName: `${video.title}.mp3`
      });

      try { fs.unlinkSync(outPath); } catch {}

    } catch (err) {
      console.error("Song download error:", err);
      await sock.sendMessage(from, { text: "❌ Song download failed. Try again later." });
    }
  }
};

// plugins/song.js
const yts = require("yt-search");
const ytdl = require("ytdl-core");

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

      // ⏱ Duration check
      if (video.seconds > 600) {
        return sock.sendMessage(from, { text: "⚠️ Song is too long (limit: 10 minutes)." });
      }

      // 🎶 Fetch audio as buffer (no file saving)
      const audioBuffer = await new Promise((resolve, reject) => {
        const chunks = [];
        ytdl(video.url, { filter: "audioonly", quality: "highestaudio" })
          .on("data", (chunk) => chunks.push(chunk))
          .on("end", () => resolve(Buffer.concat(chunks)))
          .on("error", reject);
      });

      // ⚡ Size check (16MB limit)
      if (audioBuffer.length > 16 * 1024 * 1024) {
        return sock.sendMessage(from, { text: "⚠️ File too large for WhatsApp (limit: 16MB)." });
      }

      // ✅ Send audio
      await sock.sendMessage(from, {
        audio: audioBuffer,
        mimetype: "audio/mpeg",
        fileName: `${video.title}.mp3`
      });

    } catch (err) {
      console.error("Song download error:", err);
      await sock.sendMessage(from, { text: "❌ Song download failed. Try again later." });
    }
  }
};

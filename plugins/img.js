// plugins/song.js
const yts = require("yt-search");
const ytdl = require("ytdl-core");
const fs = require("fs");
const os = require("os");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static"); // provides a bundled ffmpeg

if (ffmpegPath) {
  ffmpeg.setFfmpegPath(ffmpegPath);
}

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

      const id = video.videoId;
      const tmpDir = os.tmpdir();
      const srcPath = path.join(tmpDir, `${id}.webm`); // raw audio (usually webm/opus)
      let outPath = path.join(tmpDir, `${id}.mp3`);     // converted mp3

      // 1) Download audio-only stream to temp file
      await new Promise((resolve, reject) => {
        const rs = ytdl(video.url, { filter: "audioonly", quality: "highestaudio" });
        const ws = fs.createWriteStream(srcPath);
        rs.pipe(ws);
        rs.on("error", reject);
        ws.on("error", reject);
        ws.on("finish", resolve);
      });

      // 2) Convert to MP3 if ffmpeg is available, otherwise send the original file
      let mimetype = "audio/mpeg";
      if (ffmpegPath) {
        await new Promise((resolve, reject) => {
          ffmpeg(srcPath)
            .audioBitrate(128)
            .toFormat("mp3")
            .on("end", resolve)
            .on("error", reject)
            .save(outPath);
        });
      } else {
        // no ffmpeg: send the webm/opus file instead
        outPath = srcPath;
        mimetype = "audio/webm";
      }

      // 3) Send the audio
      await sock.sendMessage(from, {
        audio: { url: outPath },
        mimetype,
        fileName: `${video.title}.mp3`,
        ptt: false
      });

      // 4) Cleanup temp files
      try { fs.unlinkSync(srcPath); } catch {}
      if (ffmpegPath) { try { fs.unlinkSync(outPath); } catch {} }

    } catch (err) {
      console.error("Song download error:", err);
      await sock.sendMessage(from, { text: "❌ Song download failed. Check logs and that dependencies are installed." });
    }
  }
};

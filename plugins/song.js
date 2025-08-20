// plugins/song.js
const yts = require("yt-search");
const ytdl = require("ytdl-core");
const fs = require("fs");

module.exports = {
  name: "song",
  description: "Download songs directly from YouTube",
  run: async (sock, from, args) => {
    try {
      if (!args || !args.length) {
        return sock.sendMessage(from, {
          text: "🎵 Usage: `!song <name>`\nExample: `!song Believer`"
        });
      }

      const query = args.join(" ");
      const search = await yts(query);

      if (!search.videos.length) {
        return sock.sendMessage(from, { text: `❌ No results found for *${query}*.` });
      }

      const video = search.videos[0]; // first result

      const file = `./${Date.now()}.mp3`;
      const audioStream = ytdl(video.url, {
        filter: "audioonly",
        quality: "highestaudio"
      }).pipe(fs.createWriteStream(file));

      audioStream.on("finish", async () => {
        try {
          await sock.sendMessage(from, {
            audio: fs.readFileSync(file),  // read and send as audio file
            mimetype: "audio/mpeg",
            ptt: false,
            caption: `🎶 *${video.title}*\n🎤 ${video.author.name}\n📺 YouTube`
          });
        } catch (err) {
          console.error("Error sending audio:", err);
          await sock.sendMessage(from, { text: "❌ Failed to send audio." });
        } finally {
          fs.unlinkSync(file); // cleanup temp file
        }
      });

    } catch (err) {
      console.error("song.js error:", err);
      await sock.sendMessage(from, { text: "❌ Error downloading song. Try again later." });
    }
  }
};

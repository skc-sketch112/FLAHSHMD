// plugins/tts.js

const gTTS = require("gtts");
const { Writable } = require("stream");

module.exports = {
  name: "tts",
  description: "Convert text to speech in multiple languages (Google TTS)",
  run: async (sock, from, args) => {
    try {
      if (!args || args.length < 2) {
        return await sock.sendMessage(from, {
          text: "🔊 Usage:\n!tts <lang_code> <your text>\n\nExample:\n!tts en Hello world\n!tts hi Mera naam Sourav hai\n!tts bn Ami bhalo achi"
        });
      }

      const lang = args[0].toLowerCase();
      const text = args.slice(1).join(" ");

      // Generate TTS
      const gtts = new gTTS(text, lang);
      let buffer = Buffer.alloc(0);

      const writable = new Writable({
        write(chunk, encoding, next) {
          buffer = Buffer.concat([buffer, chunk]);
          next();
        }
      });

      gtts.stream().pipe(writable);

      writable.on("finish", async () => {
        await sock.sendMessage(from, {
          audio: buffer,
          mimetype: "audio/mp4",
          ptt: true, // sends as voice note
        });
      });

    } catch (err) {
      console.error("tts.js error:", err);
      await sock.sendMessage(from, { text: "❌ Failed to generate TTS." });
    }
  }
};

// plugins/tts.js

const gTTS = require("gtts");
const fs = require("fs");

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

      // first argument is lang code
      const lang = args[0].toLowerCase();
      const text = args.slice(1).join(" ");

      const gtts = new gTTS(text, lang);
      const filePath = "./tts.mp3";

      gtts.save(filePath, async function (err) {
        if (err) {
          console.error("TTS error:", err);
          return await sock.sendMessage(from, { text: "❌ Error generating speech." });
        }

        // send as WhatsApp voice note
        await sock.sendMessage(from, {
          audio: { url: filePath },
          mimetype: "audio/mp4",
          ptt: true
        });

        // clean up file
        setTimeout(() => {
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }, 5000);
      });

    } catch (err) {
      console.error("tts.js error:", err);
      await sock.sendMessage(from, { text: "❌ Failed to generate TTS." });
    }
  }
};

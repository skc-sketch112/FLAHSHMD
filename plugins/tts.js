// plugins/tts.js

const gTTS = require("google-tts-api");
const fetch = require("node-fetch");

module.exports = {
  name: "tts",
  description: "Convert text to speech in multiple languages (Render-safe)",
  run: async (sock, from, args) => {
    try {
      if (!args || args.length < 2) {
        return await sock.sendMessage(from, {
          text: "🔊 Usage:\n!tts <lang_code> <your text>\n\nExample:\n!tts en Hello world\n!tts hi Mera naam Sourav hai"
        });
      }

      const lang = args[0].toLowerCase();
      const text = args.slice(1).join(" ");

      // Generate Google TTS URL
      const url = gTTS.getAudioUrl(text, {
        lang,
        slow: false,
        host: "https://translate.google.com",
      });

      // Fetch audio as buffer
      const res = await fetch(url);
      const buffer = await res.buffer();

      // Send as voice note
      await sock.sendMessage(from, {
        audio: buffer,
        mimetype: "audio/mp4",
        ptt: true,
      });

    } catch (err) {
      console.error("tts.js error:", err);
      await sock.sendMessage(from, { text: "❌ Failed to generate TTS." });
    }
  }
};

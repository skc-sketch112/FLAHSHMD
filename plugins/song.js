// plugins/song.js
const fetch = require("node-fetch");

// Fresh working Piped mirrors (add more if needed)
const PIPED_INSTANCES = [
  "https://pipedapi.kavin.rocks",
  "https://pipedapi.syncpundit.com",
  "https://pipedapi.esmailelbob.xyz"
];

// Fetch JSON with timeout
async function fetchJson(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000); // 12 sec
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0" }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timeout);
  }
}

// Try multiple Piped instances
async function getFromPiped(query) {
  for (const base of PIPED_INSTANCES) {
    try {
      // search videos
      const search = await fetchJson(`${base}/api/v1/search?q=${encodeURIComponent(query)}&region=IN`);
      const first = (search || []).find(i => i.type === "stream" || i.type === "video");
      if (!first) continue;

      // get video id
      const id = first.id || (first.url && first.url.split("v=").pop());
      if (!id) continue;

      // get audio streams
      const streams = await fetchJson(`${base}/api/v1/streams/${id}`);
      const audios = streams?.audioStreams || [];
      if (!audios.length) continue;

      // pick best audio (m4a preferred)
      const preferred =
        audios.find(a => /m4a|mp4a/i.test(a.codec || "")) ||
        audios.sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0))[0];

      if (!preferred?.url) continue;

      return {
        title: streams.title || first.title || query,
        artist: (streams.uploader || first.uploader || "Unknown").replace(" - Topic", ""),
        url: preferred.url,
        mime: "audio/mpeg",
        source: base
      };
    } catch (e) {
      console.log(`Piped mirror failed: ${base}`, e.message);
      continue;
    }
  }
  return null;
}

module.exports = {
  name: "song",
  description: "Download song (YouTube audio via Piped)",
  run: async (sock, from, args) => {
    try {
      if (!args || !args.length) {
        return sock.sendMessage(from, { text: "🎵 Usage: `!song <name>`\nExample: `!song Believer`" });
      }

      const query = args.join(" ");
      const result = await getFromPiped(query);

      if (!result) {
        return sock.sendMessage(from, { text: `❌ Could not find audio for *${query}*.` });
      }

      const caption = `🎶 *${result.title}*\n🎤 ${result.artist}\n📡 Source: YouTube`;

      await sock.sendMessage(from, {
        audio: { url: result.url },
        mimetype: result.mime,
        ptt: false,
        caption
      });
    } catch (err) {
      console.error("song.js error:", err);
      await sock.sendMessage(from, { text: "❌ Error fetching song. Try again later." });
    }
  }
};

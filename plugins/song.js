// plugins/song.js
const fetch = require("node-fetch");

// Piped (YouTube) instances to try if Saavn fails
const PIPED_INSTANCES = [
  "https://piped.video",
  "https://pipedapi.kavin.rocks",
  "https://piped.mha.fi"
];

async function fetchJson(url, opts = {}) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 12000); // 12s timeout
  try {
    const res = await fetch(url, {
      ...opts,
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0", ...(opts.headers || {}) }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(t);
  }
}

async function trySaavn(query) {
  try {
    const url = `https://saavn.dev/api/search/songs?query=${encodeURIComponent(query)}&page=1&limit=1`;
    const json = await fetchJson(url);
    const results = json?.data?.results;
    if (!results || results.length === 0) return null;

    const song = results[0];
    const dlArr = Array.isArray(song.downloadUrl) ? song.downloadUrl : [];
    const best = dlArr.length ? dlArr[dlArr.length - 1] : null; // highest quality last (usually 320kbps)
    const downloadUrl = best?.link;

    if (!downloadUrl) return null;

    return {
      title: song.name,
      artist: song.primaryArtists || "Unknown",
      url: downloadUrl,
      mime: "audio/mp4",
      source: "saavn"
    };
  } catch {
    return null;
  }
}

async function tryPiped(query) {
  for (const base of PIPED_INSTANCES) {
    try {
      const search = await fetchJson(`${base}/api/v1/search?q=${encodeURIComponent(query)}&region=IN`);
      const first = (search || []).find(i => i.type === "stream" || i.type === "video");
      if (!first) continue;

      // Get video ID robustly
      const id =
        first.id ||
        (first.url && (first.url.split("v=").pop() || first.url.split("/").pop()));

      if (!id) continue;

      const streams = await fetchJson(`${base}/api/v1/streams/${id}`);
      const audios = streams?.audioStreams || [];
      if (!audios.length) continue;

      // Prefer m4a/mp4a, else highest bitrate
      const preferred =
        audios.find(a => /m4a|mp4a/i.test(a.codec || "")) ||
        audios.sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0))[0];

      if (!preferred?.url) continue;

      return {
        title: streams.title || first.title || query,
        artist: (streams.uploader || first.uploader || "Unknown").replace(" - Topic", ""),
        url: preferred.url,
        mime: "audio/mpeg",
        source: "piped"
      };
    } catch {
      // try next instance
      continue;
    }
  }
  return null;
}

module.exports = {
  name: "song",
  description: "Download a song (Saavn with YouTube fallback)",
  run: async (sock, from, args) => {
    try {
      if (!args || !args.length) {
        return sock.sendMessage(from, { text: "🎵 Usage: `!song <song name>`\nExample: `!song Believer`" });
      }

      const query = args.join(" ");

      // 1) Try Saavn (full track, often 320kbps)
      let result = await trySaavn(query);

      // 2) Fallback to Piped (YouTube audio)
      if (!result) result = await tryPiped(query);

      if (!result) {
        return sock.sendMessage(from, { text: `❌ Couldn't find audio for *${query}*. Try a different name.` });
      }

      const caption = `🎶 *${result.title}*\n🎤 ${result.artist}\n🗂 Source: ${result.source.toUpperCase()}`;

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

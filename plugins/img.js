// plugins/img.js
module.exports = {
  name: "img",
  description: "Fetch one or more images by keyword",
  run: async (sock, from, args) => {
    if (!args || args.length === 0) {
      return sock.sendMessage(from, { text: "❌ Please provide a query.\nExample: `!img cat 3`" });
    }

    // last arg may be a number (how many images)
    let count = 1;
    const last = args[args.length - 1];
    if (!isNaN(last)) {
      count = Math.max(1, Math.min(parseInt(last, 10), 10)); // 1–10
      args.pop();
    }
    const query = args.join(" ");

    const ua = "Mozilla/5.0 (compatible; WhatsAppBot/1.0)";
    const fetchImageBuffer = async (url) => {
      const res = await fetch(url, { headers: { "User-Agent": ua } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const ab = await res.arrayBuffer();
      return Buffer.from(ab);
    };

    // Build N candidates per image so we can fall back if one host blocks us
    const providersFor = (i) => ([
      `https://source.unsplash.com/600x400/?${encodeURIComponent(query)}&sig=${Date.now()}${i}`,
      `https://picsum.photos/seed/${encodeURIComponent(query)}-${Date.now()}${i}/600/400`,
      `https://placehold.co/600x400?text=${encodeURIComponent(query)}`
    ]);

    await sock.sendMessage(from, { text: `🔎 Fetching *${count}* image(s) for: *${query}* ...` });

    for (let i = 0; i < count; i++) {
      let sent = false, lastErr = null;
      for (const url of providersFor(i)) {
        try {
          const img = await fetchImageBuffer(url);
          await sock.sendMessage(from, {
            image: img,
            caption: `✅ ${query} • ${i + 1}/${count}`
          });
          sent = true;
          break;
        } catch (e) {
          lastErr = e;
          // try next provider
        }
      }
      if (!sent) {
        await sock.sendMessage(from, { text: `⚠️ Failed to fetch image ${i + 1}/${count} (${lastErr?.message || "unknown error"})` });
      }
    }
  }
};

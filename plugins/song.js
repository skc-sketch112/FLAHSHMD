// plugins/song.js
const fetch = require("node-fetch");

module.exports = {
    name: "song",
    description: "Download any song for free (JioSaavn)",
    run: async (sock, from, args) => {
        try {
            if (!args || args.length < 1) {
                return sock.sendMessage(from, { text: "🎵 Usage: `!song <song name>`\n\nExample: `!song Believer`" });
            }

            const query = args.join(" ");
            const apiUrl = `https://saavn.dev/api/search/songs?query=${encodeURIComponent(query)}&page=1&limit=1`;

            const res = await fetch(apiUrl);
            const json = await res.json();

            if (!json.data || json.data.results.length === 0) {
                return sock.sendMessage(from, { text: "❌ Song not found. Try another keyword." });
            }

            const song = json.data.results[0];

            // Download 320kbps if available, else 160kbps
            const downloadUrl = song.downloadUrl.pop().link;

            let caption = `🎵 *Song Found!*\n\n`;
            caption += `🎶 Title: ${song.name}\n`;
            caption += `🎤 Artist: ${song.primaryArtists}\n`;
            caption += `💽 Album: ${song.album.name}\n`;
            caption += `🕒 Duration: ${Math.floor(song.duration / 60)}:${song.duration % 60}`;

            await sock.sendMessage(from, {
                audio: { url: downloadUrl },
                mimetype: "audio/mp4",
                ptt: false,
                caption,
            });

        } catch (err) {
            console.error("Song command error:", err);
            await sock.sendMessage(from, { text: "❌ Error fetching song. Try again later." });
        }
    }
};

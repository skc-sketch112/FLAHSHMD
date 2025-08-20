// plugins/song.js
const fetch = require("node-fetch");

module.exports = {
    name: "song",
    description: "Download any song for free (JioSaavn API)",
    run: async (sock, from, args) => {
        try {
            if (!args || args.length < 1) {
                return sock.sendMessage(from, {
                    text: "🎵 Usage: `!song <song name>`\n\nExample: `!song Believer`"
                });
            }

            const query = args.join(" ");
            const apiUrl = `https://saavn.dev/api/search/songs?query=${encodeURIComponent(query)}&page=1&limit=1`;

            const res = await fetch(apiUrl);
            const json = await res.json();

            if (!json.data || !json.data.results || json.data.results.length === 0) {
                return sock.sendMessage(from, { text: "❌ Song not found. Try another keyword." });
            }

            const song = json.data.results[0];
            const downloadUrl = song.downloadUrl && song.downloadUrl.length > 0
                ? song.downloadUrl[song.downloadUrl.length - 1].link
                : null;

            if (!downloadUrl) {
                return sock.sendMessage(from, { text: "⚠️ No download link found for this song." });
            }

            let caption = `🎶 *Song Found!*\n\n`;
            caption += `🎤 Artist: ${song.primaryArtists || "Unknown"}\n`;
            caption += `🎵 Title: ${song.name}\n`;
            caption += `💽 Album: ${song.album?.name || "N/A"}\n`;
            caption += `🕒 Duration: ${Math.floor(song.duration / 60)}:${String(song.duration % 60).padStart(2, "0")}`;

            await sock.sendMessage(from, {
                audio: { url: downloadUrl },
                mimetype: "audio/mp4",
                ptt: false,
                caption
            });

        } catch (err) {
            console.error("Song command error:", err);
            await sock.sendMessage(from, {
                text: "❌ Error fetching song. Try again later."
            });
        }
    }
};

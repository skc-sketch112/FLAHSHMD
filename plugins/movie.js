// plugins/movie.js
const fetch = require("node-fetch");

const TMDB_API_KEY = "cc6b8efb1833054f3bc6d0b6e403dfb7"; // replace with your real key

module.exports = {
    name: "movie",
    description: "Get information about a movie",
    run: async (sock, from, args) => {
        try {
            if (!args || args.length < 1) {
                return sock.sendMessage(from, { text: "❌ Usage: `!movie <movie name>`" });
            }

            const query = args.join(" ");
            const searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`;

            const res = await fetch(searchUrl);
            const data = await res.json();

            if (!data.results || data.results.length === 0) {
                return sock.sendMessage(from, { text: `⚠️ No results found for: *${query}*` });
            }

            // Take first result
            const movie = data.results[0];

            // Get details for richer info
            const detailsUrl = `https://api.themoviedb.org/3/movie/${movie.id}?api_key=${TMDB_API_KEY}&append_to_response=credits`;
            const detailsRes = await fetch(detailsUrl);
            const details = await detailsRes.json();

            const poster = movie.poster_path
                ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                : null;

            const cast = details.credits && details.credits.cast
                ? details.credits.cast.slice(0, 5).map(a => a.name).join(", ")
                : "N/A";

            let caption = `🎬 *${details.title}* (${details.release_date?.split("-")[0] || "N/A"})\n\n` +
                          `⭐ Rating: ${details.vote_average} (${details.vote_count} votes)\n` +
                          `📖 Overview: ${details.overview || "No description"}\n\n` +
                          `🎭 Genres: ${details.genres.map(g => g.name).join(", ")}\n` +
                          `🎤 Cast: ${cast}\n\n` +
                          `⏳ Runtime: ${details.runtime} mins\n` +
                          `🌍 Language: ${details.original_language.toUpperCase()}`;

            await sock.sendMessage(from, poster ? {
                image: { url: poster },
                caption
            } : { text: caption });

        } catch (err) {
            console.error("Movie command error:", err);
            await sock.sendMessage(from, { text: "❌ Error fetching movie info. Try again later." });
        }
    }
};

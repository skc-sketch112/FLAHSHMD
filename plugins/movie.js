// plugins/movie.js
const fetch = require("node-fetch");

// Get a free API key from https://www.omdbapi.com/apikey.aspx
const OMDB_API_KEY = "429b5d5b"; 

module.exports = {
    name: "movie",
    description: "Get information about a movie",
    run: async (sock, from, args) => {
        try {
            if (!args || args.length < 1) {
                return sock.sendMessage(from, { text: "❌ Usage: `!movie <movie name>`" });
            }

            const query = args.join(" ");
            const url = `https://www.omdbapi.com/?t=${encodeURIComponent(query)}&apikey=${OMDB_API_KEY}`;

            const res = await fetch(url);
            const data = await res.json();

            if (data.Response === "False") {
                return sock.sendMessage(from, { text: `⚠️ Movie not found: *${query}*` });
            }

            let caption = `🎬 *${data.Title}* (${data.Year})\n\n` +
                          `⭐ Rating: ${data.imdbRating}\n` +
                          `📖 Plot: ${data.Plot}\n\n` +
                          `🎭 Genre: ${data.Genre}\n` +
                          `🎬 Director: ${data.Director}\n` +
                          `🎤 Actors: ${data.Actors}\n\n` +
                          `🌍 Language: ${data.Language}\n` +
                          `🏆 Awards: ${data.Awards}`;

            await sock.sendMessage(from, {
                image: { url: data.Poster },
                caption
            });

        } catch (err) {
            console.error("Movie command error:", err);
            await sock.sendMessage(from, { text: "❌ Error fetching movie info. Try again later." });
        }
    }
};

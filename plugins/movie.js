// plugins/movie.js
const fetch = require("node-fetch");

const OMDB_API_KEY = "429b5d5b"; // replace with your real key

module.exports = {
    name: "movie",
    description: "Get information about a movie",
    run: async (sock, from, args) => {
        try {
            if (!args || args.length < 1) {
                return sock.sendMessage(from, { text: "❌ Usage: `!movie <movie name>`" });
            }

            const query = args.join(" ");

            // First try to search
            const searchUrl = `https://www.omdbapi.com/?s=${encodeURIComponent(query)}&apikey=${OMDB_API_KEY}`;
            const searchRes = await fetch(searchUrl);
            const searchData = await searchRes.json();

            if (searchData.Response === "False") {
                return sock.sendMessage(from, { text: `⚠️ No results found for: *${query}*` });
            }

            // If only one result → fetch details
            if (searchData.Search.length === 1) {
                const exactTitle = searchData.Search[0].Title;
                const detailsUrl = `https://www.omdbapi.com/?t=${encodeURIComponent(exactTitle)}&apikey=${OMDB_API_KEY}`;
                const detailsRes = await fetch(detailsUrl);
                const data = await detailsRes.json();

                let caption = `🎬 *${data.Title}* (${data.Year})\n\n` +
                              `⭐ Rating: ${data.imdbRating}\n` +
                              `📖 Plot: ${data.Plot}\n\n` +
                              `🎭 Genre: ${data.Genre}\n` +
                              `🎬 Director: ${data.Director}\n` +
                              `🎤 Actors: ${data.Actors}\n\n` +
                              `🌍 Language: ${data.Language}\n` +
                              `🏆 Awards: ${data.Awards}`;

                return sock.sendMessage(from, {
                    image: { url: data.Poster },
                    caption
                });
            }

            // If multiple results → show list
            let list = searchData.Search
                .slice(0, 8) // limit to 8 results
                .map((m, i) => `🎬 *${i + 1}. ${m.Title}* (${m.Year})`)
                .join("\n");

            let caption = `🔍 Search results for: *${query}*\n\n${list}\n\n👉 Type: \`!movie <exact title>\` to get details.`;

            return sock.sendMessage(from, { text: caption });

        } catch (err) {
            console.error("Movie command error:", err);
            await sock.sendMessage(from, { text: "❌ Error fetching movie info. Try again later." });
        }
    }
};

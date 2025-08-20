// plugins/news.js
const fetch = require("node-fetch");

const NEWS_API_KEY = "1d6a61e8aae9471480844a78f316ab2f"; // 🔑 Replace with your free NewsAPI key

module.exports = {
    name: "news",
    description: "Get the latest news headlines",
    run: async (sock, from, args) => {
        try {
            let query = args.length > 0 ? args.join(" ") : "latest";
            let url;

            if (query === "latest") {
                url = `https://newsapi.org/v2/top-headlines?country=in&apiKey=${NEWS_API_KEY}`;
            } else {
                url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&apiKey=${NEWS_API_KEY}`;
            }

            const res = await fetch(url);
            const data = await res.json();

            if (!data.articles || data.articles.length === 0) {
                return sock.sendMessage(from, { text: `⚠️ No news found for *${query}*.` });
            }

            const topNews = data.articles.slice(0, 5); // show only 5 headlines
            let msg = `📰 *Top News for:* ${query}\n\n`;

            topNews.forEach((n, i) => {
                msg += `*${i + 1}. ${n.title}*\n`;
                if (n.source?.name) msg += `📡 Source: ${n.source.name}\n`;
                if (n.url) msg += `🔗 ${n.url}\n\n`;
            });

            await sock.sendMessage(from, { text: msg });

        } catch (err) {
            console.error("News command error:", err);
            await sock.sendMessage(from, { text: "❌ Error fetching news. Try again later." });
        }
    }
};

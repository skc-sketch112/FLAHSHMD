module.exports = {
    name: "img",
    description: "Search an image using Pixabay",
    run: async (sock, from, args) => {
        if (!args || args.length === 0) {
            return await sock.sendMessage(from, { text: "❌ Please provide a search query.\nExample: `!img cat`" });
        }

        const query = args.join(" ");
        const apiKey = "YOUR_PIXABAY_API_KEY"; // Replace with your key
        const url = `https://pixabay.com/api/?key=${apiKey}&q=${encodeURIComponent(query)}&image_type=photo&per_page=5&safesearch=true`;

        try {
            const res = await fetch(url); // fetch works natively in Node v18+
            const data = await res.json();

            if (!data.hits || data.hits.length === 0) {
                return await sock.sendMessage(from, { text: `⚠️ No results found for: *${query}*` });
            }

            const image = data.hits[Math.floor(Math.random() * data.hits.length)].largeImageURL;

            await sock.sendMessage(from, {
                image: { url: image },
                caption: `✅ Result for: *${query}*`
            });

        } catch (err) {
            console.error("Image fetch error:", err);
            await sock.sendMessage(from, { text: "❌ Error while fetching image. Try again later." });
        }
    }
};

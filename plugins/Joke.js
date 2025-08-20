module.exports = {
    name: "joke",
    description: "Get a random joke 😂",
    run: async (sock, from) => {
        try {
            const jokes = [
                "😂 Why don’t scientists trust atoms? Because they make up everything!",
                "🤣 Why did the bicycle fall over? Because it was two-tired!",
                "😆 I told my wife she should embrace her mistakes… she gave me a hug.",
                "😂 Why can’t your nose be 12 inches long? Because then it would be a foot!",
                "🤣 I’m reading a book on anti-gravity… it’s impossible to put down!",
                "😜 Why don’t eggs tell jokes? Because they’d crack each other up!",
                "😂 Why did the computer go to the doctor? Because it caught a virus!",
                "🤣 What do you call fake spaghetti? An impasta!"
            ];

            // Pick random joke
            const joke = jokes[Math.floor(Math.random() * jokes.length)];

            await sock.sendMessage(from, { 
                text: `🎭 *Here’s a joke for you:*\n\n${joke}` 
            });

        } catch (err) {
            console.error("Joke command error:", err);
            await sock.sendMessage(from, { text: "❌ Failed to fetch a joke. Try again later." });
        }
    }
};

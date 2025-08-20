// roast.js
const roastCategories = {
    savage: [
        "You're like a cloud. When you disappear, it's a beautiful day. 🌤️",
        "You bring everyone so much joy… when you leave the room. 😏",
        "Somewhere out there, a tree is tirelessly producing oxygen for you. I think you owe it an apology. 🌳",
        "If I throw a stick, will you leave? 🐕",
        "You're proof that even evolution takes a break sometimes. 🦖"
    ],
    funny: [
        "You're like a software update. Whenever I see you, I think, 'Do I really need this right now?' 💻",
        "You have something on your chin… no, the third one down. 😆",
        "You're like a cloud storage service – full of useless data. ☁️",
        "You're like Wi-Fi at a hotel — expensive and mostly useless. 📶",
        "You're the reason they put directions on shampoo bottles. 🧴"
    ],
    light: [
        "You're like a Monday… nobody really likes you but we all tolerate you. 😅",
        "You're the human version of autocorrect — always wrong at the worst time. 🤖",
        "You're like a math book — full of problems. ➗",
        "You have something most people don’t: bad taste in everything. 👎",
        "You're like a browser with 100 tabs open and all of them are frozen. 🖥️"
    ]
};

// Combine all into one list for random roasts
const allRoasts = [...roastCategories.savage, ...roastCategories.funny, ...roastCategories.light];

module.exports = {
    name: "roast",
    description: "Get a random roast or roast with categories (savage/funny/light)",
    run: async (sock, from, args, msg) => {
        try {
            let category = args[0]?.toLowerCase();
            let roast;

            if (category && roastCategories[category]) {
                const roasts = roastCategories[category];
                roast = roasts[Math.floor(Math.random() * roasts.length)];
            } else {
                roast = allRoasts[Math.floor(Math.random() * allRoasts.length)];
            }

            let text;
            let mentions = [];

            if (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
                const mentioned = msg.message.extendedTextMessage.contextInfo.mentionedJid[0];
                mentions = [mentioned];
                text = `🔥 Roast Time (${category || "random"}) 🔥\n\n@${mentioned.split('@')[0]} ${roast}`;
            } else {
                text = `🔥 Roast Time (${category || "random"}) 🔥\n\n${roast}`;
            }

            await sock.sendMessage(from, { text, mentions });
        } catch (err) {
            console.error("Roast error:", err);
            await sock.sendMessage(from, { text: "❌ Failed to fetch roast. Try again later." });
        }
    }
};

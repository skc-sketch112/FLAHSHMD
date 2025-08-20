// plugins/textemoji.js

module.exports = {
    name: "textemoji",
    description: "Convert text into different emoji styles",
    run: async (sock, from, args) => {
        try {
            if (!args || args.length < 1) {
                return await sock.sendMessage(from, {
                    text: "❌ Usage: !textemoji <your text>\n\nExample: !textemoji hello"
                });
            }

            const text = args.join(" ");

            // Emoji text styles
            const styles = {
                "squared": {
                    a:"🅰", b:"🅱", c:"🅲", d:"🅳", e:"🅴", f:"🅵", g:"🅶", h:"🅷", i:"🅸", j:"🅹",
                    k:"🅺", l:"🅻", m:"🅼", n:"🅽", o:"🅾", p:"🅿", q:"🆀", r:"🆁", s:"🆂", t:"🆃",
                    u:"🆄", v:"🆅", w:"🆆", x:"🆇", y:"🆈", z:"🆉"
                },
                "circle": {
                    a:"ⓐ", b:"ⓑ", c:"ⓒ", d:"ⓓ", e:"ⓔ", f:"ⓕ", g:"ⓖ", h:"ⓗ", i:"ⓘ", j:"ⓙ",
                    k:"ⓚ", l:"ⓛ", m:"ⓜ", n:"ⓝ", o:"ⓞ", p:"ⓟ", q:"ⓠ", r:"ⓡ", s:"ⓢ", t:"ⓣ",
                    u:"ⓤ", v:"ⓥ", w:"ⓦ", x:"ⓧ", y:"ⓨ", z:"ⓩ"
                },
                "boldcircle": {
                    a:"🅐", b:"🅑", c:"🅒", d:"🅓", e:"🅔", f:"🅕", g:"🅖", h:"🅗", i:"🅘", j:"🅙",
                    k:"🅚", l:"🅛", m:"🅜", n:"🅝", o:"🅞", p:"🅟", q:"🅠", r:"🅡", s:"🅢", t:"🅣",
                    u:"🅤", v:"🅥", w:"🅦", x:"🅧", y:"🅨", z:"🅩"
                }
            };

            // Convert text into each style
            const results = [];
            for (let styleName in styles) {
                let converted = "";
                for (let char of text.toLowerCase()) {
                    if (styles[styleName][char]) {
                        converted += styles[styleName][char];
                    } else {
                        converted += char; // keep spaces/punctuation
                    }
                }
                results.push(`✨ *${styleName.toUpperCase()}*\n${converted}`);
            }

            await sock.sendMessage(from, { text: results.join("\n\n") });

        } catch (err) {
            console.error("textemoji command error:", err);
            await sock.sendMessage(from, { text: "❌ Error generating text emojis. Try again later." });
        }
    }
};

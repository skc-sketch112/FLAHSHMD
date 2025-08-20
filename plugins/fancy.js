// plugins/fancy.js

module.exports = {
  name: "fancy",
  description: "Convert text into 30+ fancy stylish fonts",
  run: async (sock, from, args) => {
    try {
      if (!args || args.length < 1) {
        return await sock.sendMessage(from, {
          text: "✨ Usage:\n`!fancy <text>` → all styles\n`!fancy <style_number> <text>` → one style\n\nExample:\n`!fancy hello`\n`!fancy 7 hello world`"
        });
      }

      // fancy alphabet sets (30+ styles)
      const fonts = [
        "𝓪𝓫𝓬𝓭𝓮𝓯𝓰𝓱𝓲𝓳𝓴𝓵𝓶𝓷𝓸𝓹𝓺𝓻𝓼𝓽𝓾𝓿𝔀𝔁𝔂𝔃",
        "𝗮𝗯𝗰𝗱𝗲𝗳𝗴𝗵𝗶𝗷𝗸𝗹𝗺𝗻𝗼𝗽𝗾𝗿𝘀𝘁𝘶𝘃𝘄𝘅𝘆𝘇",
        "𝒶𝒷𝒸𝒹ℯ𝒻ℊ𝒽𝒾𝒿𝓀𝓁𝓂𝓃ℴ𝓅𝓆𝓇𝓈𝓉𝓊𝓋𝓌𝓍𝓎𝓏",
        "🅐🅑🅒🅓🅔🅕🅖🅗🅘🅙🅚🅛🅜🅝🅞🅟🅠🅡🅢🅣🅤🅥🅦🅧🅨🅩",
        "ⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙⓚⓛⓜⓝⓞⓟⓠⓡⓢⓣⓤⓥⓦⓧⓨⓩ",
        "𝕒𝕓𝕔𝕕𝕖𝕗𝕘𝕙𝕚𝕛𝕜𝕝𝕞𝕟𝕠𝕡𝕢𝕣𝕤𝕥𝕦𝕧𝕨𝕩𝕪𝕫",
        "𝖆𝖇𝖈𝖉𝖊𝖋𝖌𝖍𝖎𝖏𝖐𝖑𝖒𝖓𝖔𝖕𝖖𝖗𝖘𝖙𝖚𝖛𝖜𝖝𝖞𝖟",
        "𝘢𝘣𝘤𝘥𝘦𝘧𝘨𝘩𝘪𝘫𝘬𝘭𝘮𝘯𝘰𝘱𝘲𝘳𝘴𝘵𝘶𝘷𝘸𝘹𝘺𝘻",
        "𝙖𝙗𝙘𝙙𝙚𝙛𝙜𝙝𝙞𝙟𝙠𝙡𝙢𝙣𝙤𝙥𝙦𝙧𝙨𝙩𝙪𝙫𝙬𝙭𝙮𝙯",
        "αв¢∂єƒgнιנкℓмησρqяѕтυνωχуz",
        "ค๖¢໓ēfງhเןkl๓ภ๏pợrรtนงຟxฯչ",
        "ɐqɔpǝɟƃɥᴉɾʞʅɯuodbɹsʇnʌʍxʎz", // upside-down
        "ᗩᗷᑕᗪEᖴGᕼIᒍKᒪᗰᑎOᑭᑫᖇᔕTᑌᐯᗯ᙭Yᘔ",
        "ＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺ",
        "ᴀʙᴄᴅᴇғɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢ",
        "🄰🄱🄲🄳🄴🄵🄶🄷🄸🄹🄺🄻🄼🄽🄾🄿🅀🅁🅂🅃🅄🅅🅆🅇🅈🅉",
        "🅰🅱🅲🅳🅴🅵🅶🅷🅸🅹🅺🅻🅼🅽🅾🅿🆀🆁🆂🆃🆄🆅🆆🆇🆈🆉",
        "𝗔𝗕𝗖𝗗𝗘𝗙𝗚𝗛𝗜𝗝𝗞𝗟𝗠𝗡𝗢𝗣𝗤𝗥𝗦𝗧𝗨𝗩𝗪𝗫𝗬𝗭",
        "𝓐𝓑𝓒𝓓𝓔𝓕𝓖𝓗𝓘𝓙𝓚𝓛𝓜𝓝𝓞𝓟𝓠𝓡𝓢𝓣𝓤𝓥𝓦𝓧𝓨𝓩",
        "🄐🄑🄒🄓🄔🄕🄖🄗🄘🄙🄚🄛🄜🄝🄞🄟🄠🄡🄢🄣🄤🄥🄦🄧🄨🄩", // circled bold
        "🅐🅑🅒🅓🅔🅕🅖🅗🅘🅙🅚🅛🅜🅝🅞🅟🅠🅡🅢🅣🅤🅥🅦🅧🅨🅩",
        "𝗮𝗯𝗰𝗱𝗲𝗳𝗴𝗵𝗶𝗷𝗸𝗹𝗺𝗻𝗼𝗽𝗾𝗿𝘀𝘁𝘶𝘃𝘄𝘅𝘆𝘇",
        "𝒜𝐵𝒞𝒟𝐸𝐹𝒢𝐻𝐼𝒥𝒦𝐿𝑀𝒩𝒪𝒫𝒬𝑅𝒮𝒯𝒰𝒱𝒲𝒳𝒴𝒵", // calligraphy
        "🅱︎🅲︎🅳︎🅴︎🅵︎🅶︎🅷︎🅸︎🅹︎🅺︎🅻︎🅼︎🅽︎🅾︎🅿︎🆀︎🆁︎🆂︎🆃︎🆄︎🆅︎🆆︎🆇︎🆈︎🆉︎",
        "ʙᴏʟᴅ sᴍᴀʟʟ ᴄᴀᴘs",
        "𝔸𝔹ℂ𝔻𝔼𝔽𝔾ℍ𝕀𝕁𝕂𝕃𝕄ℕ𝕆ℙℚℝ𝕊𝕋𝕌𝕍𝕎𝕏𝕐ℤ", // double struck
        "🅑🅞🅧 🅢🅣🅨🅛🅔",
        "🅛🅐🅡🅖🅔 🅑🅞🅛🅓",
        "𝓼𝓬𝓻𝓲𝓹𝓽 𝓼𝓽𝔂𝓵𝓮",
        "ℓιкє тнιѕ",
        "『ғᴀɴᴄʏ』"
      ];

      function stylize(text, font) {
        const normal = "abcdefghijklmnopqrstuvwxyz";
        return text
          .split("")
          .map((c) => {
            const lower = c.toLowerCase();
            const i = normal.indexOf(lower);
            if (i !== -1) {
              return font[i] || c;
            }
            return c;
          })
          .join("");
      }

      let msg = "";

      // check if first arg is a number (style selector)
      const firstArgNum = parseInt(args[0]);
      if (!isNaN(firstArgNum) && firstArgNum > 0 && firstArgNum <= fonts.length) {
        const text = args.slice(1).join(" ");
        if (!text) {
          return await sock.sendMessage(from, { text: "⚠️ Please enter some text after style number." });
        }
        msg = `✨ Fancy Style ${firstArgNum}\n${stylize(text, fonts[firstArgNum - 1])}`;
      } else {
        const text = args.join(" ");
        msg = `✨ *Fancy Text Generator*\nInput: ${text}\n\n`;
        fonts.forEach((font, i) => {
          msg += `${i + 1}. ${stylize(text, font)}\n`;
        });
      }

      await sock.sendMessage(from, { text: msg });

    } catch (err) {
      console.error("Fancy.js error:", err);
      await sock.sendMessage(from, { text: "❌ Error generating fancy text." });
    }
  }
};

const surahMap = {
    fatiha: 1, baqarah: 2, imran: 3, nisa: 4, maidah: 5, anam: 6, araf: 7,
    anfal: 8, tawbah: 9, yunus: 10, hud: 11, yusuf: 12, raad: 13, ibrahim: 14,
    hijr: 15, nahl: 16, isra: 17, kahf: 18, maryam: 19, taha: 20, anbiya: 21,
    hajj: 22, muminoon: 23, nur: 24, furqan: 25, shuara: 26, naml: 27, qasas: 28,
    ankabut: 29, rum: 30, luqman: 31, sajdah: 32, ahzab: 33, saba: 34, fatir: 35,
    yaseen: 36, saffat: 37, sad: 38, zumar: 39, ghafir: 40, fussilat: 41,
    shura: 42, zukhruf: 43, dukhan: 44, jathiyah: 45, ahqaf: 46, muhammad: 47,
    fath: 48, hujurat: 49, qaf: 50, dhariyat: 51, tur: 52, najm: 53, qamar: 54,
    rahman: 55, waqiah: 56, hadid: 57, mujadila: 58, hashr: 59, mumtahanah: 60,
    saff: 61, jumuah: 62, munafiqun: 63, taghabun: 64, talaq: 65, tahrim: 66,
    mulk: 67, qalam: 68, haqqah: 69, maarij: 70, nuh: 71, jinn: 72, muzzammil: 73,
    muddaththir: 74, qiyamah: 75, insan: 76, mursalat: 77, naba: 78, naziat: 79,
    abasa: 80, takwir: 81, infitar: 82, mutaffifin: 83, inshiqaq: 84, buruj: 85,
    tariq: 86, aala: 87, ghashiyah: 88, fajr: 89, balad: 90, shams: 91, lail: 92,
    duha: 93, sharh: 94, tin: 95, alaq: 96, qadr: 97, bayyinah: 98, zilzal: 99,
    adiyat: 100, qariah: 101, takathur: 102, asr: 103, humazah: 104, fil: 105,
    quraysh: 106, maun: 107, kawthar: 108, kafirun: 109, nasr: 110, masad: 111,
    ikhlas: 112, falaq: 113, nas: 114
};

module.exports = {
    name: "quran",
    description: "Get Quran verse(s) by Surah and Ayah",
    run: async (sock, from, args) => {
        if (!args || args.length < 2) {
            return sock.sendMessage(from, { 
                text: "❌ Usage: `!quran <surah_name/number> <ayah_number>` or `!quran <surah> <start-end>`\nExample: `!quran fatiha 1-7` or `!quran baqarah 255`"
            });
        }

        let surah = args[0].toLowerCase();
        let ayahInput = args[1];

        // convert surah to number if string
        if (isNaN(surah)) {
            surah = surahMap[surah];
        } else {
            surah = parseInt(surah, 10);
        }

        if (!surah || surah < 1 || surah > 114) {
            return sock.sendMessage(from, { text: "⚠️ Invalid surah. Use a valid surah name or number (1-114)." });
        }

        try {
            let verses = [];

            if (ayahInput.includes("-")) {
                // range e.g. 1-7
                const [start, end] = ayahInput.split("-").map(n => parseInt(n, 10));
                for (let i = start; i <= end; i++) {
                    const res = await fetch(`https://api.alquran.cloud/v1/ayah/${surah}:${i}/en.asad`);
                    const json = await res.json();
                    if (json && json.data) {
                        verses.push(`(${i}) ${json.data.text}`);
                    }
                }
            } else {
                // single ayah
                const ayah = parseInt(ayahInput, 10);
                const res = await fetch(`https://api.alquran.cloud/v1/ayah/${surah}:${ayah}/en.asad`);
                const json = await res.json();
                if (json && json.data) {
                    verses.push(`(${ayah}) ${json.data.text}`);
                }
            }

            if (verses.length === 0) {
                return sock.sendMessage(from, { text: "⚠️ Verse(s) not found." });
            }

            await sock.sendMessage(from, {
                text: `📖 *Surah ${surah}*\n\n${verses.join("\n\n")}`
            });

        } catch (err) {
            console.error("Quran fetch error:", err);
            await sock.sendMessage(from, { text: "❌ Error fetching Quran verse(s). Try again later." });
        }
    }
};

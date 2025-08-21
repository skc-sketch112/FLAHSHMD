const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion
} = require("@whiskeysockets/baileys");
const express = require("express");
const qrcode = require("qrcode");

const app = express();
const PORT = process.env.PORT || 3000;

(async () => {
  const { state, saveCreds } = await useMultiFileAuthState("auth");
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    printQRInTerminal: false, // disable console QR
    auth: state
  });

  // Serve QR code as image link
  sock.ev.on("connection.update", async (update) => {
    const { connection, qr } = update;

    if (qr) {
      const qrImageUrl = await qrcode.toDataURL(qr);
      app.get("/qr", (req, res) => {
        res.send(`
          <h2>📱 Scan this QR with WhatsApp</h2>
          <img src="${qrImageUrl}" />
        `);
      });
      console.log(`➡️ Open http://localhost:${PORT}/qr to scan QR`);
    }

    if (connection === "open") {
      console.log("✅ WhatsApp bot connected!");
    }
  });

  sock.ev.on("creds.update", saveCreds);

  // Health check route
  app.get("/", (req, res) => {
    res.send("✅ WhatsApp bot is running");
  });

  app.listen(PORT, () => {
    console.log(`🌍 Server running on http://localhost:${PORT}`);
  });
})();

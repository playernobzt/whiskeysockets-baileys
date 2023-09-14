const { default: makeWASocket, Browsers } = require("@whiskeysockets/baileys");
const {
  DisconnectReason,
  useMultiFileAuthState,
} = require("@whiskeysockets/baileys");

// const { default: Boom } = require("@hapi/boom");

// const pino = require("pino");

async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState("auth_info_baileys");
  const sock = makeWASocket({
    // can provide additional config here
    printQRInTerminal: true,
    browser: Browsers.ubuntu("Server"),
    auth: state,
    // logger: pino({ level: "silent" }),
  });
  sock.ev.on("connection.update", function (update, connection2) {
    let _a, _b;
    let connection = update.connection,
      lastDisconnect = update.lastDisconnect;

    if (connection == "close") {
      if (
        ((_b =
          (_a = lastDisconnect.error) === null || _a === void 0
            ? void 0
            : _a.output) === null || _b === void 0
          ? void 0
          : _b.statusCode) !== DisconnectReason.loggedOut
      ) {
        connectToWhatsApp();
      } else {
        console.log("Server Close");
      }
    }
    console.log("connection update ", update);
  });

  sock.ev.on("creds.update", saveCreds);

  //   sock.ev.on("connection.update", (update) => {
  //     const { connection, lastDisconnect } = update;
  //     if (connection === "close") {
  //       const shouldReconnect =
  //         (lastDisconnect.error = Boom)?.output?.statusCode !==
  //         DisconnectReason.loggedOut;
  //       console.log(
  //         "connection closed due to ",
  //         lastDisconnect.error,
  //         ", reconnecting ",
  //         shouldReconnect
  //       );
  //       // reconnect if not logged out
  //       if (shouldReconnect) {
  //         connectToWhatsApp();
  //       }
  //     } else if (connection === "open") {
  //       console.log("opened connection");
  //     }
  //   });

  //   sock.ev.on("connection.update", ({ connection }) => {
  //     if (connection === "open") {
  //       console.log("ready");
  //     } else if (connection === "close") {
  //       connectToWhatsApp();
  //     }
  //   });
  sock.ev.on("messages.upsert", ({ messages }) => {
    const bodyPesan = messages[0];
    const cmd = bodyPesan.message.conversation;

    function reply(text) {
      sock.sendMessage(
        bodyPesan.key.remoteJid,
        { text: text },
        { quoted: bodyPesan }
      );
    }

    if (cmd === "ping") {
      reply("pong");
      return;
    }
  });
}
// run in main file
connectToWhatsApp();

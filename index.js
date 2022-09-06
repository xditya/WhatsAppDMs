/*
WhatsAppDMs

Author: Aditya. 
Source: https://github.com/xditya/WhatsAppDMs
*/

const fs = require("fs");
const { parse } = require("csv-parse");
const qrcode = require("qrcode-terminal");
const { Client, LocalAuth } = require("whatsapp-web.js");

const client = new Client({
  authStrategy: new LocalAuth({
    dataPath: "./WhatsAppDMs",
  }),
  puppeteer: { headless: true, args: ["--no-sandbox"] },
});

client.on("qr", (qr) => {
  console.log("Generating QR Code...");
  console.log(
    "Please scan the below QR code to login to your WhatsApp number."
  );
  console.log(qrcode.generate(qr, { small: true }));
});

client.on("authenticated", async () => {
  console.log("Authenticated!");
});
client.on("ready", async () => {
  console.log("\nBot is up. Beginning to send messages...\n");
  sendMessages();
});

function sendMessages() {
  const readline = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  let number = 0;
  readline.question(`Enter the message to be sent: `, (msg) => {
    fs.createReadStream("data.csv")
      .pipe(parse({ delimiter: ",", from_line: 2 }))
      .on("data", function (row) {
        number = row[1];
        if (number.startsWith("+")) number = number.substring(1);
        number += "@c.us";
        client.sendMessage(number, msg);
      })
      .on("end", function () {
        console.log("Finished sending messages!\nUse Ctrl+C to exit.");
      })
      .on("error", function (error) {
        console.log(error.message);
      });
    readline.close();
  });
}

client.initialize();

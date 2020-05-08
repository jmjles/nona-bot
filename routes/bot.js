require("dotenv").config();
const route = require("express").Router();
const { Client, MessageEmbed } = require("discord.js");
const client = new Client();
const token = process.env.TOKEN;
const { goldPriceLookup, priceLookup } = require("./botFunctions");
let prefix = "`";
let lang = "EN-US";
const latom = "./assets/latom.png";
client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on("message", async (msg) => {
  const input = msg.content.split(" ");
  const cmd = input[1].toLowerCase();

  if (input[0] === prefix) {
    switch (cmd) {
      case "zevax":
        return msg.channel.send("Nothing to worry about now @Lunars");

      //! Albion Market Commands

      //* Price Lookup
      case "price": {
        let name = "";
        for (let i = 2; i < input.length; i++) {
          name = name + " " + input[i];
          name = name.trim();
        }

        const results = await priceLookup(name, lang);

        const embedprice = new MessageEmbed()
          .setTitle(
            `${results.uniName.substring(0, 2)}${
              results.uniName.includes("@")
                ? `.${results.uniName.charAt(results.uniName.length - 1)}`
                : ""
            } ${results.name}`
          )
          .setDescription(results.results);
        return msg.channel.send(embedprice);
      }

      //* Gold Lookup
      case "gold": {
        const results = await goldPriceLookup();
        const embedmsg = new MessageEmbed()
        .setTitle("Recent Gold Prices")
        .setDescription(results)
        return msg.channel.send(embedmsg);
      }
      case 'latom':
      case 'f':{
      const embedmsg = new MessageEmbed()
        .attachFiles([latom])
        .setImage("attachment://latom.png");
      return msg.channel.send(embedmsg);
      }

      default: {
        msg.channel.send("Help menu coming soon...");
      }
    }
  }
});
client.login(token);
route.get("/", (req, res) => res.send("Bot"));

module.exports = route;

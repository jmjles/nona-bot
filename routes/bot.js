require("dotenv").config();
const route = require("express").Router();
const { Client, MessageEmbed } = require("discord.js");
const client = new Client();
const token = process.env.TOKEN;
const { goldPriceLookup, priceLookup, getPlayer } = require("./botFunctions");
let prefix = "`";
let lang = "EN-US";
const latom = "./assets/latom.png";
const smileNona = "./assets/smilenona.png";
const botColor = "#00f0ff";
client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on("message", async (msg) => {
  const input = msg.content.split(" ");
  if (input[0] === prefix) {
    const cmd = input[1].toLowerCase();
    switch (cmd) {
      //! Albion Commands

      //? Market Commands

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
          .setDescription(results.results)
          .setColor(botColor);
        return msg.channel.send(embedprice);
      }

      //* Gold Lookup
      case "gold": {
        const results = await goldPriceLookup();
        const embedmsg = new MessageEmbed()
          .setTitle("Recent Gold Prices")
          .setDescription(results)
          .setColor(botColor);
        return msg.channel.send(embedmsg);
      }

      //? Player Commands

      //* Player Search
      case "player": {
        if (!input[2]) {
          return msg.channel.send(
            `To search a player, use the following command:\n\`\`\`${prefix} player [playername]\`\`\``
          );
        }
        msg.channel.send("Experimental command!");
        const result = await getPlayer(input[2]);
        if (!result.name) {
          return msg.channel.send("Player search failed...");
        }
        const embedmsg = new MessageEmbed()
          .setTitle(result.name)
          .setDescription(
            `Guild: ${
              !result.alliance ? "" : `[${result.alliance.toUpperCase()}]`
            } ${result.guild}\n\nKill Fame: ${result.killfame}\n\nDeath Fame: ${
              result.deathfame
            }`
          )
          .setColor(botColor);
        return msg.channel.send(embedmsg);
      }

      case "guild": {
        if (!input[2]) {
          return msg.channel.send(
            `To search a guild, use the following command:\n\`\`\`${prefix} guild [guildname]\`\`\``
          );
        }
        msg.channel.send("Experimental command!");
        let name = "";
        for (let i = 2; i < input.length; i++) {
          name = name + " " + input[i];
          name = name.trim();
        }
        const result = await getPlayer(name);
        
        console.log(result);
        /*         if (!result.name) {
          return msg.channel.send("Player search failed...");
        }
        const embedmsg = new MessageEmbed()
          .setTitle(result.name)
          .setDescription(
            `Guild: ${
              !result.alliance ? "" : `[${result.alliance.toUpperCase()}]`
            } ${result.guild}\n\nKill Fame: ${result.killfame}\n\nDeath Fame: ${
              result.deathfame
            }`
          )
          .setColor(botColor);
        return msg.channel.send(embedmsg); */
        return;
      }
      //! General Commands

      //* Prefix
      case "prefix": {
        if (!input[2]) {
          return msg.channel.send(
            `Current prefix is: ${prefix}\nTo change the prefix,use the following command:\n\`\`\`${prefix} prefix [newprefix]\`\`\``
          );
        }
        prefix = input[2];
        return msg.channel.send(`Prefix has been changed to: ${prefix}`);
      }

      //! Fun Commands

      //* Thank you
      case "thank": {
        if (!input[2]) {
          return;
        } else if (input[2].toLowerCase() === "you") {
          const embedmsg = new MessageEmbed()
            .attachFiles([smileNona])
            .setImage("attachment://smilenona.png")
            .setColor(botColor);
          return msg.channel.send(embedmsg);
        }
      }
      //* Latom
      case "latom":
      case "f": {
        const embedmsg = new MessageEmbed()
          .attachFiles([latom])
          .setImage("attachment://latom.png")
          .setColor(botColor);
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

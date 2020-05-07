require("dotenv").config();
const route = require("express").Router();
const { Client, MessageEmbed } = require("discord.js");
const moment = require("moment");
const client = new Client();
const token = process.env.TOKEN;
const { goldPrice } = require("./botFunctions");

let prefix = "n!";

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on("message", async (msg) => {
  const input = msg.content.split(' ')
  //!Albion Market
  //Item Price Lookup
  //Gold Price
  if (msg.content === `${prefix} gold`) {
    const data = await goldPrice();
    const prices = [];
    data.forEach((e) =>
      prices.push(
        `silver ${e.price} ${moment(
          e.timestamp.split("T")[1],
          "h:mm"
        ).fromNow()}\n`
      )
    );
    const embedmsg = new MessageEmbed()
      .setTitle("Recent Gold Prices")
      .setColor("#ff6666")
      .setDescription(prices)
      .setTimestamp(Date.now());
    msg.channel.send(embedmsg);

    //! General
    //Set Prefix
  } else if (
    msg.content.split(" ")[0] === prefix &&
    msg.content.split(" ")[1] === "prefix"
  ) {
    if (msg.content.split(" ")[2]) {
      prefix = msg.content.split(" ")[2];
      msg.channel.send(`Prefix is now set to: ${prefix}`);
    }else{
      msg.channel.send(`Current prefix is: ${prefix}\nTo change the prefix, use the following command: \`\`\`${prefix} prefix [NewPrefix]\`\`\``)
    }
  }
});
client.login(token);
route.get("/", (req, res) => res.send("Bot"));

module.exports = route;

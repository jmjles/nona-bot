require("dotenv").config();
const route = require("express").Router();
const { Client, MessageEmbed } = require("discord.js");
const moment = require("moment");
const client = new Client();
const token = process.env.TOKEN;
const { goldPrice, price } = require("./botFunctions");
const itemList = require("../assets/items.json");
let prefix = "n!";
let lang = "EN-US";
client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on("message", async (msg) => {
  const input = msg.content.split(" ");
  if (input[0] === prefix) {
    if (input[1].match(/zevax/i)) {
      msg.channel.send("Tell lunars we'll be waiting");
    }
    if (input[1].match(/price/i)) {
      let name = "";
      for (let i = 2; i < input.length; i++) {
        name = name + " " + input[i];
        name = name.trim();
      }
      //!Albion Market
      //Item Price Lookup
      console.log(name);
      let regex = new RegExp(name, "gi");
      let filtered = itemList.filter((item) => item.LocalizedNames);
      filtered = filtered.filter(
        (item) =>
          !item.LocalizationNameVariable.match(new RegExp("nontradable", "gi"))
      );
      filtered = filtered.filter((item) =>
        item.LocalizedNames[lang].match(regex)
      );
      console.log(filtered);
      const embedmsg = new MessageEmbed()
        .setTitle("Search Results")
        .setDescription(
          filtered.map(
            (item) =>
              `${item.UniqueName.substring(0, 2)}${
                item.UniqueName.includes("@")
                  ? `.${item.UniqueName.charAt(item.UniqueName.length - 1)}`
                  : ""
              } ${item.LocalizedNames[lang]}`
          )
        );
      const data = await price(filtered[0].UniqueName);
      console.log(data)
      const results = []
      data.forEach((item) => results.push(
        `${item.city}\n Sell Price: ${item.sell_price_min} ${moment(
          item.sell_price_min_date.split("T")[1],
          "h:mm"
        ).fromNow()}\n Buy Price: ${item.buy_price_min} ${moment(
          item.buy_price_min_date.split("T")[1],
          "h:mm"
        ).fromNow()}\n\n`
      ));
      console.log(results)
      const embedprice = new MessageEmbed()
        .setTitle(
          `${filtered[0].UniqueName.substring(0, 2)}${
            filtered[0].UniqueName.includes("@")
              ? `.${filtered[0].UniqueName.charAt(filtered[0].UniqueName.length - 1)}`
              : ""
          } ${filtered[0].LocalizedNames[lang]}`
        )
        .setDescription(results);
      msg.channel.send(embedprice);
    }
    //Gold Price
    if (input[1].match(/gold/i)) {
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
        .setDescription(prices)
        .setTimestamp(Date.now());
      msg.channel.send(embedmsg);

      //! General
      //Set Prefix
    } else if (input[1].match(/prefix/i)) {
      if (input[2]) {
        prefix = input[2];
        msg.channel.send(`Prefix is now set to: ${prefix}`);
      } else {
        msg.channel.send(
          `Current prefix is: ${prefix}\nTo change the prefix, use the following command: \`\`\`${prefix} prefix [NewPrefix]\`\`\``
        );
      }
    }
  }
});
client.login(token);
route.get("/", (req, res) => res.send("Bot"));

module.exports = route;

require("dotenv").config();
const route = require("express").Router();
const Discord = require("discord.js");
const client = new Discord.Client();
const token = process.env.TOKEN;
client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});
client.on("message", (msg) => {
  if (msg.content === "hey")
    msg.reply("How are you doing?", {
      hexColor: "#ff6666",
    });
});
client.login(token);
route.get("/", (req, res) => res.send("Bot"));

module.exports = route;

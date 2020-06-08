require("dotenv").config();
const route = require("express").Router();
const { Client, MessageEmbed } = require("discord.js");
const client = new Client();
const queue = new Map();
const ytdl = require("ytdl-core-discord");
const token = process.env.TOKEN;
const {
  goldPriceLookup,
  priceLookup,
  getPlayer,
  getGuild,
  getGuildMember,
  aboutItem,
  productName,
} = require("./botFunctions");

let prefix = "`";
let lang = "EN-US";

const latom = "./assets/latom.png";
const smileNona = "./assets/smilenona.png";

const botColor = "#00f0ff";
const errorColor = "#ff1a1a";
const emojis = { 1: "1️⃣", 2: "2️⃣", 3: "3️⃣", 4: "4️⃣", 5: "5️⃣" };

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on("message", async (msg) => {
  if (msg.author.bot) return;

  const input = msg.content.split(" ");

  const serverQueue = queue.get(msg.guild.id);
  let name = "";
  for (let i = 2; i < input.length; i++) {
    name = name + " " + input[i];
    name = name.trim().toLowerCase();
  }
  const functions = {
    //* Albion Online Commands

    price: {
      async func() {
        const results = productName(name, lang);

        if (results.length === 0)
          return new MessageEmbed()
            .setTitle("Item not found")
            .setColor(botColor);
        let options = {};
        results.forEach((v, i) => (options[emojis[i + 1]] = [i + 1]));

        const filter = (reaction, user) =>
          user.id === msg.author.id && options[reaction.emoji.name];

        msg.channel
          .send(
            new MessageEmbed()
              .setTitle("Search Results:")
              .setDescription(
                results.map(
                  (item, i) => `${i + 1}. ${item.displayName}\n`
                )
              )
              .setColor(botColor)
          )
          .then((msg) => {
            results.forEach((v, i) => {
              msg.react(emojis[i + 1]);
            });

            msg
              .awaitReactions(filter, { max: 1, time: 30000 })
              .then(async (collected) => {
                const raw = collected.firstKey();
                const select = options[raw];
                const item = results[select - 1];
                const priceResult = await priceLookup(item.uniName, lang);
                // Title
                await msg.channel.send(
                  new MessageEmbed()
                  .setTitle(item.displayName)
                  .setImage(priceResult.img)
                  .setColor(botColor)
                )
                msg.channel.send(
                  new MessageEmbed()
                    .setTitle("Prices")
                    .setDescription(priceResult.results)
                    .setColor(botColor)
                );
              }).catch(()=>msg.channel.send(new MessageEmbed().setTitle('No Item Selected').setColor(errorColor)));
          })
        const myMsg = new MessageEmbed()
          .setTitle("Choose an Item...")
          .setColor(botColor);
        return myMsg;
      },
    },

    gold: {
      async func() {
        const results = await goldPriceLookup();
        if (results.length === 0)
          return new MessageEmbed()
            .setTitle("Gold Prices Not Found")
            .setColor(botColor);
        const embedmsg = new MessageEmbed()
          .setTitle("Recent Gold Prices")
          .setDescription(results)
          .setColor(botColor);
        return embedmsg;
      },
    },

    player: {
      async func() {
        if (!input[2]) {
          return new MessageEmbed()
            .setTitle("Error")
            .setDescription(
              `To search a player, use the following command:\n\`\`\`${prefix} player [playername]\`\`\``
            )
            .setColor(botColor);
        }

        msg.channel.send("Experimental command!");
        const result = await getPlayer(name);

        if (result.length === 0) {
          return new MessageEmbed()
            .setDescription("Player search failed...")
            .setColor(errorColor);
        }
        const listmsg = new MessageEmbed()
          .setTitle("Player Search Results:")
          .setDescription(
            result.map((player, i) => `${i + 1}. ${player.name}\n\n`)
          )
          .setColor(botColor);

        let options = {};
        result.forEach((v, i) => (options[emojis[i + 1]] = [i + 1]));

        const filter = (reaction, user) =>
          user.id === msg.author.id && options[reaction.emoji.name];

        msg.channel.send(listmsg).then((msg) => {
          result.forEach(async (v, i) => {
            await msg.react(emojis[i + 1]);
          });

          msg
            .awaitReactions(filter, { max: 1, time: 30000 })
            .then((collected) => {
              const raw = collected.firstKey();
              const select = options[raw];
              const player = result[select - 1];
              console.log(player);
              console.log(select);
              msg.channel.send(
                new MessageEmbed()
                  .setTitle(player.name)
                  .setDescription(
                    `Guild: ${
                      !player.alliance
                        ? ""
                        : `[${player.alliance.toUpperCase()}]`
                    } ${player.guild}\n\nKill Fame: ${
                      player.killfame
                    }\n\nDeath Fame: ${player.deathfame}`
                  )
                  .setColor(botColor)
              );
            });
        });
        return new MessageEmbed()
          .setTitle("Choose a Player")
          .setColor(botColor);
      },
    },

    guild: {
      async func() {
        if (!input[2]) {
          return new MessageEmbed()
            .setTitle("Error")
            .setDescription(
              `To search a guild, use the following command:\n\`\`\`${prefix} guild [guildname]\`\`\`\n\nTo search a guild's members, use the following command:\n\`\`\`${prefix} guild [guildname] members\`\`\``
            )
            .setColor(botColor);
        }
        msg.channel.send("Experimental command!");
        let name = "";
        if (input[input.length - 1].toLowerCase() === "members") {
          for (let i = 2; i < input.length - 1; i++) {
            name = name + " " + input[i];
            name = name.trim();
          }
          const result = await getGuildMember(name);
          if (!result.guild) {
            return msg.channel.send("Guild search failed...");
          }
          const members = result.members.map((member) => `${member.name}\n\n`);
          const embedmsg = new MessageEmbed()
            .setTitle(
              `${
                !result.alliance ? "" : `[${result.alliance.toUpperCase()}]`
              } ${result.guild} Members`
            )
            .setDescription(members)
            .setColor(botColor);
          return msg.channel.send(embedmsg);
        } else {
          for (let i = 2; i < input.length; i++) {
            name = name + " " + input[i];
            name = name.trim();
          }
          const result = await getGuild(name);
          if (!result.name) {
            return msg.channel.send("Guild search failed...");
          }
          const embedmsg = new MessageEmbed()
            .setTitle(
              `${
                !result.alliance ? "" : `[${result.alliance.toUpperCase()}]`
              } ${result.name}`
            )
            .setDescription(
              `Founder: ${result.founder}\n\nKill Fame: ${result.killfame}\n\nDeath Fame: ${result.deathfame}\n\nMember Count: ${result.memberCount}`
            )
            .setFooter(`Guild Created at: ${result.founded}`)
            .setColor(botColor);
          return msg.channel.send(embedmsg);
        }
      },
    },
    about: {
      func() {
        if (!input[2]) {
          return new MessageEmbed()
            .setTitle("Incorrect Command Usage")
            .setDescription(
              `To search about an item, use the following command:\n\`\`\`${prefix} about [itemname]\`\`\``
            )
            .setColor(errorColor);
        }
        const result = aboutItem(name, lang);
        if (!result.name) {
          return new MessageEmbed()
            .setTitle("Error")
            .setDescription(`There was an error retreiving ${name} desciption.`)
            .setColor(errorColor);
        }
        return new MessageEmbed()
          .setTitle(result.name)
          .setDescription(result.description)
          .setColor(botColor);
      },
    },

    //* Music
    play: {
      async func() {
        const args = msg.content.split(" ");
        console.log(args);
        const voiceChannel = msg.member.voice.channel;
        if (!voiceChannel)
          return new MessageEmbed()
            .setTitle("Error")
            .setDescription("You need to be in a voice channel to play music!")
            .setColor(errorColor);
        const permissions = voiceChannel.permissionsFor(msg.client.user);
        if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
          return new MessageEmbed()
            .setTitle("Error")
            .setDescription(
              "I need the permissions to join and speak in your voice channel!"
            )
            .setColor(errorColor);
        }
        const songInfo = await ytdl(url);
        const song = {
          title: songInfo.title,
          url: songInfo.video_url,
        };

        if (!serverQueue) {
          const queueContruct = {
            textChannel: msg.channel,
            voiceChannel: voiceChannel,
            connection: null,
            songs: [],
            volume: 5,
            playing: true,
          };

          queue.set(msg.guild.id, queueContruct);

          queueContruct.songs.push(song);

          try {
            var connection = await voiceChannel.join();
            queueContruct.connection = connection;
            play(msg.guild, queueContruct.songs[0]);
          } catch (err) {
            console.log(err);
          }
        } else {
          serverQueue.songs.push(song);
          return new MessageEmbed()
            .setTitle("Success")
            .setDescription(`${song.title} has been added to the queue!`);
        }
      },
    },
    //* Misc

    prefix: {
      func() {
        if (!input[2]) {
          return new MessageEmbed()
            .setDescription(
              `Current prefix is: ${prefix}\nTo change the prefix, use the following command:\n\`\`\`${prefix} prefix [newprefix]\`\`\``
            )
            .setColor(botColor);
        }
        prefix = input[2];
        return new MessageEmbed()
          .setDescription(`Prefix has been changed to: ${prefix}`)
          .setColor(botColor);
      },
    },
    //* Fun Commands!
    latom: {
      func() {
        const embedmsg = new MessageEmbed()
          .attachFiles([latom])
          .setImage("attachment://latom.png")
          .setColor(botColor);
        return msg.channel.send(embedmsg);
      },
    },
    f: {
      func() {
        const embedmsg = new MessageEmbed()
          .attachFiles([latom])
          .setImage("attachment://latom.png")
          .setColor(botColor);
        return msg.channel.send(embedmsg);
      },
    },
    thank: {
      func() {
        if (name === "you") {
          const embedmsg = new MessageEmbed()
            .attachFiles([smileNona])
            .setImage("attachment://smilenona.png")
            .setColor(botColor);
          return embedmsg;
        }
      },
    },
  };
  if (input[0] === prefix) {
    const cmd = input[1].toLowerCase();
    if (functions[cmd]) msg.channel.send(await functions[cmd].func());
    else msg.channel.send("Help menu coming soon...");
  }
});
client.login(token);
route.get("/", (req, res) => res.send("Bot"));

module.exports = route;

const axios = require("axios");
const itemList = require("../assets/items.json");
const moment = require("moment");

//* Gold Lookup
module.exports.goldPriceLookup = async () => {
  const { data } = await axios.get(
    " https://www.albion-online-data.com/api/v2/stats/gold?count=5"
  );
  return data.map(
    (e) => `silver ${e.price} ${moment(e.timestamp).utc(true).fromNow()}\n`
  );
};

//* Price Lookup
module.exports.priceLookup = async (name, lang) => {
  let filtered = itemList.filter((item) => item.LocalizedNames);
  let regex = new RegExp("nontradable", "gi");

  filtered = filtered.filter(
    (item) => !item.LocalizationNameVariable.match(regex)
  );

  regex = new RegExp(name, "gi");
  filtered = filtered.filter((item) => item.LocalizedNames[lang].match(regex));

  const { data } = await axios(
    `https://www.albion-online-data.com/api/v2/stats/prices/${filtered[0].UniqueName}?qualities=1`
  );
  const results = [];
  data.forEach((item) =>
    item.city.match(".*\\d.*")
      ? null
      : results.push(
          `${item.city}\n Sell Price: ${item.sell_price_min} | ${moment(
            item.sell_price_min_date
          )
            .utc(true)
            .fromNow()}\n Buy Price: ${item.buy_price_min} | ${moment(
            item.buy_price_min_date
          )
            .utc(true)
            .fromNow()}\n\n`
        )
  );
  return {
    uniName: filtered[0].UniqueName,
    name: filtered[0].LocalizedNames[lang],
    results,
  };
};

//* Player Search
module.exports.getPlayer = async (name) => {
  try {
    const {
      data: { players },
    } = await axios(
      `https://gameinfo.albiononline.com/api/gameinfo/search?q=${name}`
    );
    console.log(players);
    const player = players[0];
    if (!player.Name) {
      return {};
    }
    return {
      name: player.Name,
      alliance: player.AllianceName,
      guild: player.GuildName,
      killfame: player.KillFame,
      deathfame: player.DeathFame,
    };
  } catch (er) {
    console.log(er);
    return {};
  }
};

//* Guild Search
module.exports.getGuild = async (name) => {
  try {
    const {
      data: { guilds },
    } = await axios(
      `https://gameinfo.albiononline.com/api/gameinfo/search?q=${name}`
    );
    if (guilds.length === 0) return {};
    const id = guilds[0].Id;
    const { data } = await axios(
      `https://gameinfo.albiononline.com/api/gameinfo/guilds/${id}`
    );
    return {
      id,
      name: data.Name,
      founder: data.FounderName,
      founded: moment(data.Founded).format("MMMM Do YYYY"),
      alliance: data.AllianceTag,
      memberCount: data.MemberCount,
      killfame: data.killFame,
      deathfame: data.DeathFame,
    };
  } catch (er) {
    console.log(er);
    return {};
  }
};

//* Guild Members
module.exports.getGuildMember = async (q) => {
  try {
    const { id, name, alliance } = await this.getGuild(q);
    const { data } = await axios(
      `https://gameinfo.albiononline.com/api/gameinfo/guilds/${id}/members`
    );
    //console.log(data[0]);
    return {
      guild: name,
      alliance,
      members: data.map((player) => {
        return { name: player.Name, id: player.Id };
      }),
    };
  } catch (er) {
    console.log(er);
    return {};
  }
};

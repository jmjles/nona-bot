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

//* Product Name Lookup
module.exports.productName = (name, lang) => {
  let filtered = itemList.filter((item) => item.LocalizedNames);
  let regex = new RegExp("nontradable", "gi");
  filtered = filtered.filter(
    (item) => !item.LocalizationNameVariable.match(regex)
  );
  name = name.replace(".",' @')
  const query = name.split(" ");

  query.forEach((word) => {
    regex = new RegExp(word, "gi");
    filtered = filtered.filter(
      (item) =>
        item.LocalizedNames[lang].match(regex) ||
        item.LocalizationNameVariable.match(regex) ||
        item.UniqueName.match(regex)
    );
  })
  //! limit results to 5
  let result = [];
  if (filtered.length === 0) return result

  for (let i = 0;i < filtered.length && i < 5; i++) {
    const name = filtered[i].LocalizedNames[lang];
    const uniName = filtered[i].UniqueName;
    const displayName = `${uniName.substring(0, 2)}${
      uniName.includes("@") ? `.${uniName.charAt(uniName.length - 1)}` : ``
    } ${name}`;

    result.push({
      name,
      uniName,
      displayName,
    });
  }
  return result;
};

//* Price Lookup
module.exports.priceLookup = async (name) => {
  const { data } = await axios(
    `https://www.albion-online-data.com/api/v2/stats/prices/${name}?qualities=1`
  );
  const img = `https://render.albiononline.com/v1/item/${name}.png`;

  const results = [];
  data.forEach((item) =>
    item.city.match(".*\\d.*")
      ? null
      : results.push(
          `${item.city}\n Sell Price: ${item.sell_price_min} | ${moment(
            item.sell_price_min_date
          )
            .utc(true)
            .fromNow()}\n Buy Price: ${item.buy_price_max} | ${moment(
            item.buy_price_min_date
          )
            .utc(true)
            .fromNow()}\n\n`
        )
  );
  return {
    results,
    img,
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
    let result = [];
    console.log(players);
    players.map((player) =>
      result.length < 5
        ? result.push({
            name: player.Name,
            alliance: player.AllianceName,
            guild: player.GuildName,
            killfame: player.KillFame,
            deathfame: player.DeathFame,
          })
        : ""
    );

    return result;
  } catch (er) {
    console.log(er);
    return [];
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
    return [];
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
    return [];
  }
};

//* About Item
module.exports.aboutItem = (name, lang) => {
  try {
    let filtered = itemList.filter((item) => item.LocalizedNames);
    filtered = filtered.filter((item) => item.LocalizedDescriptions);

    regex = new RegExp(name, "gi");
    filtered = filtered.filter((item) =>
      item.LocalizedNames[lang].match(regex)
    );

    if (filtered.length === 0) {
      return {};
    }
    const result = filtered[0];
    return {
      name: result.LocalizedNames[lang],
      description: result.LocalizedDescriptions[lang],
    };
  } catch (er) {
    console.log(er);
    return {};
  }
};

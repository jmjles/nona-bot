const axios = require("axios");
const itemList = require("../assets/items.json");
const moment = require("moment");
module.exports.goldPriceLookup = async () => {
  const { data } = await axios.get(
    " https://www.albion-online-data.com/api/v2/stats/gold?count=5"
  );
  return data.map(
    (e) =>
      `silver ${e.price} ${moment(e.timestamp).utc(true).fromNow()}\n`
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
            item.sell_price_min_date).utc(true).fromNow()}\n Buy Price: ${item.buy_price_min} | ${moment(
            item.buy_price_min_date).utc(true).fromNow()}\n\n`
        )
  );
  console.log(results);
  return {
    uniName: filtered[0].UniqueName,
    name: filtered[0].LocalizedNames[lang],
    results,
  };
};

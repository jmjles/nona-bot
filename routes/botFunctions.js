const axios = require('axios')
module.exports.goldPrice = async () => {
    const {data} = await axios.get(
      " https://www.albion-online-data.com/api/v2/stats/gold?count=5"
    );
    return data
}
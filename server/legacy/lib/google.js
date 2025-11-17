const axios = require('axios');

const { GOOGLE_API_KEY } = process.env;

module.exports = {
  async geocode(params) {
    const { data } = await axios.get(
      'https://maps.googleapis.com/maps/api/geocode/json',
      {
        params: {
          key: GOOGLE_API_KEY,
          ...params,
        },
      },
    );

    if (data.status !== 'OK') {
      throw new Error(data.status);
    }

    return data.results;
  },
};

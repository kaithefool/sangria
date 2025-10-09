const redis = require('redis');

const { REDIS_URL = '' } = process.env;

module.exports = () => {
  const client = redis.createClient({
    url: REDIS_URL,
  });

  client.on('error', console.error);

  return client;
};

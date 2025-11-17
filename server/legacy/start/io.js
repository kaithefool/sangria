const { Server } = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');

const redis = require('./redis');

const {
  SOCKET = '0',
  REDIS_URL = '',
} = process.env;

let allowRequest = (req, cb) => cb(null, true);

const io = new Server({
  allowRequest: (...args) => allowRequest(...args),
});

io.allowRequest = (handler) => {
  allowRequest = handler;
};
io.init = async (server) => {
  if (SOCKET === '1') {
    if (REDIS_URL) {
      const pub = redis();
      const sub = redis();

      // the adapter needs the redis clients to be connected
      await Promise.all([pub.connect(), sub.connect()]);

      io.adapter(createAdapter(pub, sub));
    }

    io.listen(server);
  }
};

module.exports = io;

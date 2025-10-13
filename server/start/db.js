const mongoose = require('mongoose');
const tunnel = require('tunnel-ssh');
const fs = require('fs');
const { name } = require('../package.json');

const {
  MONGO_URI = `mongodb://localhost:27017/${name}`,
  MONGO_SYNC_INDEX,
  MONGO_SSH_HOST,
  MONGO_SSH_USER,
  MONGO_SSH_PORT = '22',
  MONGO_SSH_DST_PORT,
  MONGO_SSH_LOCAL_PORT,
  MONGO_SSH_KEY,
  MONGO_SSH_PASSWORD,
} = process.env;

let db;

const sshConfig = {
  host: MONGO_SSH_HOST,
  username: MONGO_SSH_USER,
  port: parseInt(MONGO_SSH_PORT, 10),
  dstPort: MONGO_SSH_DST_PORT,
  localPort: MONGO_SSH_LOCAL_PORT,
};

if (MONGO_SSH_KEY) {
  sshConfig.privateKey = fs.readFileSync(MONGO_SSH_KEY);
}
if (MONGO_SSH_PASSWORD) {
  sshConfig.password = MONGO_SSH_PASSWORD;
}

function connect() {
  mongoose.set('strictQuery', true);
  db = mongoose.connect(MONGO_URI, {
    // auto index can be handled in Model
    autoIndex: !Number(MONGO_SYNC_INDEX),
  });
}

if (MONGO_SSH_HOST) {
  tunnel(sshConfig, () => {
    connect();
  });
} else {
  connect();
}

module.exports = db;

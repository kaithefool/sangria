const db = require('./db');
const redis = require('./redis');
const i18n = require('./i18n');
const io = require('./io');
const env = require('./env');

env();

module.exports = {
  db,
  redis,
  i18n,
  io,
};

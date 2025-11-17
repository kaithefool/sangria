const { Routes } = require('../base');
const service = require('../services/files');
const upload = require('../parsers/upload');

module.exports = new Routes({
  service,
  authorize: 'admin',
}, {
  list: true,
  findById: true,
  create: {
    method: 'post',
    parse: upload(),
  },
  patch: true,
  delete: true,
});

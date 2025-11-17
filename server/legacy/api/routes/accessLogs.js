const { DateTime: dt } = require('luxon');

const { Routes } = require('../base');
const service = require('../services/accessLogs');
const exportCsv = require('../responders/exportCsv');

module.exports = new Routes({
  service,
  authorize: 'admin',
  validate: {},
}, {
  list: true,
  find: true,
  findById: true,
  delete: true,

  export: {
    path: '/export',
    serve: 'find',
    response: exportCsv(() => ({
      filename: `access-logs-${
        dt.now().toFormat('yyyy-MM-dd--HH-mm-ss')
      }.csv`,
      mapping: [
        { key: 'createdAt' },
        { key: 'action' },
        { key: 'user.email' },
        { key: 'ip' },
        { key: 'userAgent' },
      ],
    })),
  },
});

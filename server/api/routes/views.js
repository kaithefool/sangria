const { Routes } = require('../base');
const service = require('../services/views');

const { findOne } = Routes.namedRoutes;

module.exports = new Routes({
  service,
  authorize: {
    list: 'admin',
    find: 'admin',
    create: 'admin',
    patch: 'admin',
    patchActive: 'admin',
    delete: 'admin',
  },
  validate: {},
  logs: {
    create: true,
    patch: true,
    patchActive: true,
    delete: true,
  },
}, {
  list: true,
  findById: true,
  findOne: { ...findOne, path: '/u' },
  create: true,
  patch: true,
  patchActive: {
    path: ['/active/:_id', '/active'],
    method: 'patch',
  },
  delete: true,
});

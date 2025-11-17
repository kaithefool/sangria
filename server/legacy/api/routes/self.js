const { object } = require('yup');
const { email, password } = require('../validators');
const { Routes } = require('../base');
const consts = require('../models/consts');
const service = require('../services/self');

module.exports = new Routes({
  service,
  authorize: consts.roles,
  validate: {
    patch: object({
      email: email(),
      password: password(),
    }),
  },
}, {
  findOne: {},
  patch: {
    method: 'patch',
  },
});

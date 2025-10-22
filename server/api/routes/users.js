const { object, array } = require('yup');

const { Routes } = require('../base');
const service = require('../services/users');
const { email, password } = require('../validators');
const exportCsv = require('../responders/exportCsv');
const parseCsv = require('../parsers/parseCsv');
const parseXlsx = require('../parsers/parseXlsx');

module.exports = new Routes({
  service,
  authorize: 'admin',
  validate: {
    create: object({
      email: email().required(),
      password: password().required(),
    }),
    patch: object({
      email: email(),
      password: password(),
    }),
    import: array().of(object({
      email: email().required(),
    })),
  },
}, {
  list: true,
  findById: true,
  findSelf: {
    path: '/self',
    serve: 'findOne',
    parse: (req, res, next) => {
      req.attrs._id = req.user._id;
      return next();
    },
  },
  create: true,
  patch: true,
  patchActive: {
    path: ['/active/:_id', '/active'],
    method: 'patch',
  },
  delete: true,

  import: {
    path: '/import',
    method: 'post',
    serve: 'create',
    parse: parseCsv({
      mapping: [
        { key: 'email' },
        { key: 'englishname', to: 'name.en' },
        { key: 'role', getter: () => 'client' },
      ],
    }),
  },
  importXlsx: {
    path: '/import/xlsx',
    method: 'post',
    serve: 'create',
    parse: parseXlsx({
      mapping: [
        { key: 'email' },
        { key: 'englishname', to: 'name.en' },
        { key: 'role', getter: () => 'client' },
      ],
    }),
  },

  export: {
    path: '/export',
    serve: 'find',
    response: exportCsv({
      filename: 'users-export.csv',
      mapping: [
        { key: 'email' },
        { key: 'name.en', label: 'English Name' },
      ],
    }),
  },
});

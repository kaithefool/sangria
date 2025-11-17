const { object, string } = require('yup');

const { Routes } = require('../base');
const service = require('../services/auth');
const authCookies = require('../helpers/authCookies');
const { email } = require('../validators');

module.exports = new Routes({
  service,
  validate: {
    authenticate: object({
      email: email().required(),
      password: string().required(),
    }),
    refresh: object({
      token: string().required(),
    }),
  },
  logs: {
    authenticate: { user: (req, res) => res.locals.out?.user?._id },
    logout: true,
  },
}, {
  authenticate: {
    method: 'post',
    response: ({ web }, res) => {
      const { locals: { out } } = res;

      if (web) {
        authCookies.set(res, out);

        return res.end();
      }

      return res.json(out);
    },
  },

  refresh: {
    method: 'post',
    path: '/refresh',
  },

  logout: {
    path: '/logout',
    response({ attrs: { redirect }, web }, res) {
      if (web) authCookies.clear(res);
      if (redirect !== undefined) {
        return res.redirect(redirect || '/');
      }

      return res.end();
    },
  },
});

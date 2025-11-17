const { object, string } = require('yup');

const { Routes } = require('../../base');
const service = require('../../services/otps/authMobile');
const authCookies = require('../../helpers/authCookies');

module.exports = new Routes({
  service,
  validate: {
    create: object({
      mobile: string().required(),
    }),
    verify: object({
      mobile: string().required(),
      verifyKey: string().required(),
    }),
    affirm: object({
      mobile: string().required(),
      verifyKey: string().required(),
    }),
  },
  logs: {
    affirm: { user: (req, res) => res.locals.out?.user?._id },
  },
}, {
  create: true,
  verify: {
    method: 'post',
    path: '/verify',
    response: (req, res) => res.end(),
  },
  affirm: {
    method: 'post',
    path: '/affirm',
    response: ({ web }, res) => {
      const { locals: { out } } = res;

      if (web) {
        authCookies.set(res, out);

        return res.end();
      }

      return res.json(out);
    },
  },
});

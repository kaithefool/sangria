const { object, string } = require('yup');

const { Routes } = require('../../base');
const service = require('../../services/otps/pwdresetEmail');
const { email, password } = require('../../validators');

module.exports = new Routes({
  service,
  validate: {
    create: object({
      email: email().required(),
    }),
    verify: object({
      verifyKey: string().required(),
    }),
    affirm: object({
      verifyKey: string().required(),
      password: password().required(),
    }),
  },
}, {
  create: true,
  verify: {
    method: 'post',
    path: '/verify',
    response: (req, res) => res.end(),
  },
  affirm: { method: 'post', path: '/affirm' },
});

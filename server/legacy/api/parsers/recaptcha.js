const axios = require('axios');
const httpError = require('http-errors');

const { GOOGLE_RECAPTCHA_SECRET_KEY: secretKey } = process.env;

const API_URL = 'https://www.google.com/recaptcha/api/siteverify';

module.exports = (opts) => async (req, res, next) => {
  const { key = 'reCaptchaToken' } = opts || {};
  const { attrs: { [key]: token } } = req;

  if (!secretKey) return next();

  if (typeof token !== 'string' || !token) {
    return next(httpError(400, 'res.invalidReCaptcha'));
  }

  const { data: { success } } = await axios.post(
    `${API_URL}?secret=${secretKey}&response=${token}`,
  );

  if (!success) return next(httpError(400, 'res.invalidReCaptcha'));

  return next();
};

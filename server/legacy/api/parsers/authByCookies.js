const authService = require('../services/auth');
const authCookies = require('../helpers/authCookies');
const csrf = require('./csrf')();

module.exports = async function authByCookies(req, res, next) {
  const tokens = authCookies.get(req);

  // set auth source
  req.web = true;

  if (tokens.access || tokens.refresh) {
    try {
      const output = await authService.verifyOrRenew(tokens);

      if (output.user) req.user = output.user;
      if (output.access) authCookies.set(res, output);
    } catch (e) {
      authCookies.clear(res);
    }
  }

  return csrf(req, res, next);
};

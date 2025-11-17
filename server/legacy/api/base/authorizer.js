const httpError = require('http-errors');
const _ = require('lodash');

module.exports = (opts) => (req, res, next) => {
  const roles = opts.roles || opts;
  const { redirect } = opts;
  const rr = _.castArray(roles);
  const { role = 'guest' } = req.user || {};

  if (!rr.includes('guest') && role === 'guest') {
    if (redirect) return res.redirect('/auth');
    return next(httpError(401, 'unauthorized'));
  }
  if (!rr.includes(role)) {
    if (redirect) return res.redirect('/logout');
    return next(httpError(403, 'forbidden'));
  }

  return next();
};

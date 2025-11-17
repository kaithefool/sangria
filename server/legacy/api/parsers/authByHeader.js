const httpError = require('http-errors');

const authService = require('../services/auth');

module.exports = function authByHeader(req, res, next) {
  const header = req.header('Authorization');

  if (!header) return next();

  const match = header.match(/^Bearer (.*?)$/);

  if (!match || !match[1]) return next();

  try {
    req.user = authService.verifyToken(match[1]);
  } catch (e) {
    return next(httpError(400, 'res.invalidToken'));
  }

  return next();
};

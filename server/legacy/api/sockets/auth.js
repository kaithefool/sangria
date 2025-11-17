const httpError = require('http-errors');
const { parse } = require('cookie');

const io = require('../../start/io');
const authCookies = require('../helpers/authCookies');
const authServ = require('../services/auth');
const csrf = require('../parsers/csrf')({
  ignoreMethods: ['HEAD', 'OPTIONS'],
});

const authByHeader = (req) => {
  const { authorization: header } = req.headers;

  if (!header) return null;

  const match = header.match(/^Bearer (.*?)$/);

  if (!match || !match[1]) return null;

  try {
    return authServ.verifyToken(match[1]);
  } catch (error) {
    throw httpError(400, 'res.invalidToken');
  }
};

const checkCsrf = (req) => {
  req.cookies = parse(req.headers.cookie);

  const err = csrf(req, req.res, (e) => e);

  if (err) throw err;
};

const authByCookies = async (req) => {
  checkCsrf(req);
  const tokens = authCookies.get(req);

  if (tokens.access || tokens.refresh) {
    try {
      const output = await authServ.verifyOrRenew(tokens);

      if (output.access) authCookies.set(req.res, output);

      return output.user;
    } catch (error) {
      authCookies.clear(req.res);
    }
  }

  return null;
};

io.allowRequest(async (req, cb) => {
  try {
    req.user = authByHeader(req) || await authByCookies(req);
  } catch (e) {
    return cb(e, false);
  }

  // Only logged in users can use sockets by default
  // comment this line out if you allow guests
  if (!req.user) return cb(httpError(401, 'unauthorized'));

  return cb(null, true);
});

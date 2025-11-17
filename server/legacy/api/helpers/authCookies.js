const ms = require('ms');
const { parse, serialize } = require('cookie');

const {
  HTTPS = '0',
  JWT_ACCESS_TTL = '5m',
  JWT_REFRESH_TTL = '15d',
} = process.env;

const cookieOpts = {
  secure: HTTPS === '1',
  path: '/',
  httpOnly: true,
  sameSite: 'strict',
};

module.exports = {
  get(req) {
    const {
      'access.id': access,
      'refresh.id': refresh,
    } = req.cookies || parse(req.headers.cookie);

    return { access, refresh };
  },

  set(res, tokens) {
    const { access, refresh, persist = false } = tokens;

    const setCookie = (cc) => (
      res.cookie
        ? cc.forEach((c) => res.cookie(...c))
        : res.setHeader('Set-Cookie', cc.map((c) => serialize(...c)))
    );

    setCookie([
      ['access.id', access, {
        ...cookieOpts,
        ...persist && { maxAge: ms(JWT_ACCESS_TTL) },
      }],
      ['refresh.id', refresh, {
        ...cookieOpts,
        ...persist && { maxAge: ms(JWT_REFRESH_TTL) },
      }],
    ]);
  },

  clear(res) {
    if (res.clearCookie) {
      res.clearCookie('access.id');
      res.clearCookie('refresh.id');
    } else {
      res.setHeader('Set-Cookie', [
        serialize('access.id', '', { expires: new Date(0) }),
        serialize('refresh.id', '', { expires: new Date(0) }),
      ]);
    }
  },
};

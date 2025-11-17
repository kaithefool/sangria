const ms = require('ms');

module.exports = {
  set(req, res, {
    base = '/',
    name = 'redirect',
  } = {}) {
    res.cookie(
      name,
      JSON.stringify({
        base, url: req.originalUrl,
      }),
      {
        httpOnly: true,
        sameSite: 'strict',
        maxAge: ms('30m'),
      },
    );
  },

  consume(req, res, {
    base = '/',
    name = 'redirect',
    default: d,
  } = {}) {
    let { [name]: stored } = req.cookies;

    if (stored !== undefined) {
      res.clearCookie(name);

      try {
        stored = JSON.parse(stored);

        if (stored.base === base) {
          return res.redirect(stored.url);
        }
      } catch (error) {
        // do nothing
      }
    }

    return res.redirect(d || base);
  },
};

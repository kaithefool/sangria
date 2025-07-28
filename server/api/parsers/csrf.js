const csurf = require('csurf');
const httpError = require('http-errors');

const { HTTPS } = process.env;

module.exports = (opts) => {
  const csrf = csurf({
    cookie: {
      secure: HTTPS === '1',
      path: '/',
      httpOnly: true,
      sameSite: 'strict',
    },
    ...opts,
  });

  return (req, res, next) => csrf(
    req,
    res,
    (err) => {
      if (!err) return next();
      if (err.code !== 'EBADCSRFTOKEN') return next(err);

      return next(httpError(403, 'res.invalidCsrf', { type: 'invalid-csrf' }));
    },
  );
};

const Router = require('express');
const httpError = require('http-errors');

const routes = require('./routes');
const authByHeader = require('./parsers/authByHeader');
const authByCookies = require('./parsers/authByCookies');

require('./sockets');

const api = Router();

// catch 404 and forward to error handler
routes.use((req, res, next) => next(httpError(404, 'res.notFound')));

api.use((req, res, next) => {
  res.isApi = true;

  return next();
});
api.use('/a', authByHeader, routes);
api.use('/', authByCookies, routes);

module.exports = api;

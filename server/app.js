const httpError = require('http-errors');
const express = require('express');
const path = require('path');
const qs = require('qs');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');

const errHandler = require('./lib/err/errHandler');
const { middleware: i18nMid } = require('./start/i18n');
const api = require('./api');
const pages = require('./pages');

const { NODE_ENV } = process.env;
const app = express();
const serveStatic = (...paths) => {
  const mid = express.static(path.join(__dirname, ...paths));

  return (req, res, next) => {
    mid(req, res, () => {
      next(httpError(404, 'res.notFound'));
    });
  };
};

// view engine setup
app.set('views', path.join(__dirname, 'pages/views'));
app.set('view engine', 'pug');
app.set(
  'query parser',
  (str) => qs.parse(str, { strictNullHandling: true }),
);

app.use(logger('dev'));
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  },
}));
app.use(cookieParser());
app.use('/uploads', serveStatic('../public/uploads'));
app.use('/assets', serveStatic(
  '../assets',
  NODE_ENV === 'production' ? 'dist' : 'build',
));
app.use(mongoSanitize({ allowDots: true }));

app.use(i18nMid);
app.use('/api', api);
app.use((req, res, next) => {
  // no file extensions
  if (req.path.match(/\.\w{1,4}$/)) {
    return next(httpError(404, 'res.notFound'));
  }

  return next();
}, pages);

// catch 404 and forward to error handler
app.use((req, res, next) => (
  next(httpError(404, 'res.notFound'))
));

// error handler
app.use(errHandler);

module.exports = app;

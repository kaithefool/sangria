const routes = require('express').Router();
const _ = require('lodash');

const authByCookies = require('../api/parsers/authByCookies');
const consts = require('../api/models/consts');
const redirectCookies = require('../api/helpers/redirectCookies');

const {
  name: repoName, version: ver,
} = require('../package.json');

const {
  LNG, LNG_LABEL, LNG_FLAG,
  GOOGLE_API_KEY,
  GOOGLE_RECAPTCHA_PUBIC_KEY,
} = process.env;

// authentication middleware
routes.use(authByCookies);

// env variables for frontend
routes.use(({
  csrfToken, user, t, i18n,
}, res, next) => {
  const { locals } = res;

  locals.ver = ver; // package version
  locals.i18n = i18n; // i18n
  locals.t = t;
  locals._ = _; // lodash
  locals.env = {
    user,
    csrf: csrfToken?.(),
    lngs: LNG.split(','),
    lngLabels: LNG_LABEL.split(','),
    lngFlags: LNG_FLAG.split(','),
    googleApiKey: GOOGLE_API_KEY,
    googleReCaptchaKey: GOOGLE_RECAPTCHA_PUBIC_KEY,
    meta: {
      title: _.capitalize(repoName),
    },
    ...consts.public,
  };

  return next();
});

routes.get('/logout', (req, res) => (
  res.redirect('/api/auth/logout?redirect')
));

routes.use(
  ['/admin', '/admin/*'],
  (req, res) => {
    if (req.user?.role !== 'admin') {
      redirectCookies.set(req, res, { base: '/admin' });

      return res.redirect(req.user ? '/logout' : '/auth');
    }

    return res.render('layout', { entry: 'admin' });
  },
);

routes.get('/', (req, res) => res.redirect('/auth'));
routes.use(
  '/auth',
  (req, res) => {
    if (req.user?.role === 'admin') {
      return redirectCookies.consume(req, res, { base: '/admin' });
    }

    return res.render('layout', { entry: 'home' });
  },
);

routes.use(
  '/',
  (req, res) => res.render('layout', { entry: 'home' }),
);

module.exports = routes;

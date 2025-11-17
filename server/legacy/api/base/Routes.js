const { Router } = require('express');
const _ = require('lodash');
const httpError = require('http-errors');

const authorizer = require('./authorizer');
const validator = require('./validator');
const logAccess = require('../parsers/logAccess');

const responseOne = (req, res, next) => (
  res.locals.out ? next() : next(httpError(404, 'res.notFound'))
);

const isNonArrayObj = (o) => typeof o === 'object' && !Array.isArray(o);

const defaultNamedRoutes = {
  list: {},
  find: {
    path: '/all',
  },
  findById: {
    path: '/:_id',
    serve: 'findOne',
    response: responseOne,
  },
  findOne: { response: responseOne },
  create: { method: 'post' },
  patch: { method: 'patch', path: '/:_id' },
  upsert: { method: 'put' },
  delete: { method: 'delete', path: ['/:_id', ''] },
};

class Routes {
  constructor(props, routes, settings) {
    Object.assign(this, props);
    this.router = Router(settings);
    this.routes = routes;

    // named routes
    this.parseNamedRoutes();

    // register routes
    _.forEach(this.routes, (r, name) => {
      this.registerRoute(name, { serve: name, ...r });
    });

    // eslint-disable-next-line no-constructor-return
    return this.router;
  }

  static get namedRoutes() {
    return defaultNamedRoutes;
  }

  // shorthands for common routes
  parseNamedRoutes() {
    const draft = {};
    const { namedRoutes } = this.constructor;

    // insert named routes
    _.forEach(this.routes, (opts, serve) => {
      draft[serve] = opts === true
        ? namedRoutes[serve]
        : opts;
    });

    this.routes = draft;
  }

  attrsFetcher(attrsPath = ['query', 'params', 'body', 'docs']) {
    return (req, res, next) => {
      req.attrs = Object.assign(
        {},
        req.attrs,
        ..._.castArray(attrsPath).map((p) => {
          const a = req[p];

          return Array.isArray(a) ? { array: a } : a;
        }),
      );

      next();
    };
  }

  handles(serve) {
    const { service } = this;

    return async ({
      attrs,
      user,
      t, // i18n
      pickLng,
      language,
    }, res, next) => {
      try {
        res.locals.out = await service[serve](
          attrs,
          user,
          { t, pickLng, language },
        );
      } catch (e) {
        return next(e);
      }

      return next();
    };
  }

  guards(name) {
    const g = [];
    const v = _.get(this, `validate.${name}`);
    const a = isNonArrayObj(this.authorize)
      ? this.authorize[name]
      : this.authorize;

    if (a) g.push(authorizer(a));
    if (v) g.push(validator(v));

    return g;
  }

  log(name) {
    const l = isNonArrayObj(this.logs)
      ? this.logs[name]
      : this.logs;

    if (!l) return [];

    return [
      logAccess(
        name,
        isNonArrayObj(l) ? l : {},
      ),
    ];
  }

  registerRoute(name, {
    path = '/',
    method = 'get',
    attrsPath,
    serve,
    parse = [],
    response = [],
  }) {
    this.router[method.toLowerCase()](
      path,
      this.attrsFetcher(attrsPath),

      // parsers
      ..._.castArray(parse),

      // guards
      ...this.guards(name),

      // service handler
      this.handles(serve),

      // access logs
      ...this.log(name),

      // responders
      ..._.castArray(response),

      // default responder
      (req, res) => {
        const { out } = res.locals;

        return out ? res.json(out) : res.end();
      },
    );
  }
}

module.exports = Routes;

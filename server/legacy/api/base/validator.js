const { castArray } = require('lodash');
const httpError = require('http-errors');
const { setLocale } = require('yup');

const rules = {
  mixed: [
    'default',
    'required',
    'oneOf',
    'notOneOf',
    'notType',
  ],
  string: [
    'length',
    'min',
    'max',
    'matches',
    'email',
    'url',
    'trim',
    'lowercase',
    'uppercase',
  ],
  number: [
    'min',
    'max',
    'lessThan',
    'moreThan',
    'positive',
    'negative',
    'integer',
  ],
  date: [
    'min',
    'max',
  ],
  boolean: [
    'isValue',
  ],
  object: [
    'notKnown',
  ],
  array: [
    'min',
    'max',
    'length',
  ],
};

const locale = Object.keys(rules).reduce((l, type) => ({
  ...l,
  [type]: rules[type].reduce((typeRules, rule) => ({
    ...typeRules,
    [rule]: () => (`yup.${type}.${rule}`),
  }), {}),
}), {});

setLocale(locale);

module.exports = (routeRules) => async (req, res, next) => {
  try {
    const [schema, opts = {}] = castArray(routeRules);

    req.attrs = await schema.validate(req.attrs, opts);
  } catch (e) {
    Object.assign(e, e.params);

    return next(httpError(400, e));
  }

  return next();
};

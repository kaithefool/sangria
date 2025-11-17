const _ = require('lodash');

const recursiveFind = (src, fn) => {
  const t = (val) => {
    if (fn(val)) return val;

    if (_.isPlainObject(val)) {
      return Object.values(val).find((v) => t(v));
    }
    if (Array.isArray(val)) {
      return val.find((v) => t(v));
    }

    return undefined;
  };

  return t(src);
};

module.exports = {
  recursiveFind,
};

const _ = require('lodash');
const multer = require('multer');
const { parse } = require('csv-parse');
const httpError = require('http-errors');
const { fuzzyKey } = require('./helpers');

const fuzzyMap = (rows = [], cols = []) => {
  if (!rows.length) return [];

  const mappers = [];

  // sample 1st row
  cols.forEach((col) => {
    if (col.key instanceof RegExp && !col.to) {
      throw new Error('"to" is required if "key" is a regex');
    }

    const match = fuzzyKey(rows[0], col.key, col.opts);

    mappers.push({ ...col, col: match });
  });

  return rows.map((r) => {
    const mapped = {};

    mappers.forEach(({
      col, key, to, getter = (v) => v,
    }) => {
      _.set(mapped, to || key, getter(
        col ? r[col] : undefined,
        r,
      ));
    });

    return mapped;
  });
};

module.exports = ({
  uploadSettings: {
    field = 'file',
    ...uploadSettings
  } = {},
  parserSettings = {},
  mapping,
} = {}) => {
  const upload = multer({
    storage: multer.memoryStorage(),
    ...uploadSettings,
  });

  return [
    upload.single(field),
    (req, res, next) => {
      if (req[field]) {
        const input = req[field].buffer.toString();

        parse(input, {
          columns: true,
          skip_empty_lines: true,
          ...parserSettings,
        }, (err, output) => {
          if (err) {
            return next(httpError(400, 'res.invalidCsv'));
          }

          req.attrs = mapping
            ? fuzzyMap(output, mapping)
            : output;

          return next();
        });
      }
    },
  ];
};

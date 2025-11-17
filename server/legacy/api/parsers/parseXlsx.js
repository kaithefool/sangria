const _ = require('lodash');
const Excel = require('exceljs');
const httpError = require('http-errors');
const multer = require('multer');
const { fuzzyKey } = require('./helpers');

const fuzzyMap = (ws, mapping = [], headerRow = 1) => {
  if (!ws.actualRowCount) return [];

  const header = ws.getRow(headerRow).values;
  const mappers = mapping.map((m) => ({
    ...m,
    arrKey: fuzzyKey(header, m.key, m.opts),
  }));
  const out = [];

  ws.eachRow((row, rowNum) => {
    if (rowNum <= headerRow) return;
    const mapped = {};

    mappers.forEach(({
      arrKey,
      key,
      to,
      getter = (v) => v,
    }) => {
      let value = arrKey !== -1 ? row.values[arrKey] : undefined;
      if (_.isPlainObject(value)) {
        value = !_.get(value, 'result.error')
          ? _.get(value, 'result')
          : undefined;
      }
      _.set(mapped, to || key, getter(value, row, row.values[arrKey]));
    });
    out.push(mapped);
  });

  return out;
};

/**
 * @callback getter - (value, row, cell) => value
 * @description getter function for row
 * @param {any} value - value to get
 * @param {any} row - row object from excel
 * @param {any} arrValue - raw value from excel cell
 * @returns {any} - value
 */

/**
 * @typedef {Object} mapObj
 * @property {string} key - key to get from row
 * @property {string} to - key to set in output
 * @property {getter} getter - getter function for row
 */

/**
 * @name exportXlsx
 * @param {object} arg
 * @param {import('multer').Options|Object} arg.uploadSettings - multer upload settings
 * @param {mapObj[]|mapObj[][]|{[sheetName: string]: mapObj[]}} arg.mapping
 * @returns {Function[]} - express middleware function
 */
module.exports = ({
  uploadSettings: {
    /**
     * @memberof uploadSettings
     * @type {string}
     */
    field = 'file',
    ...uploadSettings
  } = {},
  mapping,
}) => {
  const upload = multer({
    storage: multer.memoryStorage(),
    ...uploadSettings,
  });

  return [
    upload.single(field),
    async (req, res, next) => {
      if (!req[field]) { return next(httpError(400, 'res.badRequest')); }

      const input = req[field].buffer;

      const workbook = new Excel.Workbook();
      await workbook.xlsx.load(input);

      // If mapping is array of array
      if (Array.isArray(mapping) && Array.isArray(mapping[0])) {
        const out = [];

        mapping.forEach((m, i) => {
          const mapped = fuzzyMap(workbook.worksheets[i], m);
          out.push(mapped);
        });
        req.attrs = out;
      }

      // If map only first sheet
      if (Array.isArray(mapping) && _.isPlainObject(mapping[0])) {
        const mapped = fuzzyMap(workbook.worksheets[0], mapping);
        req.attrs = mapped;
      }

      // If Object of mappings, Object key is sheet name, value is mapping
      if (_.isPlainObject(mapping)) {
        const out = {};
        Object.keys(mapping).forEach((sheetName) => {
          out[sheetName] = fuzzyMap(
            workbook.getWorksheet(sheetName),
            mapping[sheetName],
          );
        });
        req.attrs = out;
      }

      return next();
    },
  ];
};

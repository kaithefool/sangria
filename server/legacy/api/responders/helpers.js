const { get, startCase } = require('lodash');

/**
 * @name mapRow
 * @description get row for csv
 * @param {import('express').Request} req - request object
 * @param {mapObj[]} mapping - mapping to use for the sheet
 * @param {object} doc - document to get row for
 * @param {?number[]} widths - widths of the columns
 * @returns {!*[]} - row for csv
 */
function mapRow(req, mapping, data, widths) {
  return mapping.map((m, i) => {
    const k = typeof m.key === 'function'
      ? m.key(data, req)
      : m.key;
    let v = get(data, k);

    if (m.getter) v = m.getter(v, data, req);

    if (widths) widths[i] = Math.max(widths[i], String(v).length);

    return v ?? '';
  });
}

function mapHeader(mapping) {
  return mapping.map(
    ({ key, label }) => label || startCase(key),
  );
}

module.exports = {
  mapRow,
  mapHeader,
};

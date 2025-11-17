const { merge } = require('lodash');
const excel = require('exceljs');
const { mapRow, mapHeader } = require('./helpers');

const applyStyles = (isHeader = false, mapping = []) => (c, colNo) => {
  const {
    col = {},
    header = {},
    cell = {},
  } = mapping[colNo - 1] || {};
  const merges = merge({}, col, {
    ...(isHeader ? header : cell),
  });

  Object.entries(merges).forEach(([k, v]) => {
    c[k] = typeof v === 'function' ? v(c.value) : v;
  });
};

const addRow = (ws, mapping, widths, req, doc) => {
  const row = ws.addRow(mapRow(req, mapping, doc, widths));
  row.eachCell(applyStyles(false, mapping));
  return row;
};

/**
 * @callback getter
 * @description getter function for row
 * @param {any} value - value to get
 * @param {object} data - data for the row
 * @param {import('express').Request} request - request object
 * @returns {any} - value
 */

/**
 * @name exportXlsx
 * @typedef {import('exceljs').Style} CellStyle - For detail styles, see: https://github.com/exceljs/exceljs#styles
 * @typedef {{
 *  key: String,
 *  label: String,
 *  getter: getter,
 *  cellWidth: Number,
 *  col: CellStyle,
 *  header: CellStyle,
 *  cell: CellStyle,
 * }} mapObj
 * @param {object} options
 * @param {string} options.filename - filename for the file
 * @param {string} options.sheetName - name of the sheet
 * @param {import('exceljs').AddWorksheetOptions} options.sheetMeta - meta data for the sheet, see: https://github.com/exceljs/exceljs#worksheet-properties
 * @param {boolean} options.useSharedStrings
 * @param {boolean} options.useStyles
 * @param {mapObj[]} options.mapping - mapping to use for the sheet
 */
module.exports = (options) => async (req, res) => {
  const { out } = res.locals;

  const opts = typeof options === 'function' ? options(out) : options;
  const {
    mapping,
    filename = 'export.xlsx',
    sheetName = 'Sheet1',
    sheetMeta = {},
    useSharedStrings = true,
    useStyles = true,
  } = opts;

  res.attachment(filename);

  const workbook = new excel.stream.xlsx.WorkbookWriter({
    useStyles,
    useSharedStrings,
    stream: res,
  });

  const widths = mapHeader(mapping).map((h) => h.length);

  const ws = workbook.addWorksheet(sheetName, sheetMeta);
  ws.addRow(mapHeader(mapping)).eachCell(
    applyStyles(true, mapping),
  );

  if (out.pipe) {
    await out.eachAsync((doc) => {
      addRow(ws, mapping, widths, req, doc);
    });
  } else {
    out.forEach((doc) => addRow(ws, mapping, widths, req, doc));
  }

  widths.forEach((w, i) => {
    ws.getColumn(i + 1).width = (mapping[i]?.colWidth || w) * 1.1;
  });
  ws.commit();
  await workbook.commit();
};

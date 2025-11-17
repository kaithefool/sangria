const fs = require('fs').promises;
const path = require('path');
const _ = require('lodash');
const { jsPDF: JsPDF } = require('jspdf');
const { applyPlugin } = require('jspdf-autotable');
const { mapRow, mapHeader } = require('./helpers');

applyPlugin(JsPDF);

const fonts = {
  'Noto Sans': {
    normal: {
      100: 'NotoSansCJKhk-100.ttf',
      300: 'NotoSansCJKhk-300.ttf',
      400: 'NotoSansCJKhk-400.ttf',
      500: 'NotoSansCJKhk-500.ttf',
      700: 'NotoSansCJKhk-700.ttf',
      900: 'NotoSansCJKhk-900.ttf',
    },
  },
};

const readFontFile = (filename) => fs.readFile(
  path.resolve(__dirname, `../assets/fonts/${filename}`),
);

/**
 *
 * @param {JsPDF} doc
 * @returns {JsPDF}
 */
const initDoc = (doc) => {
  const { addFont, setFont } = doc;

  doc.addFont = async (filename, name, style, weight) => {
    const file = await readFontFile(filename);

    doc.addFileToVFS(filename, file.toString('binary'));
    addFont.call(doc, filename, name, style, weight);
  };
  doc.setFont = async (name, style, weight) => {
    const filename = _.get(fonts, `${name}.${style}.${weight}`);

    if (filename) {
      await doc.addFont(filename, name, style, weight);
    }

    setFont.call(doc, name, style, weight);
  };
  doc.autoText = (str) => {
    const { width } = doc.internal.pageSize;
    const txt = doc.splitTextToSize(str, width - 28);

    doc.text(txt, 14, 18);
  };

  return doc;
};

module.exports = (options = {}) => async (req, res) => {
  const { out } = res.locals;
  const { attachment } = req.attrs;
  const opts = typeof options === 'function' ? options(out) : options;
  const {
    filename = 'export.pdf',
    write,
  } = opts;
  let { mapping, title = 'Exports' } = opts;

  if (typeof mapping === 'function') mapping = mapping(out, req);
  if (typeof title === 'function') title = title(out, req);

  // setup http headers
  if (attachment !== '0') {
    res.attachment(filename);
  } else {
    res.type('pdf');
  }

  const doc = initDoc(new JsPDF());

  await doc.setFont('Noto Sans', 'normal', 400);

  doc.outTable = (tableOpts) => {
    doc.autoTable({
      head: [mapHeader(mapping)],
      body: out.map((o) => mapRow(req, mapping, o)),
      styles: { font: 'Noto Sans', fontSize: 8 },
      headStyles: { fillColor: '#333333' },
      ...tableOpts,
    });
  };

  if (write) {
    await write(doc, out, req);
  } else {
    doc.setFontSize(14);
    doc.text(title, 14, 18);
    doc.outTable({ startY: 24 });
  }

  const buf = Buffer.from(
    doc.output('arraybuffer'),
  );

  return res.send(buf);
};

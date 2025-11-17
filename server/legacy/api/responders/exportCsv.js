const { stringify } = require('csv-stringify');
const { mapRow, mapHeader } = require('./helpers');

module.exports = (options) => (req, res) => {
  const { out } = res.locals;
  const BOM = String.fromCharCode(0xFEFF);
  const stringifier = stringify(); // csv stringifier
  const opts = typeof options === 'function' ? options(out) : options;
  const { filename = 'export.csv' } = opts;
  let { mapping } = opts;

  if (typeof mapping === 'function') mapping = mapping(out, req);

  // setup http headers
  res.attachment(filename);

  // indicate the file is encoded in utf-8
  res.write(BOM);

  // csv header
  stringifier.write(mapHeader(mapping));

  if (out.pipe) {
    out
      .map((doc) => mapRow(req, mapping, doc))
      .pipe(stringifier)
      .pipe(res);
  } else {
    stringifier.pipe(res);
    out.forEach((o) => stringifier.write(
      mapRow(req, mapping, o),
    ));
    stringifier.end();
  }
};

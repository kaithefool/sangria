const JsZip = require('jszip');

module.exports = (
  filename = 'compressed.zip',
  files = () => {},
) => async (req, res) => {
  const { out } = res.locals;
  const zip = new JsZip();
  const fn = typeof filename === 'function'
    ? filename(out, req) : filename;

  // insert files
  await files(zip, out, req);

  // setup http headers
  res.attachment(fn);

  zip.generateNodeStream({
    type: 'nodebuffer',
    streamFiles: true,
  })
    .pipe(res);
};

const path = require('path');
const multer = require('multer');
const { nanoid } = require('nanoid');

const destination = path.resolve(
  __dirname,
  '../../uploads',
);

const storage = multer.diskStorage({
  destination,
  filename(req, file, cb) {
    const ext = path.extname(file.originalname);
    const name = `u-${nanoid(21)}`;

    cb(null, `${name}${ext}`);
  },
});

function parseUpload({
  filename,
  originalname,
  mimetype,
  size,
}) {
  return {
    path: filename,
    name: originalname,
    type: mimetype,
    size,
  };
}

module.exports = ({
  field = 'file',
  settings = {},
} = {}) => {
  const upload = multer({
    storage,
    ...settings,
  });

  return [
    upload.single(field),
    async (req, res, next) => {
      req.attrs = {
        ...req.body,
        ...req.attrs,
        ...parseUpload(req.file),
      };

      return next();
    },
  ];
};

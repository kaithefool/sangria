const Model = require('../base/Model');

module.exports = new Model('File', {
  path: { type: String, required: true },
  name: String,
  type: { type: String, required: true },
  size: { type: Number, required: true },
}, {
  timestamps: true,
  uniques: [{ path: 1 }],
});

const Model = require('../base/Model');

const { Schema } = Model;

const views = new Model('View', {
  key: String,
  url: String,
  active: { type: Boolean, default: false },

  title: Schema.lng(String),
  body: Schema.lng(String),
}, {
  timestamps: true,
});

views.seeds([
  { key: 'home' },
  { url: '/terms' },
]);

module.exports = views;

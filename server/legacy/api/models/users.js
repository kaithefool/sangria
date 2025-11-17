const User = require('./User');

module.exports = new User('User', {
  // authentication
  lastLogin: Date,
  lastLogout: Date,
  active: { type: Boolean, default: true },

  // additional
}, {
  timestamps: true,
  uniques: [
    [
      { email: 1 },
      { partialFilterExpression: { email: { $exists: true, $gt: '' } } },
    ],
    [
      { mobile: 1 },
      { partialFilterExpression: { mobile: { $exists: true, $gt: '' } } },
    ],
  ],
});

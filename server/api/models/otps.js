const { nanoid } = require('nanoid');

const User = require('./User');

const { Schema } = User;
const {
  OTP_SMS_TTL = '15m',
  OTP_EMAIL_TTL = '60m',
} = process.env;

class Otp extends User {
  async setter(value, action) {
    const v = await super.setter(value);

    if (action !== 'create') return v;

    if (v.action.match('email')) {
      return {
        ...v,
        verifyKey: nanoid(),
        expiresAt: Schema.fromNow(OTP_EMAIL_TTL)(),
      };
    }

    return {
      ...v,
      verifyKey: Math.floor(
        Math.random() * (9999 - 1000 + 1),
      ) + 1000,
      expiresAt: Schema.fromNow(OTP_SMS_TTL)(),
    };
  }
}

module.exports = new Otp('Otp', {
  action: {
    type: String,
    enum: ['register-email', 'auth-mobile', 'pwdreset-email'],
    required: true,
  },
  verifyKey: { type: String, required: true },
  expiresAt: {
    type: Date,
    expires: 1,
    required: true,
  },
}, {
  timestamps: {
    created: { by: false },
    updated: false,
    deleted: false,
  },
});

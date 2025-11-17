const Model = require('../base/Model');
const crypto = require('../helpers/crypto');
const consts = require('./consts');

const { Schema } = Model;
const { LNG } = process.env;

class User extends Model {
  constructor(name, paths, opts) {
    super(name, {
      // essentials
      email: String,
      mobile: String,
      password: {
        type: String,
        select: false,
      },
      role: {
        type: String,
        enum: consts.roles,
        default: 'client',
      },
      lng: { type: String, enum: LNG.split(',') },

      // additional
      name: {
        type: Schema.lng(String),
        default: undefined,
      },
      avatar: Schema.files(),

      // extends
      ...paths,
    }, {
      ...opts,
      toJSON: {
        virtuals: true,
        transform: (doc, { password, ...ret }) => ret,
      },
    });
  }

  comparePwd(pwd, hash) {
    return crypto.compare(pwd, hash);
  }

  async setter(values) {
    const v = { ...values };

    if (v.password) {
      v.password = await crypto.encrypt(v.password);
    }

    return v;
  }
}

module.exports = User;

const Otps = require('./Otps');
const userServ = require('../users');

class PwdResetEmailServ extends Otps {
  async create(attrs) {
    const { email } = attrs;

    const u = await userServ.findOne({ email, active: 1 });

    if (!u) this.throw(400, 'res.userNotExists');

    return super.create({
      action: 'pwdreset-email',
      email,
    }, (c) => ({
      template: 'pwdReset',
      locals: { ...c.toObject(), user: u },
    }));
  }

  verify({ verifyKey }) {
    return super.verify({
      action: 'pwdreset-email',
      verifyKey,
    });
  }

  async affirm({ verifyKey, password }) {
    const otp = await this.consume({
      action: 'pwdreset-email',
      verifyKey,
    });

    const u = await userServ.findOne({ email: otp.email });

    if (u) {
      await userServ.patch(
        { _id: u._id, password },
        { _id: u._id },
      );
    }
  }
}

module.exports = new PwdResetEmailServ();

const Otps = require('./Otps');
const userServ = require('../users');

class RegisterEmailServ extends Otps {
  populate(q) {
    return q.select('+password');
  }

  async create(attrs) {
    const { email } = attrs;

    const u = await userServ.findOne({ email });

    if (u) this.throw(400, 'res.userAlreadyExists');

    return super.create({
      action: 'register-email',
      email,
    }, (c) => ({
      template: 'register',
      locals: { ...c.toObject(), user: u },
    }), {
      ...attrs,
      role: 'client',
    });
  }

  verify({ verifyKey }) {
    return super.verify({
      action: 'register-email',
      verifyKey,
    });
  }

  async affirm({ verifyKey }) {
    const otp = await this.consume({
      action: 'register-email',
      verifyKey,
    });

    const created = await userServ.create(otp.toObject());

    // set password (bypass password encryption)
    await userServ.model.model.updateOne(
      { _id: created._id },
      { password: otp.password },
    );
  }
}

module.exports = new RegisterEmailServ();

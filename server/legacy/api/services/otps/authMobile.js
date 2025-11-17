const Otps = require('./Otps');
const userServ = require('../users');
const authServ = require('../auth');

const { NODE_ENV } = process.env;
class AuthMobileServ extends Otps {
  create(attrs, user, { t }) {
    const { mobile } = attrs;

    return super.create({
      action: 'auth-mobile',
      mobile,
    }, (c) => ({
      body: t('sms.verify', c),
    }), attrs);
  }

  verify({ mobile, verifyKey }) {
    if (NODE_ENV !== 'production' && verifyKey === '3570') {
      return null;
    }

    return super.verify({
      action: 'auth-mobile',
      mobile,
      verifyKey,
    });
  }

  async affirm({ verifyKey, mobile, ...attrs }) {
    const otp = await this.consume({
      action: 'auth-mobile',
      mobile,
      verifyKey,
    });

    let u = await userServ.findOne({ mobile });

    if (!u) {
      u = await userServ.create({
        ...otp,
        ...attrs,
        mobile,
        role: 'client',
      });
    }

    return authServ.login(u);
  }
}

module.exports = new AuthMobileServ();

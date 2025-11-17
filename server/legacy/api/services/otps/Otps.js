const Service = require('../../base/Service');
const model = require('../../models/otps');
const sms = require('../../../lib/sms');
const mail = require('../../../lib/mail');

const {
  OTP_SMS_MAX = '3',
  OTP_EMAIL_MAX = '3',
} = process.env;

class OtpServ extends Service {
  constructor(m, opts = {}) {
    super(m || model, opts);
  }

  async create(cred, msg = () => {}, extraAttrs = {}) {
    // rate limit
    const exists = await this.find({ filter: cred });

    if (exists.length >= (
      cred.email ? OTP_EMAIL_MAX : OTP_SMS_MAX
    )) {
      this.throw(400, 'res.maxOtpsReached');
    }

    // create key
    const created = await super.create({ ...cred, ...extraAttrs });

    // send out verification key
    if (cred.email) {
      mail.send({
        message: { to: cred.email },
        locals: created,
        ...msg(created),
      });
    } else {
      sms({
        to: cred.mobile,
        ...msg(created),
      });
    }
  }

  async verify(cred) {
    const o = await this.findOne(cred);

    if (!o) {
      this.throw(400, 'res.invalidKey');
    }

    return o;
  }

  // verify and remove all existing keys
  async consume(cred) {
    const { mobile } = cred;
    const otp = await this.verify(cred);

    await this.deleteBy(mobile ? { mobile } : { email: otp.email });

    return otp;
  }
}

module.exports = OtpServ;

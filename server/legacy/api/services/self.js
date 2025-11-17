const Service = require('../base/Service');
const model = require('../models/users');

class SelfServ extends Service {
  findOne(attrs, user) {
    return super.findOne({ _id: user._id }, user);
  }

  async patch({
    oldPassword = '',
    password,
    ...attrs
  }, user) {
    const draft = { ...attrs };

    if (password !== undefined) {
      const u = await model.findOne({ _id: user._id }, '+password');

      if (await model.comparePwd(oldPassword, u.password)) {
        draft.password = password;
      } else {
        this.throw(400, 'res.invalidCredentials');
      }
    }

    return super.patchBy({ _id: user._id }, draft, user);
  }
}

module.exports = new SelfServ(model);

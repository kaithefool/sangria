const Service = require('../base/Service');
const model = require('../models/users');

class UserServ extends Service {
  patchActive({ _id, active }, user) {
    return super.patchBy(
      { _id },
      { active },
      user,
    );
  }
}

module.exports = new UserServ(model, {
  search: 'email',
});

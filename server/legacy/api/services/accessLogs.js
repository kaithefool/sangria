const Service = require('../base/Service');
const model = require('../models/accessLogs');

class AccessLogServ extends Service {
  populate(query) {
    return query.populate({
      path: 'user',
      select: 'email mobile username',
    });
  }
}

module.exports = new AccessLogServ(model, {
  search: 'action',
});

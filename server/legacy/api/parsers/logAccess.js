const accessLogServ = require('../services/accessLogs');

module.exports = (
  action,
  {
    reqPayload = false,
    resPayload = false,
    user: getUser = (req) => req?.user?._id,
  } = {},
) => async (req, res, next) => {
  const ip = req.headers['x-forwarded-for']
    || req.connection.remoteAddress;
  const userAgent = req.headers['user-agent'];
  const { baseUrl, attrs } = req;
  const { out } = res.locals;

  await accessLogServ.create({
    action: `${baseUrl}:${action}`,
    user: getUser(req, res),
    ip,
    userAgent,
    ...(reqPayload && { reqPayload: JSON.stringify(attrs) }),
    ...(resPayload && { resPayload: JSON.stringify(out) }),
  });

  return next();
};

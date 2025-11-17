/**
 * Route model binding
 * @param  {String} key         key to find from params
 * @param  {Object} service
 * @param  {Object} options
 * @return {Function}           middleware
 */
module.exports = (key, service, {
  fn = 'find',
  prop = '_id',
} = {}) => (
  async (req, res, next) => {
    const {
      params,
      docs,
      user,
    } = req;

    const found = await service[fn]({
      filter: { [prop]: params[key] },
    }, user);

    if (!found) return res.status(404).end();

    req.docs = { ...docs, [key]: found };

    return next();
  }
);

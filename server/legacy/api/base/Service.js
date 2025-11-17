const httpError = require('http-errors');
const _ = require('lodash');

class Service {
  constructor(model, opts = {}) {
    this.model = model;
    this.Model = model?.Model;
    this.opts = opts;
  }

  throw(...args) {
    throw httpError(...args);
  }

  catch(err) {
    if (err.name.match(/mongo/i) && err.code === 11000) {
      this.throw(400, 'res.duplicates', {
        model: this.model.schema.name,
        values: Object.values(err.keyValue),
        keys: Object.keys(err.keyValue),
      });
    }

    throw err;
  }

  async try(fn) {
    let data;

    try {
      data = await fn();
    } catch (e) {
      this.catch(e);
    }

    return data;
  }

  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#Escaping
  escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  searchQueryRegExp(str = '') {
    const sanitized = this.escapeRegExp(str.trim());

    // dashes, underscores and spcaes are treated equally
    const query = sanitized.replace(/[ -_]/g, '[ -_]');

    return new RegExp(query, 'i');
  }

  search(f) {
    let { search: opts } = this.opts;
    if (!opts || !f) return null;
    if (typeof opts === 'string' || Array.isArray(opts)) {
      opts = { default: opts };
    }

    const by = Object.keys(typeof f === 'object' ? f : opts)[0];
    const query = typeof f === 'object' ? Object.values(f)[0] : f;
    const regex = this.searchQueryRegExp(query);
    const fields = opts[by];

    if (!fields) return null;

    if (Array.isArray(fields)) {
      return {
        $or: fields.map((fld) => ({ [fld]: regex })),
      };
    }

    return { [fields]: regex };
  }

  exclude(_ids) {
    return _ids && { _id: { $nin: _.castArray(_ids) } };
  }

  comparsion(f = {}) {
    const compKeys = ['gt', 'gte', 'lt', 'lte', 'in'];

    return _.mapValues(f, (v) => (
      _.isPlainObject(v) && compKeys.some((k) => v[k])
        ? _.mapKeys(v, (val, key) => (
          compKeys.includes(key) ? `$${key}` : key
        ))
        : v
    ));
  }

  match({ search, excl, ...filter } = {}) {
    return {
      $and: [
        this.search(search),
        this.exclude(excl),
        this.comparsion(filter),
      ].filter((f) => f),
    };
  }

  populate(query/* , user, options */) {
    return query;
  }

  async findOne(filter, user, populate) {
    const q = this.model.findOne(
      await this.match(filter, user),
    );
    return this.populate(q, user, populate);
  }

  async find(opts, user, populate) {
    const { filter = {} } = opts;

    const q = this.model.find({
      ...opts,
      filter: await this.match(filter, user),
    });

    return this.populate(q, user, populate);
  }

  async count(filter, user) {
    return this.model.count(
      await this.match(filter, user),
    );
  }

  async list(opts, user) {
    const { filter = {}, limit = 20 } = opts;
    const [rows, total] = await Promise.all([
      this.find({ ...opts, limit }, user),
      this.count(filter, user),
    ]);

    return { rows, total };
  }

  async create(attrs, user) {
    return this.try(
      () => this.model.create(attrs.array || attrs, user),
    );
  }

  async patchBy(filter, attrs, user, opts) {
    return this.try(
      async () => this.model.update(
        await this.match(filter, user),
        attrs,
        user,
        opts,
      ),
    );
  }

  async patch({ _id, ...attrs }, user) {
    await this.patchBy({ _id }, attrs, user);
  }

  async upsert(attrs, user) {
    await this.patchBy({}, attrs, user, { upsert: true });
  }

  async deleteBy(filter, user) {
    return this.model.delete(
      await this.match(filter, user),
      user,
    );
  }

  async delete({ _id }, user) {
    await this.deleteBy({ _id }, user);
  }

  transaction(fn, onError, opts = {}) {
    return this.try(() => this.model.transaction(fn, onError, opts));
  }
}

Service.services = {};

module.exports = Service;

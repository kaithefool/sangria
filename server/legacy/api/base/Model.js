const Schema = require('./Schema');

class Model {
  constructor(s, ...args) {
    this.schema = typeof s === 'string'
      ? new Schema(s, ...args) : s;

    this.model = this.schema.model;
  }

  get Model() {
    return this.model;
  }

  setter(v) {
    return v;
  }

  matcher(filter) {
    if (this.model.softDelete) {
      return {
        ...filter,
        deletedAt: null,
      };
    }

    return filter;
  }

  // use setter to parse inputs
  // before create and update
  async parse(docs, userId, action) {
    // insert timestamp by
    const setter = userId
      ? async (...args) => {
        const d = await this.setter(...args);

        d[`${action}dBy`] = userId;

        return d;
      } : this.setter;

    const values = Array.isArray(docs)
      ? await Promise.all(
        docs.map((d) => setter(d, action)),
      )
      : await setter(docs, action);

    return values;
  }

  aggregate(...args) {
    return this.model.aggregate(...args);
  }

  find({
    filter = {},
    sort,
    skip,
    limit,
    select,
  }) {
    const q = this.model.find(this.matcher(filter));

    if (sort) q.sort(sort);
    if (skip) q.skip(parseInt(skip, 10));
    if (limit) q.limit(parseInt(limit, 10));
    if (select) q.select(select);

    return q;
  }

  findOne(filter, select) {
    return this.model.findOne(this.matcher(filter), select);
  }

  count(filter) {
    return this.model.countDocuments(this.matcher(filter));
  }

  async create(docs, { _id: userId } = {}) {
    const created = await this.model.create(
      await this.parse(docs, userId, 'create'),
    );

    return created;
  }

  async update(filter, docs, { _id: userId } = {}, opts = {}) {
    const updated = await this.model.updateMany(
      this.matcher(filter),
      await this.parse(docs, userId, 'update'),
      opts,
    );

    return updated;
  }

  delete(filter, { _id: userId } = {}, softDelete = true) {
    const { model } = this;

    // soft delete
    if (softDelete && model.softDelete) {
      return model.softDelete(this.matcher(filter), userId);
    }

    // hard delete
    return model.deleteMany(this.matcher(filter));
  }

  seeds(ss) {
    return Promise.all(ss.map((s) => (
      this.update(s, s, undefined, { upsert: true })
    )));
  }

  async transaction(
    fn = (s) => s,
    onError = (e) => { throw e; },
    opts = {
      caussalConsistency: true,
      defaultTransactionOptions: {
        readConcern: 'majority',
        writeConcern: { w: 'majority' },
      },
    },
  ) {
    const { model } = this;
    const session = await model.startSession(opts);
    let output;
    try {
      session.startTransaction();
      output = await fn(session);
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      output = onError(error);
    } finally {
      session.endSession();
    }
    return output;
  }
}

Model.Schema = Schema;

module.exports = Model;

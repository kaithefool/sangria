const m = require('mongoose');
const _ = require('lodash');
const ms = require('ms');

const { LNG, MONGO_SYNC_INDEX } = process.env;
const { ObjectId } = m.Schema.Types;
const pluralize = m.pluralize();

module.exports = class Schema {
  static lng(field) {
    return LNG.split(',').reduce(
      (s, ln) => ({ ...s, [ln]: field }),
      {},
    );
  }

  static ref(ref) {
    const type = ObjectId;

    return ref ? { type, ref } : { type };
  }

  static files() {
    return [{
      path: { type: String, required: true },
      name: { type: String, required: true },
      type: { type: String, required: true },
      size: { type: Number, default: 0 },
    }];
  }

  static fromNow(duration) {
    return () => {
      const d = new Date();

      d.setTime(d.getTime() + ms(duration));

      return d;
    };
  }

  static geo(type = 'Point') {
    return new m.Schema({
      type: {
        type: String,
        default: type,
      },
      coordinates: {
        type: type === 'Point' ? [Number] : [[Number]],
        required: true,
      },
    });
  }

  constructor(name, paths, {
    timestamps,
    uniques,
    indexes,
    hasMany,
    manyToMany,
    toJSON = { virtuals: true },
    toObject = { virtuals: true },
    ...opts
  } = {}) {
    const schema = new m.Schema(paths, {
      toJSON,
      toObject,
      ...opts,
    });
    const { methods, statics } = schema;

    Object.assign(this, {
      schema,
      name,
      paths,
      opts,
      methods,
      statics,
    });

    if (timestamps) this.timestamps(timestamps);
    if (uniques) {
      _.castArray(uniques)
        .forEach((u) => this.unique(
          ..._.castArray(u),
        ));
    }
    if (indexes) {
      _.castArray(indexes)
        .forEach((u) => this.index(
          ..._.castArray(u),
        ));
    }
    if (hasMany) {
      _.castArray(hasMany).forEach((h) => this.hasMany(h));
    }
    if (manyToMany) {
      _.castArray(manyToMany).forEach((h) => this.hasMany(h, true));
    }
  }

  get model() {
    const { name, schema, mm } = this;
    this.mm = mm || m.model(name, schema);

    if (Number(MONGO_SYNC_INDEX)) {
      this.mm.syncIndexes();
    }

    return this.mm;
  }

  unique(paths, { partialFilterExpression } = {}) {
    const p = { ...partialFilterExpression };

    if (this.schema.path('deletedBy')) {
      p.deletedAt = null;
    }

    this.index(paths, {
      unique: true,
      ...(Object.keys(p).length && {
        partialFilterExpression: p,
      }),
    });
  }

  index(...args) {
    this.schema.index(...args);
  }

  hasMany(opts, manyToMany = false) {
    const op = typeof opts === 'string'
      ? { ref: opts } : opts;
    const { name, ...o } = op;

    this.schema.virtual(name || pluralize(o.ref), {
      localField: '_id',
      foreignField: o.ref === this.name
        ? 'parent'
        : _.camelCase(
          manyToMany ? pluralize(this.name) : this.name,
        ),
      ...o,
    });
  }

  softDelete() {
    this.schema.statics.softDelete = function softDelete(filter, by) {
      const { schema } = this;
      const mark = { deletedAt: new Date() };

      if (schema.path('deletedBy')) {
        mark.deletedBy = by;
      }

      return this.updateMany(filter, mark);
    };
    this.schema.methods.softDelete = function softDelete(by) {
      this.constructor.softDelete({ _id: this._id }, by);
    };
  }

  timestamps(opts = {}) {
    const {
      created = true,
      updated = true,
      deleted = true, // soft delete
    } = opts;
    const { schema: s } = this;

    s.set('timestamps', {
      createdAt: Boolean(created),
      updatedAt: Boolean(updated),
    });

    if (deleted) {
      s.path('deletedAt', {
        type: Date,
        default: null,
      });
      this.softDelete();
    }

    // by user
    ['created', 'updated', 'deleted'].forEach((d) => {
      if (!(typeof opts[d] === 'object' && !d.by)) {
        s.path(
          `${d}By`,
          this.constructor.ref('User'),
        );
      }
    });
  }

  getter(prop, fn) {
    this.schema.virtual(prop).get(fn);
  }
};

import { Database } from 'better-sqlite3'

export type SqlDataType
  = | string | number | boolean | Date | Buffer
    | null | undefined

export function isSqlDataType(v: unknown): v is SqlDataType {
  return typeof v === 'string'
    || typeof v === 'number'
    || typeof v === 'boolean'
    || v instanceof Date
    || v instanceof Buffer
    || v === null
    || v === undefined
}

export class SqlQuery {
  constructor(
    public sql: string,
    public values: SqlDataType[] = [],
    public database?: Database,
  ) {
    this.sql = sql
    this.values = values
    this.database = database
  }

  private assertDb() {
    if (this.database === undefined) throw new Error('No database bound')
    return this.database
  }

  prepare() {
    return this.assertDb().prepare(this.sql).bind(this.values)
  }

  run() {
    return this.assertDb().prepare(this.sql).run(this.values)
  }

  get() {
    return this.assertDb().prepare(this.sql).get(this.values)
  }

  all() {
    return this.assertDb().prepare(this.sql).all(this.values)
  }

  iterate() {
    return this.assertDb().prepare(this.sql).iterate(this.values)
  }

  raw() {
    return this.assertDb().prepare(this.sql).bind(this.values).raw()
  }
}

export default SqlQuery

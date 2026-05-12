import { Database } from 'better-sqlite3'

export type SqlDataType =
  | string
  | number
  | boolean
  | Date
  | Buffer
  | null
  | undefined

export function isSqlDataType(v: unknown): v is SqlDataType {
  const a = v as SqlDataType
  switch (true) {
    case typeof a === 'string': {
      return true
    }
    case typeof a === 'number': {
      return true
    }
    case typeof a === 'boolean': {
      return true
    }
    case a instanceof Date: {
      return true
    }
    case Buffer.isBuffer(a): {
      return true
    }
    case a === null: {
      return true
    }
    case a === undefined: {
      return true
    }
    default: {
      a satisfies never
      return false
    }
  }
}

export function toSqlDateStr(d: Date) {
  return d.toISOString().slice(0, 23).replace('T', ' ')
}

export function toJsDate(v: string | number): Date {
  if (typeof v === 'number') {
    const d = new Date()
    d.setTime(v * 1000)
    return d
  }

  const s = Date.parse(v.split(' ').join('T') + 'Z')
  if (isNaN(s)) throw new Error('Unable to cast invalid date format')
  return new Date(s)
}

export type CastMap<T extends object> = {
  [K in keyof T as T[K] extends Date | boolean | null
    ? K
    : never]: T[K] extends Date | null
    ? DateConstructor
    : T[K] extends boolean | null
      ? BooleanConstructor
      : never
}

export function castToTypes<T extends object>(types: CastMap<T>) {
  return (v: T) => {
    if (typeof v !== 'object' || v === null) {
      throw new Error('Unable to cast non object.')
    }
    const r = { ...v }
    for (const k in types) {
      if (
        types[k] === Date &&
        (typeof r[k] === 'string' || typeof r[k] === 'number')
      ) {
        r[k] = toJsDate(r[k]) as T[typeof k]
      }
      if (types[k] === Boolean && typeof r[k] === 'number') {
        r[k] = Boolean(r[k]) as T[typeof k]
      }
    }
    return r
  }
}

export class SqlQuery {
  sql: string
  values: SqlDataType[]
  database?: Database

  static isSqlDateType = isSqlDataType

  constructor(sql: string, values: SqlDataType[] = [], database?: Database) {
    this.sql = sql
    this.values = values.map((v) => {
      if (v instanceof Date) return toSqlDateStr(v)
      if (typeof v === 'boolean') return Number(v)
      return v
    })
    this.database = database
  }

  private db() {
    if (this.database === undefined) throw new Error('No database bound')
    return this.database
  }

  prepare() {
    return this.db().prepare(this.sql).bind(this.values)
  }

  run() {
    return this.db().prepare(this.sql).run(this.values)
  }

  get<R extends object>(types?: CastMap<R>) {
    const r = this.db().prepare(this.sql).get(this.values) as R
    return types ? castToTypes(types)(r) : r
  }

  all<R extends object>(types?: CastMap<R>) {
    const rr = this.db().prepare(this.sql).all(this.values) as R[]
    return types ? rr.map(castToTypes(types)) : rr
  }

  iterate() {
    return this.db().prepare(this.sql).iterate(this.values)
  }

  raw() {
    return this.db().prepare(this.sql).bind(this.values).raw()
  }
}

export default SqlQuery

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

export function castDates<T>(keys: (keyof T)[]) {
  return (v: T) => {
    if (typeof v !== 'object' || v === null) {
      throw new Error('Unable to cast non object.')
    }
    const r = { ...v } as T
    for (const k of keys) {
      if (r[k] !== undefined) r[k] = toJsDate(r[k] as number) as T[keyof T]
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
    this.values = values.map((v) => (v instanceof Date ? toSqlDateStr(v) : v))
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

  get<R>() {
    return this.assertDb().prepare(this.sql).get(this.values) as R
  }

  all<R>() {
    return this.assertDb().prepare(this.sql).all(this.values) as R[]
  }

  iterate() {
    return this.assertDb().prepare(this.sql).iterate(this.values)
  }

  raw() {
    return this.assertDb().prepare(this.sql).bind(this.values).raw()
  }
}

export default SqlQuery

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
  return (
    typeof v === 'string' ||
    typeof v === 'number' ||
    typeof v === 'boolean' ||
    v instanceof Date ||
    v instanceof Buffer ||
    v === null ||
    v === undefined
  )
}

export function toDateStr(d: Date) {
  return d.toISOString().slice(0, 23).replace('T', ' ')
}

export function castToDate<T>(v: T): T | Date {
  if (typeof v === 'number' && Number.isInteger(v)) {
    const d = new Date()
    d.setTime(v * 1000)
    return d
  }
  if (typeof v === 'string') {
    const s = Date.parse(v.split(' ').join('T') + 'Z')
    if (!isNaN(s)) return new Date(s)
  }
  return v
}

export function castDates<T>(keys: (keyof T)[]) {
  return (v: T) => {
    if (typeof v !== 'object' || v === null) {
      throw new Error('Unable to cast non object.')
    }
    const r = { ...v } as T
    for (const k of keys) {
      if (r[k] !== undefined) r[k] = castToDate(r[k]) as T[keyof T]
    }
    return r
  }
}

export class SqlQuery {
  sql: string
  values: SqlDataType[]
  database?: Database

  constructor(sql: string, values: SqlDataType[] = [], database?: Database) {
    this.sql = sql
    this.values = values.map((v) => (v instanceof Date ? toDateStr(v) : v))
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

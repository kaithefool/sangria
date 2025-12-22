import { ISqlite } from 'sqlite'
import { where } from './where'
import { values } from './values'
import set from './set'

export type SqlDataType = string | number | boolean | Date | Buffer | null
// values array has been required in some sqlite func
export type SqlStmt = Required<ISqlite.SQLStatement>

export function isSqlStmt(v: unknown): v is SqlStmt {
  return typeof v === 'object'
    && v !== null
    && 'sql' in v
    && typeof v.sql === 'string'
    && !('values' in v && !Array.isArray(v.values))
}

export function isSqlDataType(v: unknown): v is SqlDataType {
  return typeof v === 'string'
    || typeof v === 'number'
    || typeof v === 'boolean'
    || v instanceof Date
    || v instanceof Buffer
    || v === null
}

function q(
  tpl: TemplateStringsArray,
  ...vals: (SqlDataType | SqlStmt)[]
): SqlStmt {
  let sql = ''
  const values: SqlDataType[] = []
  for (let i = 0; i < tpl.length; i += 1) {
    sql += tpl[i]
    const v = vals[i]
    if (isSqlStmt(v)) {
      sql += v.sql
      values.push(...v.values ?? [])
    }
    else if (v !== undefined) {
      sql += '?'
      values.push(v)
    }
  }

  return { sql, values }
}

export function raw(sql: string) {
  return { sql, values: [] }
}
q.raw = raw
q.values = values
q.where = where
q.set = set

export default q

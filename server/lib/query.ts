import { ISqlite } from 'sqlite'

export type SqlDataType = string | number | boolean | Date | Buffer | null
export type SqlStmt = ISqlite.SQLStatement

function isSqlStmt(v: unknown): v is SqlStmt {
  return typeof v === 'object'
    && v !== null
    && 'sql' in v
    && typeof v.sql === 'string'
    && !('values' in v && !Array.isArray(v.values))
}

function isSqlDataType(v: unknown): v is SqlDataType {
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

  return {
    sql,
    ...values.length && { values },
  }
}

export function values(
  input: { [x: string]: SqlDataType | SqlStmt },
): SqlStmt {
  const ent = Object.entries(input)
  const values: SqlDataType[] = []
  const colSql: string[] = []
  const valSql: string[] = []
  if (!ent.length) return { sql: 'DEFAULT VALUES' }
  for (let i = 0; i < ent.length; i += 1) {
    const [c, v] = ent[i]
    colSql.push(c)
    if (isSqlStmt(v)) {
      valSql.push(v.sql)
      values.push(...v.values ?? [])
    }
    else {
      valSql.push('?')
      values.push(v)
    }
  }

  return {
    sql: `(${
      colSql.map(c => `"${c}"`).join(', ')
    }) VALUES (${
      valSql.join(', ')
    })`,
    ...values.length && { values },
  }
}

export type SqlCf = {
  eq: SqlDataType
  ne: SqlDataType
  in: SqlDataType[]
  nin: SqlDataType[]
  gt: SqlDataType
  gte: SqlDataType
  lt: SqlDataType
  lte: SqlDataType
}

export function cfStmt<O extends keyof SqlCf>(
  col: string,
  operator: O,
  value: SqlCf[O],
): SqlStmt {
  let sql = ''
  const values = Array.isArray(value) ? value : [value]
  const qm = Array(values.length).fill('?').join(', ')
  switch (operator) {
    case 'eq':
      sql = `"${col}" = ?`
      break
    case 'ne':
      sql = `"${col}" != ?`
      break
    case 'in':
      sql = `"${col}" IN (${qm})`
      break
    case 'nin':
      sql = `"${col}" NOT IN (${qm})`
      break
    case 'gt':
      sql = `"${col}" > ?`
      break
    case 'gte':
      sql = `"${col}" >= ?`
      break
    case 'lt':
      sql = `"${col}" < ?`
      break
    case 'lte':
      sql = `"${col}" <= ?`
      break
  }
  return { sql, values }
}

export function compare(
  cf: { [x: string]: SqlDataType | Partial<SqlCf> | SqlStmt },
): SqlStmt {
  const sql: string[] = []
  const values: SqlDataType[] = []
  const ent = Object.entries(cf)
  for (let i = 0; i < ent.length; i += 1) {
    const [col, v] = ent[i]
    if (isSqlStmt(v)) {
      sql.push(`"${col}" ${v.sql}`)
      values.push(...v.values ?? [])
    }
    else if (isSqlDataType(v)) {
      const s = cfStmt(col, 'eq', v)
      sql.push(s.sql)
      values.push(...s.values ?? [])
    }
    else {
      const e = Object.entries(v)
      for (let k = 0; k < e.length; k += 1) {
        const [operator, d] = e[k]
        const s = cfStmt(col, operator as keyof SqlCf, d)
        sql.push(s.sql)
        values.push(...s.values ?? [])
      }
    }
  }
  return {
    sql: sql.join(' AND '),
    ...values.length && { values },
  }
}

export class SqlWhereStmt implements SqlStmt {
  constructor(
    conditions: SqlConditions,
    whereClause = true,
  ) {

  }

  compare() {

  }

  and(): SqlWhereStmt {}
  or(): SqlWhereStmt {}
}

export function where() {

}

q.values = values
q.where = where

export default q

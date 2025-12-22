import { SqlDataType, SqlStmt, isSqlStmt, isSqlDataType } from './q'

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

export type SqlCfMap = {
  [x: string]: SqlDataType | Partial<SqlCf> | SqlStmt
}

export function compare(
  cfMap: SqlCfMap,
): SqlStmt {
  const sql: string[] = []
  const values: SqlDataType[] = []
  const ent = Object.entries(cfMap)
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
  return { sql: sql.join(' AND '), values }
}

export function hasLogical(operator: 'AND' | 'OR', sql: string) {
  const regex = new RegExp(`(^| )${operator}($| )`, 'im')
  const ss = sql.trim()
    .replace(/'[^']*?'/gm, '')
    .replace(/"[^"]*?"/gm, '')
    .split(/([()])/)
  let opened = 0
  let s = ''
  for (let i = 0; i < ss.length; i += 1) {
    const c = ss[i]
    if (c === '(') opened += 1
    else if (c === ')') opened -= 1
    else if (opened === 0) {
      s += ' ' + c
    }
  }
  return regex.test(s)
}

export function rmWhere(sql: string) {
  return sql.replace(/^where\s*/i, '')
}

export function hasWhere(sql: string) {
  const s = sql.trim()
  return /^where( |\t|\r|\r\n)/i.test(s)
}

export function prependWhere(sql: string) {
  const s = sql.trim()
  if (/^where /i.test(s)) return sql
  if (s === '') return s
  return `WHERE ${s}`
}

export class SqlWhereStmt implements SqlStmt {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  values: any[] = []
  sql: string = ''
  private whereKeyword: boolean

  constructor(
    opts?: SqlStmt | SqlCfMap,
    whereKeyword = true,
  ) {
    this.whereKeyword = whereKeyword
    if (opts !== undefined) {
      const stmt = isSqlStmt(opts) ? opts : compare(opts)
      this.sql = whereKeyword ? prependWhere(stmt.sql) : rmWhere(stmt.sql)
      this.values = stmt.values
    }
  }

  and(opts: SqlStmt | SqlCfMap) {
    const stmt = isSqlStmt(opts) ? opts : compare(opts)
    const values = [...this.values, ...stmt.values]
    const sql = [this.sql, stmt.sql].filter(s => s).map((s) => {
      let r = rmWhere(s)
      r = hasLogical('OR', r) ? `(${r})` : r
      return r
    })
    return new SqlWhereStmt({
      sql: sql.join(' AND '), values,
    }, this.whereKeyword)
  }

  or(opts: SqlStmt | SqlCfMap) {
    const stmt = isSqlStmt(opts) ? opts : compare(opts)
    const values = [...this.values, ...stmt.values]
    const sql = [this.sql, stmt.sql].filter(s => s).map((s) => {
      let r = rmWhere(s)
      r = hasLogical('AND', r) ? `(${r})` : r
      return r
    })
    return new SqlWhereStmt({
      sql: sql.join(' OR '), values,
    }, this.whereKeyword)
  }
}

export function where(stmt: SqlStmt | SqlCfMap, whereKeyword?: boolean) {
  return new SqlWhereStmt(stmt, whereKeyword)
}

export default where

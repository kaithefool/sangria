import { SqlDataType, SqlQuery, isSqlQuery, isSqlDataType } from './q'

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

export function cfQuery<O extends keyof SqlCf>(
  col: string,
  operator: O,
  value: SqlCf[O],
): SqlQuery {
  let sql = ''
  let values: SqlDataType[] = []
  if (Array.isArray(value)) values = value
  else values = [value]
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
  [x: string]: SqlDataType | Partial<SqlCf> | SqlQuery
}

export function compare(
  cfMap: SqlCfMap,
): SqlQuery {
  const sql: string[] = []
  const values: SqlDataType[] = []
  const colCfs = Object.entries(cfMap)
  for (const colCf of colCfs) {
    const [col, v] = colCf
    if (isSqlQuery(v)) {
      sql.push(`"${col}" ${v.sql}`)
      values.push(...v.values ?? [])
    }
    else if (isSqlDataType(v)) {
      const s = cfQuery(col, 'eq', v)
      sql.push(s.sql)
      values.push(...s.values ?? [])
    }
    else {
      const cfs = Object.entries(v)
      for (const cf of cfs) {
        const [operator, d] = cf
        const s = cfQuery(col, operator as keyof SqlCf, d)
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

export class SqlWhereQuery implements SqlQuery {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  values: any[] = []
  sql: string = ''
  private whereKeyword: boolean

  constructor(
    opts?: SqlQuery | SqlCfMap,
    whereKeyword = true,
  ) {
    this.whereKeyword = whereKeyword
    if (opts !== undefined) {
      const query = isSqlQuery(opts) ? opts : compare(opts)
      this.sql = whereKeyword ? prependWhere(query.sql) : rmWhere(query.sql)
      this.values = query.values
    }
  }

  and(opts: SqlQuery | SqlCfMap) {
    const query = isSqlQuery(opts) ? opts : compare(opts)
    const values = [...this.values, ...query.values]
    const sql = [this.sql, query.sql].filter(s => s).map((s) => {
      let r = rmWhere(s)
      r = hasLogical('OR', r) ? `(${r})` : r
      return r
    })
    return new SqlWhereQuery({
      sql: sql.join(' AND '), values,
    }, this.whereKeyword)
  }

  or(opts: SqlQuery | SqlCfMap) {
    const query = isSqlQuery(opts) ? opts : compare(opts)
    const values = [...this.values, ...query.values]
    const sql = [this.sql, query.sql].filter(s => s).map((s) => {
      let r = rmWhere(s)
      r = hasLogical('AND', r) ? `(${r})` : r
      return r
    })
    return new SqlWhereQuery({
      sql: sql.join(' OR '), values,
    }, this.whereKeyword)
  }
}

export function where(query: SqlQuery | SqlCfMap, whereKeyword?: boolean) {
  return new SqlWhereQuery(query, whereKeyword)
}

export default where

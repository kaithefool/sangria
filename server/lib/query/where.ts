import { SqlDataType, SqlQuery, isSqlDataType } from './SqlQuery'

export type SqlCf<
  T extends SqlDataType = SqlDataType,
> = {
  eq?: T | SqlQuery
  ne?: T | SqlQuery
  in?: (T | SqlQuery)[]
  nin?: (T | SqlQuery)[]
  gt?: T | SqlQuery
  gte?: T | SqlQuery
  lt?: T | SqlQuery
  lte?: T | SqlQuery
}

const opMap = {
  eq: (v: unknown) => `= ${v}`,
  ne: (v: unknown) => `!= ${v}`,
  in: (v: unknown) => `IN (${v})`,
  nin: (v: unknown) => `NOT IN (${v})`,
  gt: (v: unknown) => `> ${v}`,
  gte: (v: unknown) => `>= ${v}`,
  lt: (v: unknown) => `< ${v}`,
  lte: (v: unknown) => `<= ${v}`,
}

export function cfQuery<K extends keyof SqlCf>(
  col: string,
  operator: K,
  value: SqlCf[K],
) {
  const valSql: string[] = []
  const values: SqlDataType[] = []
  const vv = Array.isArray(value) ? value : [value]
  for (const v of vv) {
    if (v instanceof SqlQuery) {
      valSql.push(v.sql)
      values.push(...v.values)
    }
    else {
      valSql.push('?')
      values.push(v)
    }
  }
  const sql = `"${col}" ${opMap[operator](valSql.join(', '))}`
  return new SqlQuery(sql, values)
}

export type SqlCfMap = {
  [x: string]: SqlDataType | SqlCf | SqlQuery
}

export type SqlCfVal<
  T extends SqlDataType,
> = T | SqlCf<T> | SqlQuery

export function compare(
  cfMap: SqlCfMap,
) {
  const sql: string[] = []
  const values: SqlDataType[] = []
  const colCfs = Object.entries(cfMap)
  for (const colCf of colCfs) {
    const [col, v] = colCf
    if (v instanceof SqlQuery) {
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
  return new SqlQuery(sql.join(' AND '), values)
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

export class SqlWhereQuery extends SqlQuery {
  public whereKeyword: boolean
  constructor(
    opts?: SqlQuery | SqlCfMap,
    whereKeyword = true,
  ) {
    let sql = ''
    let values: SqlDataType[] = []
    if (opts !== undefined) {
      const query = opts instanceof SqlQuery ? opts : compare(opts)
      sql = whereKeyword ? prependWhere(query.sql) : rmWhere(query.sql)
      values = query.values
    }
    super(sql, values)
    this.whereKeyword = whereKeyword
  }

  and(opts: SqlQuery | SqlCfMap) {
    const query = opts instanceof SqlQuery ? opts : compare(opts)
    const values = [...this.values, ...query.values]
    const sql = [this.sql, query.sql].filter(s => s).map((s) => {
      let r = rmWhere(s)
      r = hasLogical('OR', r) ? `(${r})` : r
      return r
    })
    return new SqlWhereQuery(new SqlQuery(
      sql.join(' AND '), values,
    ), this.whereKeyword)
  }

  or(opts: SqlQuery | SqlCfMap) {
    const query = opts instanceof SqlQuery ? opts : compare(opts)
    const values = [...this.values, ...query.values]
    const sql = [this.sql, query.sql].filter(s => s).map((s) => {
      let r = rmWhere(s)
      r = hasLogical('AND', r) ? `(${r})` : r
      return r
    })
    return new SqlWhereQuery(new SqlQuery(
      sql.join(' OR '), values,
    ), this.whereKeyword)
  }
}

export function where(query: SqlQuery | SqlCfMap, whereKeyword?: boolean) {
  return new SqlWhereQuery(query, whereKeyword)
}

export default where

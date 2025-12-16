import { ISqlite } from 'sqlite'

type SqlDataType = string | number | boolean | Date | Buffer | null
type SqlStmt = ISqlite.SQLStatement

function isSqlStmt(v: SqlDataType | SqlStmt): v is SqlStmt {
  return typeof v === 'object'
    && v !== null
    && 'sql' in v
    && typeof v.sql === 'string'
    && !('values' in v && !Array.isArray(v.values))
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
    sql: `(${colSql.join(', ')}) VALUES (${valSql.join(', ')})`,
    ...values.length && { values },
  }
}

export function where(
  criteria,
): SqlStmt {

}

q.values = values
q.where = where

export default q

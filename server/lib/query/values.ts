import { SqlDataType, SqlQuery, isSqlQuery } from './q'

export function values(
  input: { [x: string]: SqlDataType | SqlQuery },
): SqlQuery {
  const ent = Object.entries(input)
  const values: SqlDataType[] = []
  let colSql: string[] = []
  const valSql: string[] = []
  if (!ent.length) return { sql: 'DEFAULT VALUES', values: [] }
  for (let i = 0; i < ent.length; i += 1) {
    const [c, v] = ent[i]
    colSql.push(c)
    if (isSqlQuery(v)) {
      valSql.push(v.sql)
      values.push(...v.values ?? [])
    }
    else {
      valSql.push('?')
      values.push(v)
    }
  }
  colSql = colSql.map(c => `"${c}"`)
  return {
    sql: `(${colSql.join(', ')}) VALUES (${valSql.join(', ')})`,
    values,
  }
}

export default values

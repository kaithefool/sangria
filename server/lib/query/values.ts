import { SqlDataType, SqlQuery, isSqlQuery } from './q'

export type SqlVal = { [x: string]: SqlDataType | SqlQuery }

export function values(
  row: SqlVal | SqlVal[],
): SqlQuery {
  const rows = Array.isArray(row) ? row : [row]
  if (rows[0] === undefined) return { sql: 'DEFAULT VALUES', values: [] }
  const cols = Object.keys(rows[0])
  if (cols[0] === undefined) return { sql: 'DEFAULT VALUES', values: [] }
  const colSql = cols.map(c => `"${c}"`).join(', ')
  const rowSql: string[] = []
  const values: SqlDataType[] = []

  for (const row of rows) {
    const vals: string[] = []
    for (const col of cols) {
      const v = row[col]
      if (isSqlQuery(v)) {
        vals.push(v.sql)
        values.push(...v.values)
      }
      else {
        vals.push('?')
        values.push(v)
      }
    }
    rowSql.push(`(${vals.join(', ')})`)
  }
  return {
    sql: `(${colSql}) VALUES ${rowSql.join(', ')}`,
    values,
  }
}

export default values

import { SqlDataType, SqlQuery, isSqlQuery } from './q'

export type SqlVal = { [x: string]: SqlDataType | SqlQuery }

function getCols(rows: SqlVal[]) {
  const colsSet = new Set<string>()
  for (const row of rows) {
    for (const col of Object.keys(row)) {
      colsSet.add(col)
    }
  }
  return Array.from(colsSet)
}

export function values(
  ...rows: SqlVal[]
): SqlQuery {
  const cols = getCols(rows)
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

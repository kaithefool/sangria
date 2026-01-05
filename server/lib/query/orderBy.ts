import { SqlQuery } from './SqlQuery'

export function orderBy(
  orders: { [x: string]: 1 | -1 } = {},
) {
  const sql: string[] = []
  for (const p in orders) {
    sql.push(`"${p}" ${orders[p] === 1 ? 'ASC' : 'DESC'}`)
  }
  return new SqlQuery(
    sql.length ? `ORDER BY ${sql.join(', ')}` : '',
    [],
  )
}

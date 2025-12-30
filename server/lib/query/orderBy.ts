import { SqlQuery } from './q'

export function orderBy(
  orders: { [x: string]: 1 | -1 } = {},
): SqlQuery {
  const sql: string[] = []
  for (const p in orders) {
    sql.push(`"${p}" ${orders[p] === 1 ? 'ASC' : 'DESC'}`)
  }
  return {
    sql: sql.length ? `ORDER BY ${sql.join(', ')}` : '',
    values: [],
  }
}

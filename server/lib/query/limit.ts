import { SqlQuery } from './q'

export function limit({
  skip = 0, limit,
}: {
  skip?: number
  limit?: number
} = {}): SqlQuery {
  if (!skip && !limit) return { sql: '', values: [] }
  let sql = `LIMIT ${skip}`
  if (limit) sql += `, ${limit}`
  return { sql, values: [] }
}

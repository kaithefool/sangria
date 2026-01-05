import { SqlQuery } from './SqlQuery'

export function limit({
  skip = 0, limit,
}: {
  skip?: number
  limit?: number
} = {}): SqlQuery {
  if (!skip && !limit) return new SqlQuery('')
  let sql = `LIMIT ${skip}`
  if (limit) sql += `, ${limit}`
  return new SqlQuery(sql)
}

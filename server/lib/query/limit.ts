import { SqlQuery } from './SqlQuery.ts'

export function limit({
  skip = 0,
  limit,
}: {
  skip?: number
  limit?: number
} = {}): SqlQuery {
  if (!skip && !limit) return new SqlQuery('')
  const values: number[] = [skip]
  let sql = `LIMIT ?`
  if (limit) {
    sql += `, ?`
    values.push(limit)
  }
  return new SqlQuery(sql, values)
}

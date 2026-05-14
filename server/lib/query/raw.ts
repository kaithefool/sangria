import { SqlQuery } from './SqlQuery.ts'

export function raw(sql: string) {
  return new SqlQuery(sql, [])
}

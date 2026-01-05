import { SqlQuery } from './SqlQuery'

export function raw(sql: string) {
  return new SqlQuery(sql, [])
}

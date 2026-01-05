import { Database } from 'better-sqlite3'
import { SqlQuery, SqlDataType } from './SqlQuery'
import { where } from './where'
import { values } from './values'
import set from './set'
import { limit } from './limit'
import { orderBy } from './orderBy'
import { raw } from './raw'

export function buildQ(database?: Database) {
  function q(
    tpl: TemplateStringsArray,
    ...vals: (SqlDataType | SqlQuery)[]
  ) {
    let sql = ''
    const values: SqlDataType[] = []
    for (let i = 0; i < tpl.length; i += 1) {
      sql += tpl[i]
      const v = vals[i]
      if (v instanceof SqlQuery) {
        sql += v.sql
        values.push(...v.values ?? [])
      }
      else if (v !== undefined) {
        sql += '?'
        values.push(v)
      }
    }
    return new SqlQuery(sql, values, database)
  }

  q.raw = raw
  // q.values = values
  q.where = where
  // q.set = set
  // q.limit = limit
  // q.orderBy = orderBy
  return q
}

export type Q = ReturnType<typeof buildQ>

export default buildQ()

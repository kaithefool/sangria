import { type SqlDataType, SqlQuery } from './SqlQuery.ts'

export function set(
  input: { [x: string]: SqlDataType | SqlQuery },
  setKeyword = true,
) {
  const entries = Object.entries(input)
  if (!entries.length) throw new Error('Cannot SET empty values.')
  const values: SqlDataType[] = []
  const sql: string[] = []
  for (const ent of entries) {
    const [c, v] = ent
    if (v instanceof SqlQuery) {
      sql.push(`"${c}" = ${v.sql}`)
      values.push(...(v.values ?? []))
    } else {
      sql.push(`"${c}" = ?`)
      values.push(v)
    }
  }
  return new SqlQuery(`${setKeyword ? 'SET ' : ''}${sql.join(', ')}`, values)
}

export default set

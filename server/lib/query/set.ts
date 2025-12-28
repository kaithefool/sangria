import { isSqlQuery, SqlDataType, SqlQuery } from './q'

export function set(
  input: { [x: string]: SqlDataType | SqlQuery },
  setKeyword = true,
): SqlQuery {
  const ent = Object.entries(input)
  if (!ent.length) throw new Error('Cannot SET empty values.')
  const values: SqlDataType[] = []
  const sql: string[] = []
  for (let i = 0; i < ent.length; i += 1) {
    const [c, v] = ent[i]
    if (isSqlQuery(v)) {
      sql.push(`"${c}" = ${v.sql}`)
      values.push(...v.values ?? [])
    }
    else {
      sql.push(`"${c}" = ?`)
      values.push(v)
    }
  }
  return {
    sql: `${setKeyword ? 'SET ' : ''}${sql.join(', ')}`,
    ...values.length && { values },
  }
}

export default set

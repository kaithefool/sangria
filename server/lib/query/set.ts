import { isSqlStmt, SqlDataType, SqlStmt } from './q'

export function set(
  input: { [x: string]: SqlDataType | SqlStmt },
  setKeyword = true,
): SqlStmt {
  const ent = Object.entries(input)
  if (!ent.length) throw new Error('Cannot SET empty values.')
  const values: SqlDataType[] = []
  let sql = setKeyword ? 'SET ' : ''
  for (let i = 0; i < ent.length; i += 1) {
    const [c, v] = ent[i]
    sql += `"${c}" = `
    if (isSqlStmt(v)) {
      sql += v.sql
      values.push(...v.values ?? [])
    }
    else {
      sql += '?'
      values.push(v)
    }
  }
  return {
    sql, ...values.length && { values },
  }
}

export default set

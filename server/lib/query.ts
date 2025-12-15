import { ISqlite } from 'sqlite'

type SqlDataType = string | number | boolean | Date | null
type SqlStmt = ISqlite.SQLStatement

function q(
  tmpl: TemplateStringsArray,
  ...values: (SqlDataType | SqlStmt)[]
): SqlStmt {
  const sql = ''

  return {
    sql,
  }
}

export default q

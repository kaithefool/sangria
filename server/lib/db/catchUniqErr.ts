import Database, { SqliteError } from 'better-sqlite3'

const msgRegExp = /^UNIQUE constraint failed: (.*?)$/

export class SqliteUniqError extends Error {
  col: string
  code: string
  constructor(e: InstanceType<SqliteError>) {
    super(e.message)
    const matched = e.message.match(msgRegExp)
    if (matched === null) throw new Error('Unable to match error message.')
    this.col = matched[1]
    this.name = e.name
    this.code = e.code
    this.stack = e.stack
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function catchUniqErr<F extends () => any>(
  fn: F,
): [SqliteUniqError] | [null, ReturnType<F>] {
  try {
    return [null, fn()]
  }
  catch (err: unknown) {
    if (
      err instanceof Database.SqliteError
      && /^SQLITE_CONSTRAINT_(PRIMARYKEY|UNIQUE)$/.test(err.code)
    ) {
      return [new SqliteUniqError(err)]
    }
    throw err
  }
}

export default catchUniqErr

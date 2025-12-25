const dupErrEegExp = /^SQLITE_CONSTRAINT: UNIQUE constraint failed: (.*?)$/

export class SqlDupErr extends Error {
  static isSqlDupErr(err: unknown): err is Error {
    return err instanceof Error
      && 'errno' in err
      && err.errno === 19
      && 'code' in err
      && err.code === 'SQLITE_CONSTRAINT'
      && dupErrEegExp.test(err.message)
  }

  col: string

  constructor(err: Error) {
    super(err.message)
    const matched = err.message.match(dupErrEegExp)
    if (matched === null || matched.length < 2) {
      throw new Error('Unable to match dup error message pattern')
    }
    const [, colStr] = matched
    this.col = colStr
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function catchDupErr<F extends () => any>(
  fn: F,
): Promise<[SqlDupErr] | [null, Awaited<ReturnType<F>>]> {
  try {
    return [null, await fn()]
  }
  catch (err: unknown) {
    if (SqlDupErr.isSqlDupErr(err)) {
      return [new SqlDupErr(err)]
    }
    throw err
  }
}

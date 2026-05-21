import sqlite from 'better-sqlite3'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { catchUniqErr, SqliteUniqError } from './catchUniqErr.ts'

describe('query unique constraint error catcher', () => {
  let db: sqlite.Database | undefined

  afterEach(async () => {
    await db?.close()
  })

  it.each([[() => 'foobar', 'foobar']])(
    'executes any func & returns whatever the func returns.',
    async (func, result) => {
      const fn = vi.fn(func)
      const [, r] = catchUniqErr(fn)
      expect(fn.mock.calls).toHaveLength(1)
      expect(r).toEqual(result)
    },
  )
  it.each([
    [
      `CREATE TABLE test_tbl (
        row_0 TEXT PRIMARY KEY
      );`,
      `INSERT INTO test_tbl (row_0) VALUES ('foobar')`,
      'test_tbl.row_0',
    ],
    [
      `CREATE TABLE test_tbl (
        row_0 TEXT PRIMARY KEY,
        row_1 TEXT UNIQUE
      )`,
      `INSERT INTO test_tbl (row_0, row_1) VALUES ('foobar', 'meh')`,
      'test_tbl.row_1',
    ],
  ])(
    'catches unique constraint error',
    async (createTblSql, insertSql, result) => {
      db = new sqlite('')
      db.exec(createTblSql)
      const stmt = db.prepare(insertSql)
      stmt.run()
      const [err] = catchUniqErr(() => stmt.run())
      expect(err).not.toBeNull()
      expect(err instanceof SqliteUniqError).toBe(true)
      expect(err?.col).toBe(result)
    },
  )
})

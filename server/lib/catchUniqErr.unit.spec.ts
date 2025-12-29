import { describe, expect, it, jest } from '@jest/globals'
import { catchUniqErr, SqliteUniqError } from './catchUniqErr'
import Database from 'better-sqlite3'
import { afterThis } from '../test'

describe('query unique constraint error catcher', () => {
  it.each([
    [() => 'foobar', 'foobar'],
  ])(
    'executes any func & returns whatever the func returns.',
    async (
      func, result,
    ) => {
      const fn = jest.fn(func)
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
  ])('catches unique constraint error',
    async (createTblSql, insertSql, result) => {
      const db = new Database('')
      afterThis(() => db.close())
      db.exec(createTblSql)
      const stmt = db.prepare(insertSql)
      stmt.run()
      const [err] = catchUniqErr(() => stmt.run())
      expect(err).not.toBeNull()
      expect(err instanceof SqliteUniqError).toBe(true)
      expect(err?.col).toBe(result)
    })
})

import { describe, expect, it, jest } from '@jest/globals'
import { catchDupErr, SqlDupErr } from './catchDupErr'
import { open } from 'sqlite'
import sqlite3 from 'sqlite3'
import { afterThis } from '../../test'

describe('query error catcher', () => {
  it.each([
    [() => 'foobar', 'foobar'],
    [async () => 'foo', 'foo'],
  ])(
    'executes any func, async or sync, & returns whatever the func returns.',
    async (
      func, result,
    ) => {
      const fn = jest.fn(func)
      const [, r] = await catchDupErr(fn)
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
      const db = await open({
        driver: sqlite3.Database,
        filename: '',
      })
      afterThis(() => db.close())
      await db.run(createTblSql)
      await db.run(insertSql)
      const [err] = await catchDupErr(() => db.run(insertSql))
      expect(err).not.toBeNull()
      expect(err instanceof SqlDupErr).toBe(true)
      expect(err?.col).toBe(result)
    })
})

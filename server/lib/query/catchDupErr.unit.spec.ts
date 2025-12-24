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
  it('catches unique constraint error', async () => {
    const db = await open({
      driver: sqlite3.Database,
      filename: '',
    })
    afterThis(() => db.close())
    await db.run(`
      CREATE TABLE test_tbl (
        row_0 TEXT PRIMARY KEY
      ); 
    `)
    const insertSql = `INSERT INTO test_tbl (row_0) VALUES ('foobar')`
    await db.run(insertSql)
    const [err] = await catchDupErr(() => db.run(insertSql))
    expect(err).not.toBeNull()
    expect(err instanceof SqlDupErr).toBe(true)
    expect(err?.col).toBe('test_tbl.row_0')
  })
})

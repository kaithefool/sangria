import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import { SqlQuery } from './SqlQuery.ts'
import sqlite from 'better-sqlite3'

describe('SqlQuery', () => {
  let db: sqlite.Database
  beforeEach(async () => {
    db = new sqlite()
  })
  afterEach(async () => db.close())

  it.each([
    () => new SqlQuery('').prepare(),
    () => new SqlQuery('').run(),
    () => new SqlQuery('').get(),
    () => new SqlQuery('').all(),
    () => new SqlQuery('').iterate(),
    () => new SqlQuery('').raw(),
  ])('throws when any method is called without database provided', (fn) => {
    expect(fn).toThrow()
  })

  it('run query with database provided', () => {
    expect(() =>
      new SqlQuery('CREATE TABLE a (b INT, c TEXT);', [], db).run(),
    ).not.toThrow()
  })

  it('escape values', () => {
    new SqlQuery('CREATE TABLE a (b INT, c TEXT);', [], db).run()
    new SqlQuery('INSERT INTO a (b, c) VALUES (?, ?)', [1, 'foo'], db).run()
    new SqlQuery('INSERT INTO a (b, c) VALUES (?, ?)', [2, 'bar'], db).run()
    expect(new SqlQuery('SELECT * FROM a', [], db).all()).toMatchObject([
      {
        b: 1,
        c: 'foo',
      },
      {
        b: 2,
        c: 'bar',
      },
    ])
  })
})

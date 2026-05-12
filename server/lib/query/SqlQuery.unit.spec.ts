import { afterEach, beforeEach, describe, expect, it } from '@jest/globals'
import sqlite, { type Database } from 'better-sqlite3'
import { toJsDate, SqlQuery, toSqlDateStr } from './SqlQuery.ts'

describe('toSqlDateStr', () => {
  it('transforms Date object to Sql date string', () => {
    expect(toSqlDateStr(new Date('1970-01-01T00:00:00.000Z'))).toBe(
      '1970-01-01 00:00:00.000',
    )
    expect(toSqlDateStr(new Date('1970-01-01T00:00:00.000+08:00'))).toBe(
      '1969-12-31 16:00:00.000',
    )
  })
})

describe('toJsDate', () => {
  it('casts number into Date Object', () => {
    const d0 = new Date('1970-01-01T00:00:00.000Z')
    const d1 = new Date('1970-01-01T00:00:00.000+08:00')
    expect(toJsDate(+d0 / 1000)).toEqual(d0)
    expect(toJsDate(+d1 / 1000)).toEqual(d1)
  })
  it('casts string into Date Object', () => {
    const d0 = new Date('1970-01-01T00:00:00.000Z')
    const d1 = new Date('1970-01-01T00:00:00.000+08:00')
    expect(toJsDate(toSqlDateStr(d0))).toEqual(d0)
    expect(toJsDate(toSqlDateStr(d0).replace(/\.000$/, ''))).toEqual(d0)
    expect(toJsDate(toSqlDateStr(d1))).toEqual(d1)
    expect(toJsDate(toSqlDateStr(d1).replace(/\.000$/, ''))).toEqual(d1)
  })
  it('throws for invalid formatted date string', () => {
    expect(() => toJsDate('')).toThrow()
    expect(() => toJsDate('1970-01-01T')).toThrow()
    expect(() => toJsDate('1970-01-01 000:00:00')).toThrow()
  })
})

describe('SqlQuery', () => {
  let db: Database
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

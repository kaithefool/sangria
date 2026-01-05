import { describe, it, expect, afterAll } from '@jest/globals'
import { SqlQuery } from './SqlQuery'
import Database from 'better-sqlite3'

describe('SqlQuery', () => {
  const db = new Database('')
  const sq = new SqlQuery('')
  afterAll(async () => db.close())
  it.each([
    () => sq.prepare(),
    () => sq.run(),
    () => sq.get(),
    () => sq.all(),
    () => sq.iterate(),
    () => sq.raw(),
  ])(
    'throws when any method is called without database provided',
    (fn) => {
      expect(fn).toThrow()
    },
  )
  it.each([
    [
      () => new SqlQuery('CREATE TABLE a (b INT, c TEXT);', [], db).run(),
      null,
    ],
    [
      () => new SqlQuery(
        'INSERT INTO a (b, c) VALUES (?, ?)', [1, 'foo'], db,
      ).prepare().run(),
      null,
    ],
    [
      () => new SqlQuery(
        'INSERT INTO a (b, c) VALUES (?, ?)', [2, 'bar'], db,
      ).prepare().run(),
      null,
    ],
    [
      () => new SqlQuery('SELECT * FROM a;', [], db).get(),
      { b: 1, c: 'foo' },
    ],
    [
      () => new SqlQuery('SELECT * FROM a;', [], db).all(),
      [{ b: 1, c: 'foo' }, { b: 2, c: 'bar' }],
    ],
    [
      () => new SqlQuery('SELECT * FROM a;', [], db).iterate(),
      [{ b: 1, c: 'foo' }, { b: 2, c: 'bar' }],
    ],
    [
      () => new SqlQuery('SELECT * FROM a;', [], db).raw().all(),
      [[1, 'foo'], [2, 'bar']],
    ],
  ])(
    'runs queries with database provided',
    (fn, result) => {
      const rr = fn()
      if (Array.isArray(result)) {
        expect(Array.from(rr as Iterable<unknown>)).toMatchObject(result)
      }
      else if (result !== null) {
        expect(rr).toMatchObject(result)
      }
    },
  )
})

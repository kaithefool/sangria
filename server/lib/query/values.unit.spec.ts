import { describe, it, expect } from '@jest/globals'
import { values } from './values'
import q from './q'

describe('VALUES builder', () => {
  it.each([
    values({}),
    values({ id: Buffer.from('random_id', 'binary') }),
    values({ role: 'admin', last_login_at: q`CURRENT_TIMESTAMP` }),
    values({ expires_at: q`datetime('now', ${'+5 days'})` }),
  ])('returns an object implementing SQLStatement interface', (query) => {
    expect(typeof query).toBe('object')
    const { sql, values } = query
    expect(typeof sql).toBe('string')
    expect(Array.isArray(values)).toBe(true)
  })
  it.each([
    [values({}), []],
    [
      values({ id: Buffer.from('random_id', 'binary') }),
      [Buffer.from('random_id', 'binary')],
    ],
    [
      values({ role: 'admin', last_login_at: q`CURRENT_TIMESTAMP` }),
      ['admin'],
    ],
    [
      values({ expires_at: q`datetime('now', ${'+5 days'})` }),
      ['+5 days'],
    ],
  ])('returns values in the correct sequence', (query, result) => {
    expect(query.values).toEqual(result)
  })
  it.each([
    [values({}), 'DEFAULT VALUES'],
    [
      values({ id: Buffer.from('random_id', 'binary') }),
      '("id") VALUES (?)',
    ],
    [
      values({ role: 'admin', last_logout_at: q`CURRENT_TIMESTAMP` }),
      '("role", "last_logout_at") VALUES (?, CURRENT_TIMESTAMP)',
    ],
    [
      values({ expires_at: q`datetime('now', ${'+5 days'})` }),
      '("expires_at") VALUES (datetime(\'now\', ?))',
    ],
  ])('return statement with question marks', (query, result) => {
    expect(query.sql).toEqual(result)
  })
  it.each([
    [values([]), { sql: 'DEFAULT VALUES', values: [] }],
    [
      values([
        { a: 1, b: 'foo' },
        { a: 2, b: 'bar' },
      ]),
      {
        sql: '("a", "b") VALUES (?, ?), (?, ?)',
        values: [1, 'foo', 2, 'bar'],
      },
    ],
    [
      values([
        { a: q`CURRENT_TIMESTAMP` },
        { a: q`CURRENT_TIMESTAMP` },
      ]),
      {
        sql: '("a") VALUES (CURRENT_TIMESTAMP), (CURRENT_TIMESTAMP)',
        values: [],
      },
    ],
  ])('supports multiple rows', (query, result) => {
    expect(query.sql).toBe(result.sql)
    expect(query.values).toEqual(result.values)
  })
})

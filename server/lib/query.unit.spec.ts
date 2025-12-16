import { describe, expect, it } from '@jest/globals'
import q from './query'

describe('query', () => {
  it.each([
    q``,
    q`SELECT * FROM users;`,
    q`SELECT ${'id'}, ${'role'} FROM users;`,
    q`SELECT ${'id'} FROM users ${q`WHERE role = ${'admin'}`};`,
    q`SELECT ${'id'} FROM users a ${q`WHERE ${q`a.${'role'}`} = ${'admin'}`};`,
  ])('returns an object implementing SQLStatement interface', (stmt) => {
    expect(typeof stmt).toBe('object')
    const { sql, values } = stmt
    expect(typeof sql).toBe('string')
    expect(values === undefined || Array.isArray(values)).toBe(true)
  })
  it.each([
    [q``, undefined],
    [q`SELECT * FROM users;`, undefined],
    [
      q`SELECT ${'id'}, ${'role'} FROM users;`,
      ['id', 'role'],
    ],
    [
      q`SELECT ${'id'} FROM users ${q`WHERE role = ${'admin'}`};`,
      ['id', 'admin'],
    ],
    [
      q`SELECT ${'id'} FROM urs a ${q`WHERE ${q`a.${'role'}`} = ${'admin'}`};`,
      ['id', 'role', 'admin'],
    ],
  ])('returns values in the correct sequence', (stmt, values) => {
    expect(stmt.values).toEqual(values)
  })
  it.each([
    [q``, ''],
    [q`SELECT * FROM users;`, 'SELECT * FROM users;'],
    [
      q`SELECT ${'id'}, ${'role'} FROM users;`,
      'SELECT ?, ? FROM users;',
    ],
    [
      q`SELECT ${'id'} FROM users ${q`WHERE role = ${'admin'}`};`,
      'SELECT ? FROM users WHERE role = ?;',
    ],
    [
      q`SELECT ${'id'} FROM urs a ${q`WHERE ${q`a.${'role'}`} = ${'admin'}`};`,
      'SELECT ? FROM urs a WHERE a.? = ?;',
    ],
  ])('return statement with question marks', (stmt, sql) => {
    expect(stmt.sql).toEqual(sql)
  })
})

describe('query VALUES builder', () => {
  it.each([
    q.values({}),
    q.values({ id: Buffer.from('random_id', 'binary') }),
    q.values({ role: 'admin', last_login_at: q`CURRENT_TIMESTAMP` }),
    q.values({ expires_at: q`DATETIME('now', ${'+5 days'})` }),
  ])('returns an object implementing SQLStatement interface', (stmt) => {
    expect(typeof stmt).toBe('object')
    const { sql, values } = stmt
    expect(typeof sql).toBe('string')
    expect(values === undefined || Array.isArray(values)).toBe(true)
  })
  it.each([
    [q.values({}), undefined],
    [
      q.values({ id: Buffer.from('random_id', 'binary') }),
      [Buffer.from('random_id', 'binary')],
    ],
    [
      q.values({ role: 'admin', last_login_at: q`CURRENT_TIMESTAMP` }),
      ['admin'],
    ],
    [
      q.values({ expires_at: q`DATETIME('now', ${'+5 days'})` }),
      ['+5 days'],
    ],
  ])('returns values in the correct sequence', (stmt, values) => {
    expect(stmt.values).toEqual(values)
  })
  it.each([
    [q.values({}), 'DEFAULT VALUES'],
    [
      q.values({ id: Buffer.from('random_id', 'binary') }),
      '(id) VALUES (?)',
    ],
    [
      q.values({ role: 'admin', last_logout_at: q`CURRENT_TIMESTAMP` }),
      '(role, last_logout_at) VALUES (?, CURRENT_TIMESTAMP)',
    ],
    [
      q.values({ expires_at: q`DATETIME('now', ${'+5 days'})` }),
      '(expires_at) VALUES (DATETIME(\'now\', ?))',
    ],
  ])('return statement with question marks', (stmt, values) => {
    expect(stmt.sql).toEqual(values)
  })
})

import { describe, expect, it } from '@jest/globals'
import q, { cfStmt, compare, isAndClause, values } from './query'

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
    values({}),
    values({ id: Buffer.from('random_id', 'binary') }),
    values({ role: 'admin', last_login_at: q`CURRENT_TIMESTAMP` }),
    values({ expires_at: q`datetime('now', ${'+5 days'})` }),
  ])('returns an object implementing SQLStatement interface', (stmt) => {
    expect(typeof stmt).toBe('object')
    const { sql, values } = stmt
    expect(typeof sql).toBe('string')
    expect(values === undefined || Array.isArray(values)).toBe(true)
  })
  it.each([
    [values({}), undefined],
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
  ])('returns values in the correct sequence', (stmt, values) => {
    expect(stmt.values).toEqual(values)
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
  ])('return statement with question marks', (stmt, values) => {
    expect(stmt.sql).toEqual(values)
  })
})

describe('query cfStmt builder', () => {
  it.each([
    [cfStmt('a', 'eq', 8), { sql: '"a" = ?', values: [8] }],
    [cfStmt('a', 'ne', 8), { sql: '"a" != ?', values: [8] }],
    [
      cfStmt('a', 'in', [8, 10, 12]),
      { sql: '"a" IN (?, ?, ?)', values: [8, 10, 12] },
    ],
    [
      cfStmt('a', 'nin', [8, 10, 12]),
      { sql: '"a" NOT IN (?, ?, ?)', values: [8, 10, 12] },
    ],
    [cfStmt('a', 'gt', 8), { sql: '"a" > ?', values: [8] }],
    [cfStmt('a', 'gte', 8), { sql: '"a" >= ?', values: [8] }],
    [cfStmt('a', 'lt', 8), { sql: '"a" < ?', values: [8] }],
    [cfStmt('a', 'lte', 8), { sql: '"a" <= ?', values: [8] }],
  ])('returns correct statement object', (actual, expected) => {
    expect(actual).toEqual(expected)
  })
})

describe('query comparison builder', () => {
  it.each([
    [compare({ a: 3 }), { sql: '"a" = ?', values: [3] }],
    [
      compare({ a: 3, b: 'meh' }),
      { sql: '"a" = ? AND "b" = ?', values: [3, 'meh'] },
    ],
    [
      compare({ id: Buffer.from('test', 'binary'), active: true }),
      {
        sql: '"id" = ? AND "active" = ?',
        values: [Buffer.from('test', 'binary'), true],
      },
    ],
  ])('accepts sql data types and return equal comparison query', (
    actual, expected,
  ) => {
    expect(actual).toEqual(expected)
  })
  it.each([
    [compare({ a: { eq: 3 } }), { sql: '"a" = ?', values: [3] }],
    [compare({ a: { ne: 3 } }), { sql: '"a" != ?', values: [3] }],
    [compare({ a: { gt: 3 } }), { sql: '"a" > ?', values: [3] }],
    [compare({ a: { gte: 3 } }), { sql: '"a" >= ?', values: [3] }],
    [compare({ a: { lt: 3 } }), { sql: '"a" < ?', values: [3] }],
    [compare({ a: { lte: 3 } }), { sql: '"a" <= ?', values: [3] }],
    [
      compare({ a: { in: [1, 2, 3] } }),
      { sql: '"a" IN (?, ?, ?)', values: [1, 2, 3] },
    ],
    [
      compare({ a: { nin: [1, 2, 3] } }),
      { sql: '"a" NOT IN (?, ?, ?)', values: [1, 2, 3] },
    ],
    [
      compare({ a: { in: [1, 2, 3], ne: 4 } }),
      { sql: '"a" IN (?, ?, ?) AND "a" != ?', values: [1, 2, 3, 4] },
    ],
  ])('accepts comparison operators', (actual, expected) => {
    expect(actual).toEqual(expected)
  })
  it.each([
    [compare({ a: q`> ${3}` }), { sql: '"a" > ?', values: [3] }],
    [
      compare({ a: q`> CURRENT_TIMESTAMP` }),
      { sql: '"a" > CURRENT_TIMESTAMP' },
    ],
  ])('accepts sql statements', (actual, expected) => {
    expect(actual).toEqual(expected)
  })
})

describe('query isAndClause', () => {
  it('detect AND keyword in the case-insensitive way', () => {
    expect(isAndClause('WHERE a = 3 AND b = \'meh\'')).toBe(true)
    expect(isAndClause('WHERE a = 3 and b = \'meh\'')).toBe(true)
    expect(isAndClause('AND b = \'meh\'')).toBe(true)
    expect(isAndClause('b = \'meh\' AND')).toBe(true)
    expect(isAndClause('WHERE ANDMEH = 3')).toBe(false)
    expect(isAndClause('WHERE andmeh = 3')).toBe(false)
    expect(isAndClause('WHERE foo_AND = 3')).toBe(false)
    expect(isAndClause('WHERE foo_and = 3')).toBe(false)
  })
  it('ignores AND in string data', () => {
    expect(isAndClause('WHERE a = \'WHERE a = 3 AND b = 4\'')).toBe(false)
    expect(isAndClause('WHERE a = \'WHERE a = 3 and b = 4\'')).toBe(false)
    expect(isAndClause('WHERE "AND" = "WHERE a = 3 AND b = 4"')).toBe(false)
    expect(isAndClause('WHERE "and" = "WHERE a = 3 and b = 4"')).toBe(false)
    expect(isAndClause('WHERE a = "AND" OR b = 3')).toBe(false)
    expect(isAndClause('WHERE a = "and" OR b = 3')).toBe(false)
  })
  it('ignores AND in parenthesis', () => {
    expect(isAndClause('WHERE a = (SELECT * FROM t WHERE b AND c)')).toBe(false)
    expect(isAndClause('WHERE a IN (1, 2, 3) AND b = 4')).toBe(true)
    expect(isAndClause('WHERE (a = 1 AND b = 2) AND c = 3')).toBe(false)
    expect(isAndClause('WHERE a = (1 AND 2)')).toBe(false)
    expect(isAndClause('WHERE func(a AND b) = 1')).toBe(false)
  })
})

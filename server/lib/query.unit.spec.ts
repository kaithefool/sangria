import { describe, expect, it } from '@jest/globals'
import q, {
  cfStmt, compare, isAndClause, prependWhere, rmWhere, SqlWhereStmt, values,
} from './query'

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

describe('VALUES builder', () => {
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

describe('cfStmt builder', () => {
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

describe('comparison builder', () => {
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

describe('isAndClause', () => {
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

describe('rmWhere', () => {
  it('removes WHERE keyword at the beginning of the string', () => {
    expect(rmWhere('WHERE a = 3')).toBe('a = 3')
    expect(rmWhere('where a = 3')).toBe('a = 3')
    expect(rmWhere('WHERE a = 3 AND b = 4')).toBe('a = 3 AND b = 4')
    expect(rmWhere('a = 3')).toBe('a = 3')
    expect(rmWhere('')).toBe('')
  })
  it('handles whitespace correctly', () => {
    expect(rmWhere('WHERE  a = 3')).toBe('a = 3')
    expect(rmWhere('WHERE\ta = 3')).toBe('a = 3')
  })
  it('only removes WHERE at the start', () => {
    expect(rmWhere('a = 3 WHERE b = 4')).toBe('a = 3 WHERE b = 4')
  })
})

describe('prependWhere', () => {
  it('prepends WHERE keyword if not present', () => {
    expect(prependWhere('a = 3')).toBe('WHERE a = 3')
    expect(prependWhere('a = 3 AND b = 4')).toBe('WHERE a = 3 AND b = 4')
  })
  it('does not prepend WHERE if already present', () => {
    expect(prependWhere('WHERE a = 3')).toBe('WHERE a = 3')
    expect(prependWhere('where a = 3')).toBe('where a = 3')
    expect(prependWhere('WHERE a = 3 AND b = 4')).toBe('WHERE a = 3 AND b = 4')
  })
  it('handles whitespace correctly', () => {
    expect(prependWhere('  a = 3')).toBe('WHERE a = 3')
    expect(prependWhere('\ta = 3')).toBe('WHERE a = 3')
    expect(prependWhere(`\ra = 3`)).toBe('WHERE a = 3')
  })
  it('handles empty string', () => {
    expect(prependWhere('')).toBe('')
  })
})

describe('SqlWhereStmt', () => {
  it('accepts SqlStmt and prepend "WHERE" correctly', () => {
    expect(new SqlWhereStmt(q``)).toEqual({
      sql: '',
    })
    expect(new SqlWhereStmt(q`a = ${3}`)).toEqual({
      sql: 'WHERE a = ?', values: [3],
    })
    expect(new SqlWhereStmt(q`a = 3`, false)).toEqual({
      sql: 'a = 3',
    })
  })
  it('accepts SqlCfMap and prepend "WHERE" correctly', () => {
    expect(new SqlWhereStmt({})).toEqual({
      sql: '',
    })
    expect(new SqlWhereStmt({ a: 3, b: 'foo' })).toEqual({
      sql: 'WHERE "a" = ? AND "b" = ?', values: [3, 'foo'],
    })
    expect(new SqlWhereStmt({ a: 3 }, false)).toEqual({
      sql: '"a" = ?', values: [3],
    })
  })
  it('accepts SqlWhereStmt and prepend "WHERE" correctly', () => {
    expect(new SqlWhereStmt(new SqlWhereStmt({}))).toEqual({
      sql: '',
    })
    expect(new SqlWhereStmt(new SqlWhereStmt({ a: 3, b: 'foo' }))).toEqual({
      sql: 'WHERE "a" = ? AND "b" = ?', values: [3, 'foo'],
    })
    expect(new SqlWhereStmt(new SqlWhereStmt({ a: 3 }), false)).toEqual({
      sql: '"a" = ?', values: [3],
    })
  })
  it('appends statement with "AND"', () => {
    expect(new SqlWhereStmt({}).and(q`a = 3`)).toEqual({
      sql: 'WHERE a = 3',
    })
    expect(new SqlWhereStmt({ b: 'foo' }).and(q`a = 3`)).toEqual({
      sql: 'WHERE "b" = ? AND a = 3', values: ['foo'],
    })
    expect(new SqlWhereStmt(q`b = ${'foo'}`).and({ a: 3 })).toEqual({
      sql: 'WHERE b = ? AND "a" = ?', values: ['foo', 3],
    })
  })
  it('appends statement with "OR"', () => {
    expect(new SqlWhereStmt({}).or(q`a = 3`)).toEqual({
      sql: 'WHERE a = 3',
    })
    expect(new SqlWhereStmt({ b: 'foo' }).or(q`a = 3`)).toEqual({
      sql: 'WHERE "b" = ? OR a = 3', values: ['foo'],
    })
    expect(new SqlWhereStmt(q`b = ${'foo'}`).or({ a: 3 })).toEqual({
      sql: 'WHERE b = ? OR "a" = ?', values: ['foo', 3],
    })
  })
  it('wraps AND statements with parenthesis when appending OR', () => {
    expect(new SqlWhereStmt({ a: 3, b: 'foo' }).or({ c: true })).toEqual({
      sql: 'WHERE ("a" = ? AND "b" = ?) OR "c" = ?', values: [3, 'foo', true],
    })
    expect(new SqlWhereStmt({ c: true }).or({ a: 3, b: 'foo' })).toEqual({
      sql: 'WHERE "c" = ? OR ("a" = ? AND "b" = ?)', values: [true, 3, 'foo'],
    })
  })
  it('does not wraps statement with unnecessary parenthesis', () => {
    expect(new SqlWhereStmt(q`a = 3 OR b = 'foo'`).or({ c: true })).toEqual({
      sql: 'WHERE a = 3 OR b = \'foo\' OR "c" = ?', values: [true],
    })
  })
})

import { describe, it, expect } from '@jest/globals'
import q from './q'
import {
  cfStmt, compare, hasLogical,
  prependWhere, hasWhere, rmWhere,
  SqlWhereStmt,
} from './where'

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
      { sql: '"a" > CURRENT_TIMESTAMP', values: [] },
    ],
  ])('accepts sql statements', (actual, expected) => {
    expect(actual).toEqual(expected)
  })
})

describe('hasLogical', () => {
  it('detects AND keyword in the case-insensitive way', () => {
    expect(hasLogical('AND', 'WHERE a = 3 AND b = \'meh\'')).toBe(true)
    expect(hasLogical('AND', 'WHERE a = 3 and b = \'meh\'')).toBe(true)
    expect(hasLogical('AND', 'AND b = \'meh\'')).toBe(true)
    expect(hasLogical('AND', 'b = \'meh\' AND')).toBe(true)
    expect(hasLogical('AND', 'WHERE ANDMEH = 3')).toBe(false)
    expect(hasLogical('AND', 'WHERE andmeh = 3')).toBe(false)
    expect(hasLogical('AND', 'WHERE foo_AND = 3')).toBe(false)
    expect(hasLogical('AND', 'WHERE foo_and = 3')).toBe(false)
  })
  it('ignores AND in quotes and double quotes', () => {
    expect(hasLogical('AND', 'WHERE a = \'WHERE a = 3 AND b = 4\'')).toBe(false)
    expect(hasLogical('AND', 'WHERE a = \'WHERE a = 3 and b = 4\'')).toBe(false)
    expect(hasLogical('AND', 'WHERE "AND" = "WHERE a = 3 AND b = 4"'))
      .toBe(false)
    expect(hasLogical('AND', 'WHERE "and" = "WHERE a = 3 and b = 4"'))
      .toBe(false)
    expect(hasLogical('AND', 'WHERE a = "AND" OR b = 3')).toBe(false)
    expect(hasLogical('AND', 'WHERE a = "and" OR b = 3')).toBe(false)
    expect(hasLogical('AND', '"a" = ? AND "b" = ?')).toBe(true)
  })
  it('ignores AND in parenthesis', () => {
    expect(hasLogical('AND', 'WHERE a = (SELECT * FROM t WHERE b AND c)'))
      .toBe(false)
    expect(hasLogical('AND', 'WHERE a IN (1, 2, 3) AND b = 4')).toBe(true)
    expect(hasLogical('AND', 'WHERE (a = 1 AND b = 2) OR c = 3')).toBe(false)
    expect(hasLogical('AND', 'WHERE a = (1 AND 2)')).toBe(false)
    expect(hasLogical('AND', 'WHERE func(a AND b) = 1')).toBe(false)
    expect(hasLogical('AND', '(a = 1 OR b = 2) AND (c = 3 OR d = 4)'))
      .toBe(true)
    expect(hasLogical('AND', '(a = 1 OR (b = 2)) AND ((c = 3) OR d = 4)'))
      .toBe(true)
    expect(hasLogical('AND', '(a = 1) OR ((c = 3 AND e = 5) OR d = 4)'))
      .toBe(false)
  })
  it('detects OR keyword in the case-insensitive way', () => {
    expect(hasLogical('OR', 'WHERE a = 3 OR b = \'meh\'')).toBe(true)
    expect(hasLogical('OR', 'WHERE a = 3 OR b = \'meh\'')).toBe(true)
    expect(hasLogical('OR', 'OR b = \'meh\'')).toBe(true)
    expect(hasLogical('OR', 'b = \'meh\' OR')).toBe(true)
    expect(hasLogical('OR', 'WHERE ORMEH = 3')).toBe(false)
    expect(hasLogical('OR', 'WHERE ormeh = 3')).toBe(false)
    expect(hasLogical('OR', 'WHERE foo_OR = 3')).toBe(false)
    expect(hasLogical('OR', 'WHERE foo_or = 3')).toBe(false)
  })
  it('ignores OR in string data', () => {
    expect(hasLogical('OR', 'WHERE a = \'WHERE a = 3 OR b = 4\'')).toBe(false)
    expect(hasLogical('OR', 'WHERE a = \'WHERE a = 3 OR b = 4\'')).toBe(false)
    expect(hasLogical('OR', 'WHERE "OR" = "WHERE a = 3 OR b = 4"')).toBe(false)
    expect(hasLogical('OR', 'WHERE "or" = "WHERE a = 3 and b = 4"')).toBe(false)
    expect(hasLogical('OR', 'WHERE a = "OR" AND b = 3')).toBe(false)
    expect(hasLogical('OR', 'WHERE a = "or" AND b = 3')).toBe(false)
    expect(hasLogical('OR', '"a" = ? OR "b" = ?')).toBe(true)
  })
  it('ignores OR in parenthesis', () => {
    expect(hasLogical('OR', 'WHERE a = (SELECT * FROM t WHERE b OR c)'))
      .toBe(false)
    expect(hasLogical('OR', 'WHERE a IN (1, 2, 3) OR b = 4')).toBe(true)
    expect(hasLogical('OR', 'WHERE (a = 1 OR b = 2) AND c = 3')).toBe(false)
    expect(hasLogical('OR', 'WHERE a = (1 OR 2)')).toBe(false)
    expect(hasLogical('OR', 'WHERE func(a OR b) = 1')).toBe(false)
    expect(hasLogical('OR', '(a = 1 AND b = 2) OR (c = 3 AND d = 4)'))
      .toBe(true)
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

describe('hasWhere', () => {
  it('detects WHERE keyword at the beginning of the string', () => {
    expect(hasWhere('WHERE a = 3')).toBe(true)
    expect(hasWhere('where a = 3')).toBe(true)
    expect(hasWhere('WHERE a = 3 AND b = 4')).toBe(true)
  })
  it('returns false when WHERE is not present', () => {
    expect(hasWhere('a = 3')).toBe(false)
    expect(hasWhere('a = 3 AND b = 4')).toBe(false)
    expect(hasWhere('')).toBe(false)
  })
  it('handles whitespace correctly', () => {
    expect(hasWhere('  WHERE a = 3')).toBe(true)
    expect(hasWhere('WHERE  a = 3')).toBe(true)
    expect(hasWhere('WHERE\ta = 3')).toBe(true)
    expect(hasWhere('WHERE\ra = 3')).toBe(true)
  })
  it('returns false when WHERE appears only at the end', () => {
    expect(hasWhere('a = 3 WHERE b = 4')).toBe(false)
    expect(hasWhere('a = 3 WHERE')).toBe(false)
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
    expect(new SqlWhereStmt(q``)).toMatchObject({
      sql: '',
    })
    expect(new SqlWhereStmt(q`a = ${3}`)).toMatchObject({
      sql: 'WHERE a = ?', values: [3],
    })
    expect(new SqlWhereStmt(q`a = 3`, false)).toMatchObject({
      sql: 'a = 3',
    })
  })
  it('accepts SqlCfMap and prepend "WHERE" correctly', () => {
    expect(new SqlWhereStmt({})).toMatchObject({
      sql: '',
    })
    expect(new SqlWhereStmt({ a: 3, b: 'foo' })).toMatchObject({
      sql: 'WHERE "a" = ? AND "b" = ?', values: [3, 'foo'],
    })
    expect(new SqlWhereStmt({ a: 3 }, false)).toMatchObject({
      sql: '"a" = ?', values: [3],
    })
  })
  it('accepts SqlWhereStmt and prepend "WHERE" correctly', () => {
    expect(new SqlWhereStmt(new SqlWhereStmt({}))).toMatchObject({
      sql: '',
    })
    expect(
      new SqlWhereStmt(new SqlWhereStmt({ a: 3, b: 'foo' })),
    ).toMatchObject({
      sql: 'WHERE "a" = ? AND "b" = ?', values: [3, 'foo'],
    })
    expect(new SqlWhereStmt(new SqlWhereStmt({ a: 3 }), false)).toMatchObject({
      sql: '"a" = ?', values: [3],
    })
  })
  it('appends statement with "AND"', () => {
    expect(new SqlWhereStmt({}).and(q`a = 3`)).toMatchObject({
      sql: 'WHERE a = 3',
    })
    expect(new SqlWhereStmt({ b: 'foo' }).and(q`a = 3`)).toMatchObject({
      sql: 'WHERE "b" = ? AND a = 3', values: ['foo'],
    })
    expect(new SqlWhereStmt(q`b = ${'foo'}`).and({ a: 3 })).toMatchObject({
      sql: 'WHERE b = ? AND "a" = ?', values: ['foo', 3],
    })
  })
  it('wraps OR statements with parenthesis when appending AND', () => {
    expect(
      new SqlWhereStmt({ a: 3 }).or({ b: 'foo' }).and({ c: true }),
    ).toMatchObject({
      sql: 'WHERE ("a" = ? OR "b" = ?) AND "c" = ?', values: [3, 'foo', true],
    })
    expect(
      new SqlWhereStmt({ c: true }).and(
        new SqlWhereStmt({ a: 3 }).or({ b: 'foo' }),
      ),
    ).toMatchObject({
      sql: 'WHERE "c" = ? AND ("a" = ? OR "b" = ?)', values: [true, 3, 'foo'],
    })
  })
  it('does not wraps statement with unnecessary parenthesis', () => {
    expect(
      new SqlWhereStmt(q`a = 3 AND b = 'foo'`).and({ c: true }),
    ).toMatchObject({
      sql: 'WHERE a = 3 AND b = \'foo\' AND "c" = ?', values: [true],
    })
    expect(
      new SqlWhereStmt(
        q`a = 3 AND (b = ${'foo'} OR c = 0)`,
      ).and({ d: 'bar' }),
    ).toMatchObject({
      sql: 'WHERE a = 3 AND (b = ? OR c = 0) AND "d" = ?',
      values: ['foo', 'bar'],
    })
  })
  it('appends statement with "OR"', () => {
    expect(new SqlWhereStmt({}).or(q`a = 3`)).toMatchObject({
      sql: 'WHERE a = 3',
    })
    expect(new SqlWhereStmt({ b: 'foo' }).or(q`a = 3`)).toMatchObject({
      sql: 'WHERE "b" = ? OR a = 3', values: ['foo'],
    })
    expect(new SqlWhereStmt(q`b = ${'foo'}`).or({ a: 3 })).toMatchObject({
      sql: 'WHERE b = ? OR "a" = ?', values: ['foo', 3],
    })
  })
  it('wraps AND statements with parenthesis when appending OR', () => {
    expect(
      new SqlWhereStmt({ a: 3, b: 'foo' }).or({ c: true }),
    ).toMatchObject({
      sql: 'WHERE ("a" = ? AND "b" = ?) OR "c" = ?', values: [3, 'foo', true],
    })
    expect(new SqlWhereStmt({ c: true }).or({ a: 3, b: 'foo' })).toMatchObject({
      sql: 'WHERE "c" = ? OR ("a" = ? AND "b" = ?)', values: [true, 3, 'foo'],
    })
  })
  it('does not wraps statement with unnecessary parenthesis', () => {
    expect(
      new SqlWhereStmt(q`a = 3 OR b = 'foo'`).or({ c: true }),
    ).toMatchObject({
      sql: 'WHERE a = 3 OR b = \'foo\' OR "c" = ?', values: [true],
    })
    expect(
      new SqlWhereStmt(q`a = 3 OR (b = ${'foo'} AND c = 0)`).or({ d: 'bar' }),
    ).toMatchObject({
      sql: 'WHERE a = 3 OR (b = ? AND c = 0) OR "d" = ?',
      values: ['foo', 'bar'],
    })
  })
  it('removes duplicated WHERE keyword', () => {
    expect(
      new SqlWhereStmt(
        new SqlWhereStmt(
          new SqlWhereStmt({ a: 3 }),
        ),
      ),
    ).toMatchObject({ sql: 'WHERE "a" = ?', values: [3] })
  })
})

import { describe, it, expect } from '@jest/globals'
import set from './set'
import q from './q'

describe('SET query builder', () => {
  it.each([
    set({ id: Buffer.from('random_id', 'binary') }),
    set({ role: 'admin', last_login_at: q`CURRENT_TIMESTAMP` }),
    set({ expires_at: q`datetime('now', ${'+5 days'})` }),
  ])('returns an object implementing SQLStatement interface', (stmt) => {
    expect(typeof stmt).toBe('object')
    const { sql, values } = stmt
    expect(typeof sql).toBe('string')
    expect(values === undefined || Array.isArray(values)).toBe(true)
  })
  it.each([
    [
      set({ id: Buffer.from('random_id', 'binary') }),
      [Buffer.from('random_id', 'binary')],
    ],
    [
      set({ role: 'admin', last_login_at: q`CURRENT_TIMESTAMP` }),
      ['admin'],
    ],
    [
      set({ expires_at: q`datetime('now', ${'+5 days'})` }),
      ['+5 days'],
    ],
  ])('returns values in the correct sequence', (stmt, values) => {
    expect(stmt.values).toEqual(values)
  })
  it.each([
    [
      set({ id: Buffer.from('random_id', 'binary') }),
      'SET "id" = ?',
    ],
    [
      set({ role: 'admin', last_logout_at: q`CURRENT_TIMESTAMP` }),
      'SET "role" = ?, "last_logout_at" = CURRENT_TIMESTAMP',
    ],
    [
      set({ expires_at: q`datetime('now', ${'+5 days'})` }),
      'SET "expires_at" = datetime(\'now\', ?)',
    ],
  ])('return statement with question marks', (stmt, values) => {
    expect(stmt.sql).toEqual(values)
  })
})

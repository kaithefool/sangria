import { describe, expect, it } from 'vitest'
import { limit } from './limit.ts'

describe('limit query', () => {
  it.each([
    limit(),
    limit({}),
    limit({ skip: 0 }),
    limit({ limit: 0 }),
    limit({ skip: 0, limit: 0 }),
  ])('returns empty sql string if skip & limit are not provided', (query) => {
    expect(query.sql).toBe('')
    expect(query.values).toEqual([])
  })
  it.each([
    [limit({ skip: 5 }), { sql: 'LIMIT ?', values: [5] }],
    [limit({ skip: 5, limit: 20 }), { sql: 'LIMIT ?, ?', values: [5, 20] }],
    [limit({ limit: 20 }), { sql: 'LIMIT ?, ?', values: [0, 20] }],
  ])('returns correct sql query', (query, result) => {
    expect(query.sql).toBe(result.sql)
    expect(query.values).toEqual(result.values)
  })
})

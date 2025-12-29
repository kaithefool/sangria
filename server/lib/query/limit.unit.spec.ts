import { describe, expect, it } from '@jest/globals'
import { limit } from './limit'

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
    [limit({ skip: 5 }), 'LIMIT 5'],
    [limit({ skip: 5, limit: 20 }), 'LIMIT 5, 20'],
    [limit({ limit: 20 }), 'LIMIT 0, 20'],
  ])('returns correct sql query', (query, result) => {
    expect(query.sql).toBe(result)
  })
})

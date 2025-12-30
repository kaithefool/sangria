import { describe, it, expect } from '@jest/globals'
import { orderBy } from './orderBy'

describe('orderBy query', () => {
  it.each([
    orderBy(),
    orderBy({}),
  ])('returns empty sql if order is not provided', (query) => {
    expect(query.sql).toBe('')
    expect(query.values).toEqual([])
  })
  it.each([
    [orderBy({ a: 1 }), 'ORDER BY "a" ASC'],
    [orderBy({ a: -1 }), 'ORDER BY "a" DESC'],
    [orderBy({ a: 1, b: 1 }), 'ORDER BY "a" ASC, "b" ASC'],
    [orderBy({ a: 1, b: -1 }), 'ORDER BY "a" ASC, "b" DESC'],
  ])('returns correct ORDER BY sql', (query, result) => {
    expect(query.sql).toBe(result)
    expect(query.values).toEqual([])
  })
})

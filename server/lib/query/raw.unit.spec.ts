import { describe, it, expect } from '@jest/globals'
import { raw } from './raw'
import SqlQuery from './SqlQuery'

describe('raw Query builder', () => {
  it('returns SqlQuery instance with sql string provided', () => {
    const sql = 'SELECT * FROM a;'
    const query = raw(sql)
    expect(query instanceof SqlQuery).toBe(true)
    expect(query.sql).toBe(sql)
    expect(query.values).toEqual([])
  })
})

import { describe, expect, it } from '@jest/globals'
import q from './q.ts'

describe('query', () => {
  it.each([
    q``,
    q`SELECT * FROM users;`,
    q`SELECT ${'id'}, ${'role'} FROM users;`,
    q`SELECT ${'id'} FROM users ${q`WHERE role = ${'admin'}`};`,
    q`SELECT ${'id'} FROM users a ${q`WHERE ${q`a.${'role'}`} = ${'admin'}`};`,
  ])('returns SqlQuery instance', (query) => {
    expect(typeof query).toBe('object')
    const { sql, values } = query
    expect(typeof sql).toBe('string')
    expect(Array.isArray(values)).toBe(true)
  })
  it.each([
    [q``, []],
    [q`SELECT * FROM users;`, []],
    [q`SELECT ${'id'}, ${'role'} FROM users;`, ['id', 'role']],
    [
      q`SELECT ${'id'} FROM users ${q`WHERE role = ${'admin'}`};`,
      ['id', 'admin'],
    ],
    [
      q`SELECT ${'id'} FROM urs a ${q`WHERE ${q`a.${'role'}`} = ${'admin'}`};`,
      ['id', 'role', 'admin'],
    ],
  ])('returns values in the correct sequence', (query, values) => {
    expect(query.values).toEqual(values)
  })
  it.each([
    [q``, ''],
    [q`SELECT * FROM users;`, 'SELECT * FROM users;'],
    [q`SELECT ${'id'}, ${'role'} FROM users;`, 'SELECT ?, ? FROM users;'],
    [
      q`SELECT ${'id'} FROM users ${q`WHERE role = ${'admin'}`};`,
      'SELECT ? FROM users WHERE role = ?;',
    ],
    [
      q`SELECT ${'id'} FROM urs a ${q`WHERE ${q`a.${'role'}`} = ${'admin'}`};`,
      'SELECT ? FROM urs a WHERE a.? = ?;',
    ],
  ])('return query with question marks', (query, sql) => {
    expect(query.sql).toEqual(sql)
  })
})

import { describe, it, expect } from 'vitest'
import { get, set } from './dotPath.ts'

describe('dotPath get func', () => {
  it('parses paths with any depth', () => {
    const src = { a: 3, b: { a: 4, c: { a: 5 } } }
    expect(get(src, 'a')).toBe(3)
    expect(get(src, 'b.a')).toBe(4)
    expect(get(src, 'b.c.a')).toBe(5)
    expect(get(src, 'b')).toEqual(src.b)
    expect(get(src, 'b.c')).toEqual(src.b.c)
  })
  it('returns undefined if the path given does not exists', () => {
    const src = { a: 3, b: { a: 4, c: { a: 5 } } }
    expect(get(src, 'c')).toBe(undefined)
    expect(get(src, 'b.b')).toBe(undefined)
    expect(get(src, 'b.c.b')).toBe(undefined)
  })
  it("returns undefined if the src doesn't have any properties", () => {
    expect(get(undefined, 'a')).toBe(undefined)
    expect(get(null, 'a')).toBe(undefined)
    expect(get('a', 'a')).toBe(undefined)
    expect(get(3, 'a')).toBe(undefined)
    expect(get(true, 'a')).toBe(undefined)
    expect(get(Symbol('a'), 'a')).toBe(undefined)
    expect(get({ a: undefined }, 'a.b')).toBe(undefined)
    expect(get({ a: null }, 'a.b')).toBe(undefined)
    expect(get({ a: 'a' }, 'a.b')).toBe(undefined)
    expect(get({ a: 3 }, 'a.b')).toBe(undefined)
    expect(get({ a: true }, 'a.b')).toBe(undefined)
    expect(get({ a: Symbol('a') }, 'a.b')).toBe(undefined)
  })
  it('supports array path', () => {
    const src = { a: [3, { a: 4 }] }
    expect(get(src, 'a[0]')).toBe(3)
    expect(get(src, 'a.0')).toBe(3)
    expect(get(src, 'a[1].a')).toBe(4)
    expect(get(src, 'a.1.a')).toBe(4)
    expect(get(src, 'a[1].a.b')).toBe(undefined)
    expect(get(src, 'a.1.a.b')).toBe(undefined)
  })
  it('throws error for invalid path', () => {
    const src = { a: { 0: {}, b: { c: 3 } } }
    expect(() => get(src, '')).toThrow()
    expect(() => get(src, '.a')).toThrow()
    expect(() => get(src, '[a')).toThrow()
    expect(() => get(src, ']a')).toThrow()
    expect(() => get(src, 'a.')).toThrow()
    expect(() => get(src, 'a[')).toThrow()
    expect(() => get(src, 'a]')).toThrow()
    expect(() => get(src, 'a.[0]')).toThrow()
    expect(() => get(src, 'a[0].')).toThrow()
    expect(() => get(src, 'a[0')).toThrow()
    expect(() => get(src, 'a0]')).toThrow()
    expect(() => get(src, 'a[a.0]')).toThrow()
    expect(() => get(src, 'a[[0]]k')).toThrow()
    expect(() => get(src, 'a[0]b')).toThrow()
  })
})

describe('dotPath set func', () => {})

import { describe, it, expect } from 'vitest'
import { get, set, segmentPath } from './dotPath.ts'

describe('dotPath segmentPath func', () => {
  it('split path segments', () => {
    expect(segmentPath('a').map((s) => s[0])).toMatchObject(['a'])
    expect(segmentPath('a.b').map((s) => s[0])).toMatchObject(['a', '.b'])
    expect(segmentPath('a[0]').map((s) => s[0])).toMatchObject(['a', '[0]'])
    expect(segmentPath('a.b[0].c').map((s) => s[0])).toMatchObject(['a', '.b', '[0]', '.c'])
    expect(segmentPath('a[0][1]').map((s) => s[0])).toMatchObject(['a', '[0]', '[1]'])
  })
  it('extracts dot and bracket path and key', () => {
    expect(segmentPath('a').map((s) => s.slice(0, 3))).toMatchObject([['a', 'a', undefined]])
    expect(segmentPath('a.b').map((s) => s.slice(0, 3))).toMatchObject([
      ['a', 'a', undefined],
      ['.b', 'b', undefined],
    ])
    expect(segmentPath('a[0]').map((s) => s.slice(0, 3))).toMatchObject([
      ['a', 'a', undefined],
      ['[0]', undefined, '0'],
    ])
    expect(segmentPath('a.b[0].c').map((s) => s.slice(0, 3))).toMatchObject([
      ['a', 'a', undefined],
      ['.b', 'b', undefined],
      ['[0]', undefined, '0'],
      ['.c', 'c', undefined],
    ])
  })
  it('throws error for invalid path', () => {
    expect(() => segmentPath('')).toThrow()
    expect(() => segmentPath('.a')).toThrow()
    expect(() => segmentPath('[a')).toThrow()
    expect(() => segmentPath(']a')).toThrow()
    expect(() => segmentPath('a.')).toThrow()
    expect(() => segmentPath('a[')).toThrow()
    expect(() => segmentPath('a]')).toThrow()
    expect(() => segmentPath('a.[0]')).toThrow()
    expect(() => segmentPath('a[0].')).toThrow()
    expect(() => segmentPath('a[0')).toThrow()
    expect(() => segmentPath('a0]')).toThrow()
    expect(() => segmentPath('a[a.0]')).toThrow()
    expect(() => segmentPath('a[[0]]k')).toThrow()
    expect(() => segmentPath('a[0]b')).toThrow()
  })
})

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

describe('dotPath set func', () => {
  it('sets values at any depth', () => {
    const src = { a: 1, b: { c: 2 } }
    set(src, 'a', 10)
    expect(src.a).toBe(10)
    set(src, 'b.c', 20)
    expect(src.b.c).toBe(20)
    set(src, 'b.d', 30)
    expect(src.b.d).toBe(30)
  })
  it('creates nested objects when path does not exist', () => {
    const src = {}
    set(src, 'a.b.c', 5)
    expect(src).toEqual({ a: { b: { c: 5 } } })
  })
  it('creates arrays when bracket notation is used', () => {
    const src = {}
    set(src, 'a[0]', 1)
    expect(src).toEqual({ a: [1] })
    set(src, 'a[1]', 2)
    expect(src.a).toEqual([1, 2])
  })
  it('creates mixed object and array paths', () => {
    const src = {}
    set(src, 'a[0].b.c', 10)
    expect(src).toEqual({ a: [{ b: { c: 10 } }] })
  })
  it('overwrites existing values', () => {
    const src = { a: { b: 1 } }
    set(src, 'a.b', 2)
    expect(src.a.b).toBe(2)
  })
  it('throws error when trying to set on primitive types', () => {
    const src = { a: 'string' }
    expect(() => set(src, 'a.b', 1)).toThrow()
  })
  it('throws error with invalid paths', () => {
    const src = {}
    expect(() => set(src, '', 1)).toThrow()
    expect(() => set(src, '.a', 1)).toThrow()
    expect(() => set(src, 'a.', 1)).toThrow()
  })
})

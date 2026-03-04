import { describe, it, expect } from 'vitest'
import { noCase, titleCase } from './utils.ts'

describe('noCase func', () => {
  it('split words from camel cased & pascal cased string', () => {
    expect(noCase('fooBarBaz')).toEqual(['foo', 'bar', 'baz'])
    expect(noCase('FooBarBaz')).toEqual(['foo', 'bar', 'baz'])
    expect(noCase('Foo')).toEqual(['foo'])
  })
  it('split words by separators from snake, kebab, dot, etc', () => {
    expect(noCase('foo_bar_baz')).toEqual(['foo', 'bar', 'baz'])
    expect(noCase('foo-bar-baz')).toEqual(['foo', 'bar', 'baz'])
    expect(noCase('foo.bar.baz')).toEqual(['foo', 'bar', 'baz'])
    expect(noCase('foo/bar/baz')).toEqual(['foo', 'bar', 'baz'])
    expect(noCase('foo bar baz')).toEqual(['foo', 'bar', 'baz'])
  })
  it('ignore extra spaces', () => {
    expect(noCase('foo  bar ')).toEqual(['foo', 'bar'])
    expect(noCase(' foo  bar   baz  ')).toEqual(['foo', 'bar', 'baz'])
  })
})

describe('titleCase func', () => {
  it('capitalize all words except prepositions', () => {
    expect(titleCase('fooBarToBaz')).toBe('Foo Bar to Baz')
    expect(titleCase('FooBarToBaz')).toBe('Foo Bar to Baz')
    expect(titleCase('foo_bar_to_baz')).toBe('Foo Bar to Baz')
    expect(titleCase('foo-bar-to-baz')).toBe('Foo Bar to Baz')
    expect(titleCase('foo.bar.to.baz')).toBe('Foo Bar to Baz')
    expect(titleCase('foo/bar/to/baz')).toBe('Foo Bar to Baz')
    expect(titleCase('foo bar to baz')).toBe('Foo Bar to Baz')
    expect(titleCase('foo bar   to  baz')).toBe('Foo Bar to Baz')
    expect(titleCase(' foo   bar to baz ')).toBe('Foo Bar to Baz')
  })
})
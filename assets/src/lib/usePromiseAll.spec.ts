import { describe, it, expect, vi } from 'vitest'
import { usePromiseAll, areSamePromises } from './usePromiseAll'
import { renderHook } from 'vitest-browser-react'

describe('usePromiseAll', () => {
  it('returns a single promise aggregated multiple promises', async () => {
    const p1 = Promise.resolve(1)
    const p2 = Promise.resolve(2)
    const { result } = await renderHook(() => usePromiseAll(p1, p2))
    expect(result.current).toBeInstanceOf(Promise)
    expect(await result.current).toEqual([1, 2])
  })

  it('recreates the promise when one of input promises changed', async () => {
    const p1 = Promise.resolve(1)
    const p2 = Promise.resolve(2)
    const p3 = Promise.resolve(3)
    const { rerender, result } = await renderHook(
      (p) => usePromiseAll(...(p ?? [])),
      { initialProps: [p1, p2] },
    )
    const { current: result1 } = result
    await rerender([p1, p3])
    const { current: result2 } = result

    expect(result1).toBeInstanceOf(Promise)
    expect(await result1).toEqual([1, 2])
    expect(result2).toBeInstanceOf(Promise)
    expect(await result2).toEqual([1, 3])
  })

  it('returns the same promise when input promises remain the same', async () => {
    const p1 = Promise.resolve(1)
    const p2 = Promise.resolve(2)
    const { rerender, result } = await renderHook(
      (p) => usePromiseAll(...(p ?? [])),
      { initialProps: [p1, p2] },
    )
    const { current: result1 } = result
    await rerender([p1, p2])
    const { current: result2 } = result
    expect(result1).toBe(result2)
  })

  it('handles empty promise array', async () => {
    const { result } = await renderHook(() => usePromiseAll())
    expect(await result.current).toEqual([])
  })
})

describe('areSamePromises', () => {
  it('returns false when arrays have different lengths', () => {
    const p1 = Promise.resolve(1)
    const p2 = Promise.resolve(2)
    expect(areSamePromises([p1], [p1, p2])).toBe(false)
  })

  it('returns false when all promises are identical', () => {
    const p1 = Promise.resolve(1)
    const p2 = Promise.resolve(2)
    expect(areSamePromises([p1, p2], [p1, p2])).toBe(true)
  })

  it('returns true when promises differ at any position', () => {
    const p1 = Promise.resolve(1)
    const p2 = Promise.resolve(2)
    const p3 = Promise.resolve(3)
    expect(areSamePromises([p1, p2], [p1, p3])).toBe(false)
  })
})

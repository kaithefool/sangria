import { describe, expect, it } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useEqual } from './useEqual'

describe('useEqual', () => {
  it("passes react's Object.is test if props are equal deeply", async () => {
    const hook = await renderHook((v) => useEqual(v), {
      initialProps: { foo: { bar: 'baz' } },
    })
    const initValue = hook.result.current
    await hook.rerender({ foo: { bar: 'baz' } })
    expect(Object.is(initValue, hook.result.current)).toBe(true)
  })
  it("does not pass react's Object.is test if props aren't equal deeply", async () => {
    const hook = await renderHook((v) => useEqual(v), {
      initialProps: { foo: { bar: 'baz' } },
    })
    const initValue = hook.result.current
    await hook.rerender({ foo: { bar: 'qux' } })
    expect(Object.is(initValue, hook.result.current)).toBe(false)
  })
})

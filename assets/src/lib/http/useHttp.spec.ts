import { describe, it, expect } from 'vitest'
import { renderHook } from 'vitest-browser-react'

import useHttp from './useHttp'

describe('useHttp', () => {
  it('starts with ready status', async () => {
    const { result } = await renderHook(() => useHttp())
    expect(result.current.status).toBe('ready')
  })
})

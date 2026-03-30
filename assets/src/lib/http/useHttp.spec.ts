import { describe, it, expect } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { renderHook } from '@testing-library/react'

import useHttp from './useHttp'

describe('useHttp', () => {
  it('starts with ready status', () => {
    const { result } = renderHook(() => useHttp())
    expect(result.current.status).toBe('ready')
  })
})

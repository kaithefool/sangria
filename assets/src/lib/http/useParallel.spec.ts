import { describe, expect, it } from 'vitest'
import useParallel from './useParallel'

describe('useParallel', () => {
  it('provides an abort method', () => {
    const p = useParallel()
    expect(typeof p.abort).toBe('function')
  })
})

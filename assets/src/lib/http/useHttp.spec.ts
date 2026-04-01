import { describe, it, expect } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { setupWorker } from 'msw/browser'
import { http as handler, HttpResponse } from 'msw'
import useHttp from './useHttp'

const worker = setupWorker(
  handler.get('http://mo.ck', () => {
    return HttpResponse.json({ foo: 'bar' })
  }),
)

describe('useHttp', () => {
  it('starts with ready status', async () => {
    const { result } = await renderHook(() => useHttp())
    expect(result.current.status).toBe('ready')
  })
  it.skip('handles success api call', async () => {
    const { result, act } = await renderHook(() =>
      useHttp({
        url: 'http://mo.ck',
      }),
    )
    expect(result.current.status).toBe('pending')
  })
})

import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { setupWorker } from 'msw/browser'
import { http as handler, HttpResponse } from 'msw'
import { useHttp } from './useHttp'
import { isCancel } from 'axios'
import useParallel from './useParallel'

const worker = setupWorker(
  handler.get('http://mo.ck/foo', () => {
    return HttpResponse.json({ foo: 'bar' })
  }),
  handler.get('http://mo.ck/bax', () => {
    return HttpResponse.json({ bax: 'qux' })
  }),
  handler.get('http://mo.ck/not-found', () => {
    return HttpResponse.text('', { status: 404 })
  }),
)

beforeAll(() => worker.start({ onUnhandledRequest: 'error', quiet: true }))
afterAll(() => worker.stop())
afterEach(() => worker.resetHandlers())

describe('useParallel', () => {
  it('provides an abort method', async () => {
    const { result, rerender } = await renderHook(() =>
      useParallel(
        useHttp({ url: 'http://mo.ck/foo' }),
        useHttp({ url: 'http://mo.ck/bax' }),
      ),
    )
    expect(typeof result.current.abort).toBe('function')
    try {
      result.current.abort()
      await result.current.promise
    } catch (error) {
      expect(isCancel(error)).toBe(true)
      await rerender()
      expect(result.current).toMatchObject({
        status: 'error',
        errors: [{ message: 'aborted' }, { message: 'aborted' }],
      })
    }
  })
  it('provides a refresh method', () => {})
})

import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { setupWorker } from 'msw/browser'
import { delay, http as handler, HttpResponse } from 'msw'
import useHttp from './useHttp'
import { isCancel } from 'axios'

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
  handler.get('http://mo.ck/delay', async () => {
    await delay(1000)
    return HttpResponse.text('', { status: 404 })
  }),
)

beforeAll(() => worker.start({ onUnhandledRequest: 'error', quiet: true }))
afterAll(() => worker.stop())
afterEach(() => worker.resetHandlers())

describe('useHttp', () => {
  it('starts with ready status', async () => {
    const { result } = await renderHook(() => useHttp())
    expect(result.current.status).toBe('ready')
  })
  it('handles success api call', async () => {
    const { result, rerender } = await renderHook(() =>
      useHttp({ url: 'http://mo.ck/foo' }),
    )
    expect(result.current.status).toBe('pending')
    await result.current.promise
    await rerender()
    expect(result.current).toMatchObject({
      status: 'success',
      code: 200,
      payload: { foo: 'bar' },
      fetched: { foo: 'bar' },
      progress: 1,
    })
  })
  it('refetch after config changed', async () => {
    const initialProps = { url: 'http://mo.ck/foo' }
    const nextProps = { url: 'http://mo.ck/bax' }
    const { result, rerender } = await renderHook((c) => useHttp(c), {
      initialProps,
    })
    expect(result.current.status).toBe('pending')
    await result.current.promise
    await rerender(initialProps)
    expect(result.current).toMatchObject({
      status: 'success',
      code: 200,
      payload: { foo: 'bar' },
      fetched: { foo: 'bar' },
      progress: 1,
    })
    await rerender(nextProps)
    expect(result.current.status).toBe('pending')
    await result.current.promise
    await rerender(nextProps)
    expect(result.current).toMatchObject({
      status: 'success',
      code: 200,
      payload: { bax: 'qux' },
      fetched: { bax: 'qux' },
      progress: 1,
    })
  })
  it('handles api errors', async () => {
    expect.assertions(2)
    const { result, rerender } = await renderHook(() =>
      useHttp({ url: 'http://mo.ck/not-found' }),
    )
    expect(result.current.status).toBe('pending')
    try {
      await result.current.promise
    } catch (error) {
      await rerender()
      expect(result.current).toMatchObject({
        status: 'error',
        code: 404,
        payload: '',
        error: { message: 'Not Found' },
      })
    }
  })
  it('provides a abort method', async () => {
    expect.assertions(2)
    const { result, rerender } = await renderHook(() =>
      useHttp({ url: 'http://mo.ck/foo' }),
    )
    expect(result.current.status).toBe('pending')
    try {
      result.current.abort()
      await result.current.promise
    } catch (error) {
      await rerender()
      expect(result.current).toMatchObject({
        status: 'error',
        error: { message: 'aborted' },
      })
    }
  })
  it('aborts request when unmount', async () => {
    expect.assertions(2)
    const { result, unmount } = await renderHook(() =>
      useHttp({ url: 'http://mo.ck/foo' }),
    )
    expect(result.current.status).toBe('pending')
    try {
      unmount()
      await result.current.promise
    } catch (error) {
      expect(isCancel(error)).toBe(true)
    }
  })
  it.todo('aborts previous request when config changed', async () => {
    expect.assertions(2)
    const { result, rerender } = await renderHook((c) => useHttp(c), {
      initialProps: { url: 'http://mo.ck/delay' },
    })
    const { promise } = result.current
    expect(result.current.status).toBe('pending')
    try {
      rerender({ url: 'http://mo.ck/foo' })
      await promise
    } catch (error) {
      console.log(error)
      expect(isCancel(error)).toBe(true)
    }
  })
  it('provides a refresh method', async () => {
    const successState = {
      status: 'success',
      code: 200,
      payload: { foo: 'bar' },
      fetched: { foo: 'bar' },
      progress: 1,
    }
    const { result, rerender } = await renderHook(() =>
      useHttp({ url: 'http://mo.ck/foo' }),
    )
    expect(result.current.status).toBe('pending')
    await result.current.promise
    await rerender()
    expect(result.current).toMatchObject(successState)
    result.current.refresh()
    await rerender()
    expect(result.current.status).toBe('pending')
    await result.current.promise
    await rerender()
    expect(result.current).toMatchObject(successState)
  })
  it('can request with the same config', async () => {
    const successState = {
      status: 'success',
      code: 200,
      payload: { foo: 'bar' },
      fetched: { foo: 'bar' },
      progress: 1,
    }
    const config = { url: 'http://mo.ck/foo' }
    const { result, rerender } = await renderHook(() => useHttp(config))
    expect(result.current.status).toBe('pending')
    await result.current.promise
    await rerender()
    expect(result.current).toMatchObject(successState)
    result.current.request(config)
    await rerender()
    expect(result.current.status).toBe('pending')
    await result.current.promise
    await rerender()
    expect(result.current).toMatchObject(successState)
  })
})

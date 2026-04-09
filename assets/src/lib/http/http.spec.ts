import {
  describe,
  it,
  expect,
  beforeEach,
  beforeAll,
  afterAll,
  afterEach,
} from 'vitest'
import { setupWorker } from 'msw/browser'
import { http as handler, HttpResponse, delay } from 'msw'
import { http, type HttpState } from './http'

const worker = setupWorker(
  handler.get('http://mo.ck', () => {
    return HttpResponse.json({
      foo: 'bar',
    })
  }),
  handler.get('http://mo.ck/delay', async () => {
    await delay(100)
    return HttpResponse.text('')
  }),
  handler.get('http://mo.ck/not-found', () => {
    return HttpResponse.text('', { status: 404 })
  }),
  handler.get('http://mo.ck/unresponsed', () => {}),
)

beforeAll(() => worker.start({ onUnhandledRequest: 'error', quiet: true }))
afterAll(() => worker.stop())
afterEach(() => worker.resetHandlers())

describe('http', () => {
  let states: HttpState[] = []
  beforeEach(() => {
    states = []
  })

  it('calls callback with success state & returns resolved promise', async () => {
    const p = http({ url: 'http://mo.ck' }, (s) => states.push(s))
    expect(await p).toMatchObject({ status: 200, data: { foo: 'bar' } })
    expect(states.length).toBe(2)
    expect(states[0]).toMatchObject({ status: 'pending' })
    expect(states[1]).toMatchObject({
      status: 'success',
      code: 200,
      progress: 1,
      payload: { foo: 'bar' },
    })
  })
  it('aborts http request', async () => {
    expect.assertions(3)
    const p = http({ url: 'http://mo.ck' }, (s) => states.push(s))
    p.abort()

    try {
      await p
    } catch (err) {
      expect(states.length).toBe(2)
      expect(states[0]).toMatchObject({ status: 'pending' })
      expect(states[1]).toMatchObject({
        status: 'error',
        error: { message: 'aborted' },
      })
    }
  })
  it('handles timeout error', async () => {
    expect.assertions(3)
    try {
      await http({ url: 'http://mo.ck/delay', timeout: 1 }, (s) =>
        states.push(s),
      )
    } catch (err) {
      expect(states.length).toBe(2)
      expect(states[0]).toMatchObject({ status: 'pending' })
      expect(states[1]).toMatchObject({
        status: 'error',
        error: { message: 'timeout' },
      })
    }
  })
  it('handles network error', async () => {
    expect.assertions(3)
    try {
      await http({ url: 'http://mo.ck/unresponsed' }, (s) => states.push(s))
    } catch (err) {
      expect(states.length).toBe(2)
      expect(states[0]).toMatchObject({ status: 'pending' })
      expect(states[1]).toMatchObject({
        status: 'error',
        error: { message: 'network' },
      })
    }
  })
  it('handles error response', async () => {
    expect.assertions(3)
    try {
      await http({ url: 'http://mo.ck/not-found' }, (s) => states.push(s))
    } catch (err) {
      expect(states.length).toBe(2)
      expect(states[0]).toMatchObject({ status: 'pending' })
      expect(states[1]).toMatchObject({
        status: 'error',
        code: 404,
        error: { message: 'Not Found' },
      })
    }
  })
})

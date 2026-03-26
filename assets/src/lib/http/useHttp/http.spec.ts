import {
  describe,
  it,
  expect,
  beforeEach,
  beforeAll,
  afterAll,
  afterEach,
} from 'vitest'
import { setupServer } from 'msw/node'
import { http as mswHttp, HttpResponse, delay } from 'msw'
import { http, HttpState } from './http'

const server = setupServer(
  mswHttp.get('http://mock.com', () => {
    return HttpResponse.json({
      foo: 'bar',
    })
  }),
)

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterAll(() => server.close())
afterEach(() => server.resetHandlers())

describe('http', () => {
  let states: HttpState[] = []
  beforeEach(() => {
    states = []
  })

  it('calls callback with success state & returns resolved promise', async () => {
    const p = http({ url: 'http://mock.com' }, (s) => states.push(s))
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
    const p = http({ url: 'http://mock.com' }, (s) => states.push(s))
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
    server.use(
      mswHttp.get('http://mock.com/timeout', async () => {
        await delay(1000)
        return HttpResponse.text('')
      }),
    )
    try {
      await http({ url: 'http://mock.com/timeout', timeout: 1 }, (s) =>
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
  it('handles error response', async () => {
    expect.assertions(3)
    server.use(
      mswHttp.get('http://mock.com/not-found', () => {
        return HttpResponse.text('', { status: 404 })
      }),
    )
    try {
      await http({ url: 'http://mock.com/not-found' }, (s) => states.push(s))
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

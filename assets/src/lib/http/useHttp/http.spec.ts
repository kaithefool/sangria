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
import { http as mswHttp, HttpResponse } from 'msw'
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

  it('returns promise resolved', async () => {
    const p = http({ url: 'http://mock.com' })
    expect(typeof p.then).toBe('function')
    expect(await p).toMatchObject({ status: 200, data: { foo: 'bar' } })
  })
  it('calls callback with success state', async () => {
    await http({ url: 'http://mock.com' }, (s) => states.push(s))
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
})

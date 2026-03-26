import { describe, it, expect, beforeEach } from '@jest/globals'
import { http, HttpState } from './http'

describe('http', () => {
  let states: HttpState[] = []
  beforeEach(() => {
    states = []
  })

  it('aborts http request', async () => {
    expect.assertions(3)
    const p = http({ url: 'http://localhost:3000' }, (s) => states.push(s))
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

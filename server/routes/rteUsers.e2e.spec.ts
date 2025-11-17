import { describe, expect, it } from '@jest/globals'
import request from 'superagent'

const base = 'http://localhost:3000/api/users'

describe('Users REST API routes', () => {
  let userId: string

  it('provides a GET list route', async () => {
    const res = await request.get(base)
    expect(res.status).toBe(200)
    expect(res.headers['content-type']).toMatch(/application\/json/)
    expect(Array.isArray(res.body.rows)).toBe(true)
    expect(typeof res.body.total).toBe('number')
  })
  it.skip('provides a POST create route', async () => {
    const res = await request
      .post(base)
      .send({
        role: 'admin',
        email: 'foo@bar.co',
        password: '12345678',
      })
    expect(res.status).toBe(200)
    expect(res.headers['content-type']).toMatch(/application\/json/)
    expect(typeof res.body?.[0]?._id).toBe('string')
    userId = res.body[0]._id
  })
  it.skip('provides a DELETE delete route', async () => {
    const res = await request
      .post(`${base}/${userId}`)
      .send({
        role: 'admin',
        email: 'foo@bar.com',
        password: '12345678',
      })
    expect(res.status).toBe(200)
  })
})

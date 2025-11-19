import { describe, expect, it } from '@jest/globals'
import request, { ResponseError } from 'superagent'
import { apiRoot } from '../jest-setup'

const base = `${apiRoot}/api/users`

describe('Users REST API routes', () => {
  let userId: string
  const testUser = {
    role: 'admin',
    email: 'foo@bar.com',
    password: '12345678',
  }

  it('provides a POST create route', async () => {
    const res = await request
      .post(base)
      .send(testUser)
    expect(res.status).toBe(200)
    expect(res.headers['content-type']).toMatch(/application\/json/)
    expect(typeof res.body?._id).toBe('string')
    userId = res.body._id
  })
  it('enforces unique email', async () => {
    expect.assertions(1)
    try {
      await request
        .post(base)
        .send(testUser)
    }
    catch (e) {
      const err = e as ResponseError
      expect(err.status).toBe(400)
    }
  })
  it('provides a GET list route', async () => {
    const res = await request.get(base)
    expect(res.status).toBe(200)
    expect(res.headers['content-type']).toMatch(/application\/json/)
    expect(Array.isArray(res.body.rows)).toBe(true)
    expect(typeof res.body.total).toBe('number')
  })
  it('provides a GET find by id route', async () => {
    expect(userId).not.toBeUndefined()
    const res = await request
      .get(`${base}/${userId}`)
    expect(res.status).toBe(200)
    expect(res.headers['content-type']).toMatch(/application\/json/)
    expect(res.body).toMatchObject({
      _id: userId,
      email: testUser.email,
      role: testUser.role,
    })
  })
  it('hides the password field', async () => {
    expect(userId).not.toBeUndefined()
    const res = await request
      .get(`${base}/${userId}`)
    expect(res.status).toBe(200)
    expect(res.body.password).toBeUndefined()
  })
  it('provides a DELETE delete route', async () => {
    expect(userId).not.toBeUndefined()
    const res = await request
      .delete(`${base}/${userId}`)
    expect(res.status).toBe(200)
  })
})

import { describe, expect, it } from '@jest/globals'
import request from 'superagent'
import { apiRoot } from '../jest-setup'

const base = `${apiRoot}/api/users`

describe('Users REST API routes', () => {
  let userId: string
  let dupUserId: string
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
  it('enforces unique email in create route', async () => {
    expect(
      request
        .post(base)
        .send(testUser),
    ).rejects.toMatchObject({ status: 400 })
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
  it('provides a PATCH patch route', async () => {
    expect(userId).not.toBeUndefined()
    const patchRes = await request
      .patch(`${base}/${userId}`)
      .send({ role: 'client' })
    expect(patchRes.status).toBe(200)
    const getRes = await request
      .get(`${base}/${userId}`)
    expect(getRes.status).toBe(200)
    expect(getRes.body).toMatchObject({
      role: 'client',
    })
  })
  it('enforces unique email in patch route', async () => {
    expect(userId).not.toBeUndefined()
    const createRes = await request
      .post(base)
      .send({ ...testUser, email: 'foo@baz.com' })
    expect(createRes.status).toBe(200)
    dupUserId = createRes.body._id
    expect(
      request
        .patch(`${base}/${userId}`)
        .send({ email: 'foo@baz.com' }),
    ).rejects.toMatchObject({ status: 400 })
  })
  it('provides a DELETE delete route', async () => {
    expect(userId).not.toBeUndefined()
    expect(dupUserId).not.toBeUndefined()
    const res0 = await request
      .delete(`${base}/${userId}`)
    expect(res0.status).toBe(200)
    const res1 = await request
      .delete(`${base}/${dupUserId}`)
    expect(res1.status).toBe(200)
  })
})

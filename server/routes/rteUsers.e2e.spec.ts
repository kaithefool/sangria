import { afterEach, beforeAll, describe, expect, it } from '@jest/globals'
import request, { ResponseError } from 'superagent'
import { apiRoot } from '../test-helper'

const base = `${apiRoot}/api/users`

describe('Users REST API routes', () => {
  let userIds: string[] = []
  const testUser = {
    role: 'admin',
    email: 'foo@bar.com',
    password: '12345678',
  }
  beforeAll(async () => {
    const { headers } = await request.options(`${base}`)
  })
  afterEach(async () => {
    await Promise.all(userIds.map(_id => (
      request.delete(`${base}/${_id}`)
    )))
    userIds = []
  })

  it('provides a POST create route', async () => {
    const res = await request.post(base).send(testUser)
    expect(res.status).toBe(200)
    expect(res.headers['content-type']).toMatch(/application\/json/)
    expect(typeof res.body?._id).toBe('string')
    userIds.push(res.body._id)
  })
  it('enforces unique email in create route', async () => {
    expect.assertions(1)
    const res0 = await request.post(base).send(testUser)
    userIds.push(res0?.body?._id)
    try {
      const res1 = await request.post(base).send(testUser)
      userIds.push(res1?.body?._id)
    }
    catch (err) {
      const e = err as ResponseError
      expect(e.status).toBe(400)
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
    const res0 = await request.post(base).send(testUser)
    userIds.push(res0?.body?._id)
    const res1 = await request.get(`${base}/${res0?.body?._id}`)
    expect(res1.status).toBe(200)
    expect(res1.headers['content-type']).toMatch(/application\/json/)
    expect(res1.body).toMatchObject({
      _id: res0?.body?._id,
      email: testUser.email,
      role: testUser.role,
    })
  })
  // it('hides the password field', async () => {
  //   expect(userId).not.toBeUndefined()
  //   const res = await request
  //     .get(`${base}/${userId}`)
  //   expect(res.status).toBe(200)
  //   expect(res.body.password).toBeUndefined()
  // })
  // it('provides a PATCH patch route', async () => {
  //   expect(userId).not.toBeUndefined()
  //   const patchRes = await request
  //     .patch(`${base}/${userId}`)
  //     .send({ role: 'client' })
  //   expect(patchRes.status).toBe(200)
  //   const getRes = await request
  //     .get(`${base}/${userId}`)
  //   expect(getRes.status).toBe(200)
  //   expect(getRes.body).toMatchObject({
  //     role: 'client',
  //   })
  // })
  // it('enforces unique email in patch route', async () => {
  //   expect(userId).not.toBeUndefined()
  //   const createRes = await request
  //     .post(base)
  //     .send({ ...testUser, email: 'foo@baz.com' })
  //   expect(createRes.status).toBe(200)
  //   dupUserId = createRes.body._id
  //   expect(
  //     request
  //       .patch(`${base}/${userId}`)
  //       .send({ email: 'foo@baz.com' }),
  //   ).rejects.toMatchObject({ status: 400 })
  // })
  // it('provides a DELETE delete route', async () => {
  //   expect(userId).not.toBeUndefined()
  //   expect(dupUserId).not.toBeUndefined()
  //   const res0 = await request
  //     .delete(`${base}/${userId}`)
  //   expect(res0.status).toBe(200)
  //   const res1 = await request
  //     .delete(`${base}/${dupUserId}`)
  //   expect(res1.status).toBe(200)
  // })
})

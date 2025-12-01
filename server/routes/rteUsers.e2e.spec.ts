import { afterEach, beforeAll, describe, expect, it } from '@jest/globals'
import request, { ResponseError } from 'superagent'
import { apiRoot, expectErr, expectOkCreate, expectOkList } from '../test-helper'

const base = `${apiRoot}/api/users`

describe('Users REST API routes', () => {
  const testUser = {
    role: 'admin',
    email: 'foo@bar.com',
    password: '12345678',
  }
  beforeAll(async () => {
    await request.options(`${base}`)
  })

  it('provides a POST create route', async () => {
    await expectOkCreate(
      request.post(base).send(testUser),
    )
  })
  it('enforces unique email in create route', async () => {
    const res = await expectOkCreate(request.post(base).send(testUser))
    await expectErr(request.post(base).send(testUser))
  })
  it.todo('doesn\'t enforce unique index in archive collection')
  it('provides a GET list route', async () => {
    await expectOkList(request.get(base))
  })
  it('provides a GET find by id route', async () => {
    const res0 = await request.post(base).send(testUser)
    const res1 = await request.get(`${base}/${res0?.body?._id}`)
    expect(res1.status).toBe(200)
    expect(res1.headers['content-type']).toMatch(/application\/json/)
    expect(res1.body).toMatchObject({
      _id: res0.body._id,
      email: testUser.email,
      role: testUser.role,
    })
  })
  // it('hides the password field', async () => {
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

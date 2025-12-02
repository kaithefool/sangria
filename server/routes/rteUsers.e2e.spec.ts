import { beforeAll, describe, expect, it } from '@jest/globals'
import request from 'superagent'
import {
  apiRoot, expectErrCreate, expectOkCreate, expectOkList, expectOkFindOne,
  expectOkPatch,
  expectOkDelete,
  expectErr,
} from '../test'

const base = `${apiRoot}/api/users`

describe('Users REST API routes', () => {
  const testUser = {
    role: 'admin',
    email: 'foo@bar.com',
    password: '12345678',
  }
  beforeAll(async () => {
    // check if api server is available
    await request.head(`${base}`)
  })

  it('provides a POST create route', async () => {
    await expectOkCreate(
      request.post(base).send(testUser),
      id => request.delete(`${base}/${id}`),
    )
  })
  it('provides a GET list route', async () => {
    await expectOkList(request.get(base))
  })
  it('provides a GET find by id route', async () => {
    const created = await expectOkCreate(
      request.post(base).send(testUser),
      id => request.delete(`${base}/${id}`),
    )
    const { password, ...rest } = testUser
    const found = await expectOkFindOne(
      request.get(`${base}/${created.body._id}`),
      { _id: created.body._id, ...rest },
    )
    expect(found.body.password).toBeUndefined()
  })
  it('provides a PATCH patch route', async () => {
    const created = await expectOkCreate(
      request.post(base).send(testUser),
      id => request.delete(`${base}/${id}`),
    )
    await expectOkPatch(
      request.patch(`${base}/${created.body?._id}`)
        .send({ role: 'client' }),
    )
    const { password, ...rest } = testUser
    expectOkFindOne(
      request.get(`${base}/${created.body?._id}`),
      { ...rest, role: 'client' },
    )
  })
  it('provides a DELETE delete route', async () => {
    const created = await expectOkCreate(
      request.post(base).send(testUser),
      id => request.delete(`${base}/${id}`),
    )
    await expectOkDelete(
      request.delete(`${base}/${created.body?._id}`),
    )
    await expectErr(
      request.get(`${base}/${created.body?._id}`),
      404,
    )
  })
  it('enforces unique email in create route', async () => {
    await expectOkCreate(
      request.post(base).send(testUser),
      id => request.delete(`${base}/${id}`),
    )
    await expectErrCreate(
      request.post(base).send(testUser),
      400,
      id => request.delete(`${base}/${id}`),
    )
  })

  it.todo('does not enforce unique index in archive collection')
  it.todo('enforces unique email in patch route')
})

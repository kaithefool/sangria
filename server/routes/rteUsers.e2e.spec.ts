import { beforeAll, describe, expect, it } from '@jest/globals'
import request, { Response } from 'superagent'
import {
  apiRoot,
  afterThis,
  expectResCreated,
  expectResList,
  expectResFoundOne,
} from '../test'

const base = `${apiRoot}/api/users`

function teardown(res: Response | undefined) {
  if (typeof res?.body?._id === 'string') {
    afterThis(() => request.delete(`${base}/${res.body._id}`))
  }
}

describe('Users REST API routes', () => {
  beforeAll(async () => {
    // check if api server is available
    await request.head(`${base}`)
  })
  const doc = {
    role: 'admin',
    email: 'foo@bar.com',
  }
  const insert = {
    ...doc, password: '12345678',
  }

  it('provides a POST create route', async () => {
    const res = await request.post(base).send(insert)
    teardown(res)
    expectResCreated(res, doc)
  })
  it('provides a GET list route', async () => {
    const res = await request.get(base)
    expectResList(res)
  })
  it('provides a GET find one by id route', async () => {
    const createdRes = await request.post(base).send(insert)
    teardown(createdRes)
    const foundRes = await request.get(`${base}/${createdRes.body._id}`)
    expectResFoundOne(foundRes, doc)
  })
  it('returns 404 if doc does not exist', async () => {
    expect(request.get(`${base}/000000000000000000000000`))
      .rejects.toMatchObject({ status: 404 })
  })
  it('provides a PATCH patch route', async () => {
    const createdRes = await request.post(base).send(insert)
    teardown(createdRes)
    await request.patch(`${base}/${createdRes.body._id}`)
      .send({ role: 'client' })
    const foundRes = await request.get(`${base}/${createdRes.body._id}`)
    expectResFoundOne(foundRes, { ...doc, role: 'client' })
  })
  it('provides a DELETE delete route', async () => {
    const createdRes = await request.post(base).send(insert)
    teardown(createdRes)
    await request.delete(`${base}/${createdRes.body?._id}`)
    expect(request.get(`${base}/${createdRes.body._id}`))
      .rejects.toMatchObject({ status: 404 })
  })
  it('enforces unique email in create route', async () => {
    const res0 = await request.post(base).send(insert)
    teardown(res0)
    await expect(async () => {
      const res1 = await request.post(base).send(insert)
      teardown(res1)
    }).rejects.toMatchObject({ status: 400 })
  })

  it.todo('does not enforce unique index in archive collection')
  it.todo('enforces unique email in patch route')
})

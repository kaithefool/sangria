import { beforeAll, describe, expect, it } from '@jest/globals'
import request, { Request } from 'superagent'
import {
  apiRoot,
  afterThis,
  expectResCreated,
  expectResList,
  expectResFoundOne,
} from '../test'

const base = `${apiRoot}/api/users`

async function teardown(req: Request) {
  const res = await req
  if (typeof res?.body?._id === 'string') {
    afterThis(() => request.delete(`${base}/${res.body._id}`))
  }
  return res
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
    const res = await teardown(request.post(base).send(insert))
    expectResCreated(res, doc)
  })
  it('provides a GET list route', async () => {
    const res = await request.get(base)
    expectResList(res)
  })
  it('provides a GET find one by id route', async () => {
    const createdRes = await teardown(request.post(base).send(insert))
    const foundRes = await request.get(`${base}/${createdRes.body._id}`)
    expectResFoundOne(foundRes, doc)
  })
  it('returns 404 if doc does not exist', async () => {
    expect(request.get(`${base}/000000000000000000000000`))
      .rejects.toMatchObject({ status: 404 })
  })
  it('provides a PATCH patch route', async () => {
    const createdRes = await teardown(request.post(base).send(insert))
    await request.patch(`${base}/${createdRes.body._id}`)
      .send({ role: 'client' })
    const foundRes = await request.get(`${base}/${createdRes.body._id}`)
    expectResFoundOne(foundRes, { ...doc, role: 'client' })
  })
  it('provides a DELETE delete route', async () => {
    const createdRes = await request.post(base).send(insert)
    await request.delete(`${base}/${createdRes.body?._id}`)
    expect(request.get(`${base}/${createdRes.body._id}`))
      .rejects.toMatchObject({ status: 404 })
  })
  it('enforces unique email in create route', async () => {
    await teardown(request.post(base).send(insert))
    await expect(teardown(request.post(base).send(insert)))
      .rejects.toMatchObject({ status: 400 })
  })
  it('does not enforce unique index in archive collection', async () => {
    const res0 = await request.post(base).send(insert)
    await request.delete(`${base}/${res0.body?._id}`)
    const res1 = await request.post(base).send(insert)
    await request.delete(`${base}/${res1.body?._id}`)
  })
  it('enforces unique email in patch route', async () => {
    await teardown(request.post(base).send(insert))
    const res = await teardown(request.post(base).send({
      ...insert,
      email: 'bax@bar.com',
    }))
    await expect(async () => {
      await request.patch(`${base}/${res.body._id}`)
        .send({ email: insert.email })
    }).rejects.toMatchObject({ status: 400 })
  })
})

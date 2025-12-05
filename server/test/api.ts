import { expect, it } from '@jest/globals'
import request, { Request, Response } from 'superagent'

export const root = process.argv
  .filter(a => a.match(/^--api=/))[0]
  ?.replace('--api=', '')
  ?? 'http://localhost:3000'

export function expectResJson(res: Response) {
  expect(res.headers['content-type']).toMatch(/application\/json/)
}

export function expectResCreated(
  res: Response, expected: Record<string, unknown>,
) {
  expectResJson(res)
  expect(typeof res.body?._id).toBe('string')
  expect(res.body).toMatchObject(expected)
}

export function expectResList(res: Response) {
  expectResJson(res)
  expect(typeof res.body?.total).toBe('number')
  expect(Array.isArray(res.body?.rows)).toBe(true)
}

export function expectResFoundOne(
  res: Response, expected: Record<string, unknown>,
) {
  expectResJson(res)
  expect(typeof res.body?._id).toBe('string')
  expect(res.body).toMatchObject(expected)
}

export interface CreatedTeardownFunc {
  (req: Request): Promise<Response>
}

export function testPost(
  baseUrl: string,
  insert: Record<string, unknown>,
  expected: Record<string, unknown> = insert,
  teardown: CreatedTeardownFunc = r => r,
) {
  it('provides a POST create route', async () => {
    const res = await teardown(request.post(baseUrl).send(insert))
    expectResCreated(res, expected)
  })
}

export function testGetList(baseUrl: string) {
  it('provides a GET list route', async () => {
    const res = await request.get(baseUrl)
    expectResList(res)
  })
}

export function testGetFindOneById(
  baseUrl: string,
  insert: Record<string, unknown>,
  expected: Record<string, unknown> = insert,
  teardown: CreatedTeardownFunc = r => r,
) {
  it('provides a GET find one by id route', async () => {
    const createdRes = await teardown(request.post(baseUrl).send(insert))
    const foundRes = await request.get(`${baseUrl}/${createdRes.body._id}`)
    expectResFoundOne(foundRes, expected)
  })
  it('returns 404 if doc does not exist', async () => {
    expect(request.get(`${baseUrl}/000000000000000000000000`))
      .rejects.toMatchObject({ status: 404 })
  })
}

export function testPatch(
  baseUrl: string,
  insert: Record<string, unknown>,
  update: Record<string, unknown>,
  expected: Record<string, unknown> = { ...insert, ...update },
  teardown: CreatedTeardownFunc = r => r,
) {
  it('provides a PATCH patch route', async () => {
    const createdRes = await teardown(request.post(baseUrl).send(insert))
    await request.patch(`${baseUrl}/${createdRes.body._id}`)
      .send(update)
    const foundRes = await request.get(`${baseUrl}/${createdRes.body._id}`)
    expectResFoundOne(foundRes, expected)
  })
};

export function testDelete(
  baseUrl: string,
  insert: Record<string, unknown>,
) {
  it('provides a DELETE delete route', async () => {
    const createdRes = await request.post(baseUrl).send(insert)
    await request.delete(`${baseUrl}/${createdRes.body._id}`)
    expect(request.get(`${baseUrl}/${createdRes.body._id}`))
      .rejects.toMatchObject({ status: 404 })
  })
}

export function testPostUIdx(
  baseUrl: string,
  insert: Record<string, unknown>,
  teardown: CreatedTeardownFunc = r => r,
) {
  it('enforces unique index in create route', async () => {
    await teardown(request.post(baseUrl).send(insert))
    await expect(teardown(request.post(baseUrl).send(insert)))
      .rejects.toMatchObject({ status: 400 })
  })
  it('does not enforce unique index on soft deleted docs', async () => {
    const res0 = await request.post(baseUrl).send(insert)
    await request.delete(`${baseUrl}/${res0.body?._id}`)
    const res1 = await request.post(baseUrl).send(insert)
    await request.delete(`${baseUrl}/${res1.body?._id}`)
  })
}

export function testPatchUIdx(
  baseUrl: string,
  insert: Record<string, unknown>,
  update: Record<string, unknown>,
  teardown: CreatedTeardownFunc = r => r,
) {
  it('enforces unique index in patch route', async () => {
    await teardown(request.post(baseUrl).send({ ...insert, ...update }))
    const res = await teardown(request.post(baseUrl).send(insert))
    await expect(request.patch(`${baseUrl}/${res.body._id}`).send(update))
      .rejects.toMatchObject({ status: 400 })
  })
}

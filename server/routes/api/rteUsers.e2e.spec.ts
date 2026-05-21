import request from 'superagent'
import { afterAll, describe, expect, it } from 'vitest'
import { apiRoot } from './test.ts'

const baseUrl = `${apiRoot}/users`

describe('Users API', () => {
  const teardown: string[] = []

  afterAll(async () => {
    await Promise.all(teardown.map((id) => request.delete(`${baseUrl}/${id}`)))
  })

  it('GET, POST, PATCH & DELETE', async () => {
    const entry = {
      role: 'admin',
      email: 'foo@bar.com',
    }
    const insert = { ...entry, password: '12345678' }
    const patch = { email: 'foo@bax.com' }

    // POST
    const res0 = await request.post(baseUrl).send(insert)
    expect(res0.status).toBe(200)
    expect(res0.headers['content-type']).toContain('application/json')
    expect(typeof res0.body?.id).toBe('string')
    const { id } = res0.body
    teardown.push(id)

    // GET by id
    const res1 = await request.get(`${baseUrl}/${id}`)
    expect(res1.status).toBe(200)
    expect(res1.headers['content-type']).toContain('application/json')
    expect(res1.body).toMatchObject({ id, ...entry })

    // PATCH
    const res2 = await request.patch(`${baseUrl}/${id}`).send(patch)
    expect(res2.status).toBe(200)
    const res3 = await request.get(`${baseUrl}/${id}`)
    expect(res3.status).toBe(200)
    expect(res3.headers['content-type']).toContain('application/json')
    expect(res3.body).toMatchObject({ id, ...entry, ...patch })

    // DELETE
    const res4 = await request.delete(`${baseUrl}/${id}`)
    expect(res4.status).toBe(200)
    await expect(request.get(`${baseUrl}/${id}`)).rejects.toMatchObject({
      status: 404,
    })
  })

  it('lists with a GET API', async () => {
    const res = await request.get(baseUrl)
    expect(res.status).toBe(200)
    expect(res.headers['content-type']).toContain('application/json')
    const { rows, total } = res.body
    expect(typeof total).toBe('number')
    expect(Array.isArray(rows)).toBe(true)
  })

  it('enforces unique index in the POST API', async () => {
    const insert = {
      role: 'admin',
      email: 'bar@bax.com',
      password: '12345678',
    }

    const res = await request.post(baseUrl).send(insert)
    expect(res.status).toBe(200)
    expect(res.headers['content-type']).toContain('application/json')
    expect(typeof res.body?.id).toBe('string')
    const { id } = res.body
    teardown.push(id)

    await expect(async () => {
      const dup = await request.post(baseUrl).send(insert)
      // teardown in case test failed
      if (typeof dup?.body?.id === 'string') {
        teardown.push(dup.body.id)
      }
    }).rejects.toMatchObject({ status: 400 })
  })

  // it('enforces unique index with a POST API', async () => {
  //   const id = await testCreate()

  //   // teardown in case test failed
  //   const dup: { id?: string } = {}
  //   afterThis(async () => {
  //     return dup?.id && request.delete(`${baseUrl}/${dup.id}`)
  //   })

  //   await expect(async () => {
  //     const res = await request.post(baseUrl).send(insert)
  //     dup.id = res.body?.id
  //   }).rejects.toMatchObject({ status: 400 })
  // })
  // it('enforces unique index with a PATCH API', async () => {
  //   const {
  //     body: { id: id0 },
  //   } = await request.post(baseUrl).send(insert)
  //   expect(typeof id0).toBe('string')
  //   afterThis(() => request.delete(`${baseUrl}/${id0}`))
  //   const {
  //     body: { id: id1 },
  //   } = await request.post(baseUrl).send({ ...insert, ...patch })
  //   expect(typeof id1).toBe('string')
  //   afterThis(() => request.delete(`${baseUrl}/${id1}`))

  //   await expect(
  //     request.patch(`${baseUrl}/${id0}`).send(patch),
  //   ).rejects.toMatchObject({ status: 400 })
  // })
})

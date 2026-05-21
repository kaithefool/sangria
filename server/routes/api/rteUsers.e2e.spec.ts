import { describe, expect, it } from 'vitest'
import { afterEach } from 'node:test'
import request from 'superagent'
import { apiRoot } from './test.ts'

const baseUrl = `${apiRoot}/users`

describe('Users API', () => {
  let teardown: string[] = []
  const entry = {
    role: 'admin',
    email: 'foo@bar.com',
  }
  const insert = { ...entry, password: '12345678' }
  const patch = { email: 'foo@baz.com' }

  afterEach(async () => {
    await Promise.all(teardown.map((id) => request.delete(`${baseUrl}/${id}`)))
    teardown = []
  })

  async function testCreate() {
    const res = await request.post(baseUrl).send(insert)
    expect(res.status).toBe(200)
    expect(res.headers['content-type']).toContain('application/json')
    const { id } = res.body
    expect(typeof id).toBe('string')
    teardown.push(id)
    return id
  }

  it('creates with a POST API', async () => {
    await testCreate()
  })
  it('lists with a GET API', async () => {
    const res = await request.get(baseUrl)
    expect(res.status).toBe(200)
    expect(res.headers['content-type']).toContain('application/json')
    const { rows, total } = res.body
    expect(typeof total).toBe('number')
    expect(Array.isArray(rows)).toBe(true)
  })
  it('finds by id with a GET API', async () => {
    const id = await testCreate()
    const res = await request(`${baseUrl}/${id}`)
    expect(res.status).toBe(200)
    expect(res.headers['content-type']).toContain('application/json')
    expect(res.body).toMatchObject({ id, ...entry })
  })
  it('returns 404 if not found', async () => {
    await expect(
      request(`${baseUrl}/00000000-0000-0000-0000-000000000000`),
    ).rejects.toMatchObject({ status: 404 })
  })
  it('patches with a PATCH API', async () => {
    const id = await testCreate()
    const res = await request.patch(`${baseUrl}/${id}`).send(patch)
    expect(res.status).toBe(200)
    const found = await request.get(`${baseUrl}/${id}`)
    expect(found.status).toBe(200)
    expect(found.body).toMatchObject({ ...entry, ...patch })
  })
  it('deletes with a DELETE API', async () => {
    const id = await testCreate()
    expect(request(`${baseUrl}/${id}`)).resolves.toMatchObject(entry)
    const res = await request.delete(`${baseUrl}/${id}`)
    expect(res.status).toBe(200)
    expect(request(`${baseUrl}/${id}`)).rejects.toMatchObject({ status: 404 })
  })

  it('enforces unique index with a POST API', async () => {
    const id = await testCreate()

    // teardown in case test failed
    const dup: { id?: string } = {}
    afterThis(async () => {
      return dup?.id && request.delete(`${baseUrl}/${dup.id}`)
    })

    await expect(async () => {
      const res = await request.post(baseUrl).send(insert)
      dup.id = res.body?.id
    }).rejects.toMatchObject({ status: 400 })
  })
  it('enforces unique index with a PATCH API', async () => {
    const {
      body: { id: id0 },
    } = await request.post(baseUrl).send(insert)
    expect(typeof id0).toBe('string')
    afterThis(() => request.delete(`${baseUrl}/${id0}`))
    const {
      body: { id: id1 },
    } = await request.post(baseUrl).send({ ...insert, ...patch })
    expect(typeof id1).toBe('string')
    afterThis(() => request.delete(`${baseUrl}/${id1}`))

    await expect(
      request.patch(`${baseUrl}/${id0}`).send(patch),
    ).rejects.toMatchObject({ status: 400 })
  })
})

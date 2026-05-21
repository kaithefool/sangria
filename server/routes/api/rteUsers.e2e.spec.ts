import request from 'superagent'
import { afterAll, describe, expect, it } from 'vitest'
import { apiRoot } from './test.ts'

const baseUrl = `${apiRoot}/users`

describe('Users API', () => {
  const teardown: string[] = []

  afterAll(() =>
    Promise.all(teardown.map((id) => request.delete(`${baseUrl}/${id}`))),
  )

  it('GET, POST, PATCH & DELETE', async () => {
    const entry = {
      role: 'admin',
      email: 'foo@bar.com',
    }
    const insert = { ...entry, password: '12345678' }
    const patch = { email: 'bax@bar.com' }

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
      email: 'foo@bax.com',
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

  it('enforces unique index in the PATCH API', async () => {
    const base = {
      role: 'admin',
      password: '12345678',
    }
    const diff = [{ email: 'foo@qux.com' }, { email: 'bar@qux.com' }]
    const ids: string[] = []

    for (const d of diff) {
      const res = await request.post(baseUrl).send({ ...base, ...d })
      expect(res.status).toBe(200)
      expect(res.headers['content-type']).toContain('application/json')
      expect(typeof res.body?.id).toBe('string')
      teardown.push(res.body.id)
      ids.push(res.body.id)
    }

    await expect(
      request.patch(`${baseUrl}/${ids[1]}`).send(diff[0]),
    ).rejects.toMatchObject({ status: 400 })
  })
})

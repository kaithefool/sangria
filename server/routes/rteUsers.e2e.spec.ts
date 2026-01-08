import { describe, it, expect } from '@jest/globals'
import request from 'superagent'
import { afterThis, api } from '../test'

const base = `${api.root}/api/users`

describe('Users API', () => {
  const expected = {
    role: 'admin',
    email: 'foo@bar.com',
  }
  const insert = { ...expected, password: '12345678' }
  const patch = { email: 'foo@baz.com' }

  it('creates with a POST API', async () => {
    const res = await request.post(base).send(insert)
    expect(res.status).toBe(200)
    expect(res.headers['content-type']).toMatch('application/json')
    const { id } = res.body
    expect(typeof id).toBe('string')
    afterThis(() => request.delete(`${base}/${id}`))
  })
  it('lists with a GET API', async () => {
    const res = await request.get(base)
    expect(res.status).toBe(200)
    expect(res.headers['content-type']).toMatch('application/json')
    const { rows, total } = res.body
    expect(typeof total).toBe('number')
    expect(Array.isArray(rows)).toBe(true)
  })
  it('finds with a GET API', async () => {
    const { body: { id } } = await request.post(base).send(insert)
    expect(typeof id).toBe('string')
    afterThis(() => request.delete(`${base}/${id}`))
    const res = await request(`${base}/${id}`)
    expect(res.status).toBe(200)
    expect(res.body).toMatchObject(expected)
  })
  it('finds by id with a GET API', async () => {
    const { body: { id } } = await request.post(base).send(insert)
    expect(typeof id).toBe('string')
    afterThis(() => request.delete(`${base}/${id}`))
    const res = await request(`${base}/${id}`)
    expect(res.status).toBe(200)
    expect(res.headers['content-type']).toMatch('application/json')
    const { body } = res
    expect(body).toMatchObject({ id, ...expected })
  })
  it('returns 404 if not found', async () => {
    expect(request(`${base}/00000000-0000-0000-0000-000000000000`))
      .rejects.toMatchObject({ status: 404 })
  })
  it('patches with a PATCH API', async () => {
    const { body: { id } } = await request.post(base).send(insert)
    expect(typeof id).toBe('string')
    afterThis(() => request.delete(`${base}/${id}`))
    const res = await request.patch(`${base}/${id}`).send(patch)
    expect(res.status).toBe(200)
    const found = await request.get(`${base}/${id}`)
    expect(found.status).toBe(200)
    expect(found.body).toMatchObject({ ...expected, ...patch })
  })
  it('deletes with a DELETE API', async () => {
    const { body: { id } } = await request.post(base).send(insert)
    expect(typeof id).toBe('string')
    const res = await request.delete(`${base}/${id}`)
    expect(res.status).toBe(200)
    expect(request(`${base}/${id}`)).rejects.toMatchObject({ status: 404 })
  })

  it('enforces unique index with a POST API', async () => {
    const { body: { id } } = await request.post(base).send(insert)
    expect(typeof id).toBe('string')
    afterThis(() => request.delete(`${base}/${id}`))

    // teardown in case test failed
    const dup: { id?: string } = {}
    afterThis(async () => {
      console.log('teardown: ', dup)
      return dup?.id && request.delete(`${base}/${dup.id}`)
    })

    expect(async () => {
      const { body: { id } } = await request.post(base).send({ ...insert, ...patch })
      console.log('duplicated: ', typeof id, id)
      if (typeof id === 'string') dup.id = id
    }).rejects.toMatchObject({ status: 400 })
  })
  it('enforces unique index with a PATCH API', async () => {
    const { body: { id: id0 } } = await request.post(base)
      .send(insert)
    expect(typeof id0).toBe('string')
    afterThis(() => request.delete(`${base}/${id0}`))
    const { body: { id: id1 } } = await request.post(base)
      .send({ ...insert, ...patch })
    expect(typeof id1).toBe('string')
    afterThis(() => request.delete(`${base}/${id1}`))

    expect(request.patch(`${base}/${id0}`).send(patch))
      .rejects.toMatchObject({ status: 400 })
  })
})

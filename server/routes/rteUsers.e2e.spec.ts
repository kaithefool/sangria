import { describe, expect, it } from '@jest/globals'
import request from 'supertest'
import app from '../app'

const base = '/api/users'

describe('Users REST API routes', () => {
  it('provides a GET list route', async () => {
    const res = await request(app).get(base)

    expect(res.status).toBe(200)
    expect(res.headers['Content-Type']).toBe('application/json')
    expect(Array.isArray(res.body.rows)).toBe(true)
    expect(typeof res.body.total).toBe('number')
  })
})

import { describe, expect, it } from '@jest/globals'
import request from 'superagent'
import { api } from '../test'

const root = `${api.root}/api/auth`

describe('Authentication API', () => {
  const testCreds = {
    email: 'foo@bar.com',
    password: 'right-password',
  }
  it('validates user credentials and return Auth JWT token', async () => {
    await api.setupTestUser(testCreds)
    const res = await request.post(`${root}/login`).send(testCreds)
    expect(typeof res.body?.access).toBe('string')
    expect(typeof res.body?.refresh).toBe('string')
  })
  it('rejects invalid user credentials', async () => {
    await api.setupTestUser(testCreds)
    await expect(request.post(`${root}/login`).send({
      email: testCreds.email,
      password: 'wrong-password',
    })).rejects.toMatchObject({ status: 400, message: 'invalid-credentials' })
    await expect(request.post(`${root}/login`).send({
      email: 'wrong@bar.com',
      password: testCreds.password,
    })).rejects.toMatchObject({ status: 400, message: 'invalid-credentials' })
  })
})

import { describe, expect, it } from '@jest/globals'
import request from 'superagent'
import { parseSetCookie, stringifyCookie } from 'cookie'
import { api } from '../test'

const base = `${api.root}/api/auth`

function parseSetAuthCookie(setCookie: string | string[] | undefined) {
  if (setCookie === undefined) {
    return { access: undefined, refresh: undefined }
  }
  const sc = Array.isArray(setCookie) ? setCookie : [setCookie]
  const parsed = sc.map(s => parseSetCookie(s))
  const access = parsed.find(c => c.name === 'access.id')
  const refresh = parsed.find(c => c.name === 'refresh.id')

  return { access, refresh }
}

describe('Authentication API', () => {
  const testCreds = {
    email: 'foo@bar.com',
    password: 'right-password',
  }
  it('validates user credentials and return Auth JWT token', async () => {
    await api.setupTestUser(testCreds)
    const res = await request.post(`${base}/login`).send(testCreds)
    expect(typeof res.body?.access).toBe('string')
    expect(typeof res.body?.refresh).toBe('string')
  })
  it('rejects invalid user credentials', async () => {
    await api.setupTestUser(testCreds)
    await expect(request.post(`${base}/login`).send({
      email: testCreds.email,
      password: 'wrong-password',
    })).rejects.toMatchObject({
      status: 400,
      response: { body: { message: 'invalid-credentials' } },
    })
    await expect(request.post(`${base}/login`).send({
      email: 'wrong@bar.com',
      password: testCreds.password,
    })).rejects.toMatchObject({
      status: 400,
      response: { body: { message: 'invalid-credentials' } },
    })
  })
  it('sets authentication http-only cookies', async () => {
    await api.setupTestUser(testCreds)
    const res = await request.post(`${base}/login`).send({
      ...testCreds, cookies: true,
    })
    const sc = res.headers['set-cookie']
    expect(sc).toBeDefined()
    expect(parseSetAuthCookie(sc)).toMatchObject({
      access: {
        httpOnly: true,
        sameSite: 'strict',
      },
      refresh: {
        httpOnly: true,
        sameSite: 'strict',
      },
    })
  })
  it('refreshes authentication tokens', async () => {
    await api.setupTestUser(testCreds)
    const loginRes = await request.post(`${base}/login`).send(testCreds)
    const refreshRes = await request.post(`${base}/refresh`).send({
      refresh: loginRes.body.refresh,
    })
    expect(typeof refreshRes.body?.access).toBe('string')
    expect(typeof refreshRes.body?.refresh).toBe('string')
  })
  it('refreshes authentication cookies', async () => {
    await api.setupTestUser(testCreds)
    const loginRes = await request.post(`${base}/login`).send({
      ...testCreds, cookies: true,
    })
    const sc = loginRes.headers['set-cookie']
    expect(sc).toBeDefined()
    const { refresh } = parseSetAuthCookie(sc)
    expect(refresh).toBeDefined()
    const pingRes = await request.get(`${base}/ping`)
      .set('Cookie', stringifyCookie({ 'refresh.id': refresh?.value }))
    const newSc = pingRes.headers['set-cookie']
    expect(parseSetAuthCookie(newSc)).toMatchObject({
      access: {
        httpOnly: true,
        sameSite: 'strict',
      },
      refresh: {
        httpOnly: true,
        sameSite: 'strict',
      },
    })
  })
})

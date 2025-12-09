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
  it('authenticates with valid JWT token', async () => {
    await api.setupTestUser(testCreds)
    const loginRes = await request.post(`${base}/login`).send(testCreds)
    const pingRes = await request.get(`${base}/ping`)
      .set('Authorization', `Bearer ${loginRes.body.access}`)
    const { password, ...userAttrs } = testCreds
    expect(pingRes.body).toMatchObject(userAttrs)
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
  it('persists authentication cookies when requested', async () => {
    await api.setupTestUser(testCreds)
    const res = await request.post(`${base}/login`).send({
      ...testCreds, cookies: true, persist: true,
    })
    const sc = res.headers['set-cookie']
    expect(sc).toBeDefined()
    const { access, refresh } = parseSetAuthCookie(sc)
    expect(access?.expires).toBeInstanceOf(Date)
    expect(refresh?.expires).toBeInstanceOf(Date)
  })
  it('authenticates with valid auth cookies', async () => {
    await api.setupTestUser(testCreds)
    const loginRes = await request.post(`${base}/login`).send({
      ...testCreds, cookies: true,
    })
    const sc = loginRes.headers['set-cookie']
    expect(sc).toBeDefined()
    const { access, refresh } = parseSetAuthCookie(sc)
    expect(access).toBeDefined()
    const pingRes = await request.get(`${base}/ping`)
      .set('Cookie', stringifyCookie({
        'access.id': access?.value,
        'refresh.id': refresh?.value,
      }))
    const { password, ...userAttrs } = testCreds
    expect(pingRes.body).toMatchObject(userAttrs)
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
  it('persists refreshed authentication cookies when requested', async () => {
    await api.setupTestUser(testCreds)
    const loginRes = await request.post(`${base}/login`).send({
      ...testCreds, cookies: true, persist: true,
    })
    const sc = loginRes.headers['set-cookie']
    expect(sc).toBeDefined()
    const { refresh } = parseSetAuthCookie(sc)
    expect(refresh).toBeDefined()
    const pingRes = await request.get(`${base}/ping`)
      .set('Cookie', stringifyCookie({ 'refresh.id': refresh?.value }))
    const newSc = pingRes.headers['set-cookie']
    const { access: newAccess, refresh: newRefresh } = parseSetAuthCookie(newSc)
    expect(newAccess?.expires).toBeInstanceOf(Date)
    expect(newRefresh?.expires).toBeInstanceOf(Date)
  })
  it('invalidates refresh token on logout', async () => {
    await api.setupTestUser(testCreds)
    const loginRes = await request.post(`${base}/login`).send(testCreds)
    expect(typeof loginRes.body?.access).toBe('string')
    expect(typeof loginRes.body?.refresh).toBe('string')
    await request.post(`${base}/logout`)
      .set('Authorization', `Bearer ${loginRes.body.access}`)
    await expect(request.post(`${base}/refresh`).send({
      refresh: loginRes.body.refresh,
    })).rejects.toMatchObject({
      status: 400,
      response: { body: { message: 'invalid-token' } },
    })
  })
  it('clears authentication cookies on logout', async () => {
    await api.setupTestUser(testCreds)
    const loginRes = await request.post(`${base}/login`).send({
      ...testCreds, cookies: true,
    })
    const sc = loginRes.headers['set-cookie']
    expect(sc).toBeDefined()
    const { access, refresh } = parseSetAuthCookie(sc)
    expect(access).toBeDefined()
    const logoutRes = await request.post(`${base}/logout`)
      .set('Cookie', stringifyCookie({
        'access.id': access?.value,
        'refresh.id': refresh?.value,
      }))
    const logoutSc = logoutRes.headers['set-cookie']
    expect(parseSetAuthCookie(logoutSc)).toMatchObject({
      access: { expires: expect.any(Date) },
      refresh: { expires: expect.any(Date) },
    })
  })
  it.todo('rejects expired tokens')
})

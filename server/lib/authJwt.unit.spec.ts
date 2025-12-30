import { describe, expect, it } from '@jest/globals'
import {
  signTokens, verifyAccessToken, verifyRefreshToken,
} from './authJwt'
import { roles } from '../consts'

describe('sign & verify tokens', () => {
  const fakeId = '019b6e29-21f5-7491-872a-92cf3c3e4a76'
  const user = {
    id: fakeId,
    role: roles[0],
    email: 'foo@bar.com',
  } as const

  it('signs access & refresh tokens', () => {
    const validTokens = signTokens(user)
    expect(typeof validTokens.access).toBe('string')
    expect(typeof validTokens.refresh).toBe('string')
  })
  it('verifies valid access & refresh tokens', () => {
    const validTokens = signTokens(user)
    const access = verifyAccessToken(validTokens.access)
    const refresh = verifyRefreshToken(validTokens.refresh)
    expect(access).not.toBeNull()
    expect(access?.id).toEqual(fakeId)
    expect(refresh).not.toBeNull()
    expect(refresh?.id).toEqual(fakeId)
  })
  it('invalidate expired tokens', (done) => {
    const expiredTokens = signTokens({
      id: fakeId,
      role: 'admin',
      email: 'foo@bar.com',
    }, false, { accessTtl: '10ms', refreshTtl: '10ms' })

    setTimeout(() => {
      expect(verifyAccessToken(expiredTokens.access)).toBeNull()
      expect(verifyRefreshToken(expiredTokens.refresh)).toBeNull()
      done()
    }, 20)
  })
  it('invalidate tokens signed with wrong secret', () => {
    const secret = 'valid-secret'
    const invalidTokens = signTokens({
      id: fakeId,
      role: 'admin',
      email: 'foo@bar.com',
    }, false, { secret: 'invalid-secret' })

    expect(verifyAccessToken(
      invalidTokens.access, secret,
    )).toBeNull()
    expect(verifyRefreshToken(
      invalidTokens.refresh, secret,
    )).toBeNull()
  })
})

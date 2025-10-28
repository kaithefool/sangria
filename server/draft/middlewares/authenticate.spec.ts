import { describe, expect, it } from '@jest/globals'
import {
  signTokens, verifyAccessToken, verifyRefreshToken,
} from './authenticate'

describe('sign & verify tokens', () => {
  const validTokens = signTokens({
    _id: 'fakeId',
    role: 'admin',
    email: 'user@foobar.com',
  })

  it('signs access & refresh tokens', () => {
    expect(typeof validTokens.access).toBe('string')
    expect(typeof validTokens.refresh).toBe('string')
  })
  it('verifies valid access & refresh tokens', () => {
    expect(verifyAccessToken(validTokens.access)).not.toBeNull()
    expect(verifyRefreshToken(validTokens.refresh)).not.toBeNull()
  })
  it('invalidate expired tokens', (done) => {
    const expiredTokens = signTokens({
      _id: 'fakeId',
      role: 'admin',
      email: 'user@foobar.com',
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
      _id: 'fakeId',
      role: 'admin',
      email: 'user@foobar.com',
    }, false, { secret: 'invalid-secret' })

    expect(verifyAccessToken(
      invalidTokens.access, secret,
    )).toBeNull()
    expect(verifyRefreshToken(
      invalidTokens.refresh, secret,
    )).toBeNull()
  })
})

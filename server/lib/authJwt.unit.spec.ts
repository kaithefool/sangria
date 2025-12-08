import { describe, expect, it } from '@jest/globals'
import {
  signTokens, verifyAccessToken, verifyRefreshToken,
} from './authJwt'
import { Types } from 'mongoose'
import { roles } from '../consts'

describe('sign & verify tokens', () => {
  const fakeId = new Types.ObjectId()
  const user = {
    _id: fakeId,
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
    expect(access?._id).toEqual(fakeId)
    expect(refresh).not.toBeNull()
    expect(refresh?._id).toEqual(fakeId)
  })
  it('invalidate expired tokens', (done) => {
    const expiredTokens = signTokens({
      _id: fakeId,
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
      _id: fakeId,
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

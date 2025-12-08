import { Types } from 'mongoose'
import { findUser, patchUsers } from './servUsers'
import { verifyPwd } from '../lib/crypto'
import { signTokens, toJwtUser, verifyRefreshToken } from '../lib/authJwt'

export type AuthCredentials = {
  email: string
  password: string
}

export async function login(
  cred: AuthCredentials, persist: boolean,
) {
  const user = await findUser({ email: cred.email }, '+password')

  if (!user) return { err: new Error('invalid-credentials') }
  if (!user.active) return { err: new Error('invalid-credentials') }
  if (
    user.password === undefined
    || !verifyPwd(cred.password, user.password)
  ) return { err: new Error('invalid-credentials') }

  return { authTokens: signTokens(user, persist) }
}

export async function logout(userId: Types.ObjectId) {
  await patchUsers({ _id: userId }, { lastLogoutAt: new Date() })
}

export async function refreshTokens(refreshToken: string) {
  const refresh = verifyRefreshToken(refreshToken)
  if (refresh === null) return { err: new Error('invalid-token') }
  const user = await findUser({ _id: refresh._id })
  if (
    !user
    || (
      user.lastLogoutAt
      && refresh.issueAt
      && user.lastLogoutAt > refresh.issueAt
    )
  ) return { err: new Error('invalid-token') }
  return {
    user: toJwtUser(user),
    authTokens: signTokens(user, refresh.persist),
  }
}

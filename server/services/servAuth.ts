import { Types } from 'mongoose'
import { findUser, patchUsers } from './servUsers'
import { verifyPwd } from '../lib/crypto'
import { signTokens } from '../lib/authJwt'

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

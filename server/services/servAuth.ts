import createHttpError from 'http-errors'
import { Types } from 'mongoose'
import { findUser, patchUsers } from './servUsers'
import { verifyPwd } from '../lib/crypto'
import { signTokens } from '../lib/authJwt'

export type AuthCredentials = {
  email: string
  password: string
}

export async function login(cred: AuthCredentials, persist: boolean) {
  console.log(cred)
  const user = await findUser({ email: cred.email }, '+password')
  console.log(user)

  if (!user) throw createHttpError(400, 'invalid-credentials')
  if (!user.active) throw createHttpError(400, 'user-inactive')
  if (
    user.password === undefined
    || !verifyPwd(cred.password, user.password)
  ) throw createHttpError(400, 'invalid-credentials')

  return signTokens(user, persist)
}

export async function logout(userId: Types.ObjectId) {
  await patchUsers({ _id: userId }, { lastLogoutAt: new Date() })
}

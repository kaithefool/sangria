import createHttpError from 'http-errors'
import { findUser } from './servUsers'
import { verifyPwd } from '../lib/crypto'
import { signTokens } from '../lib/authJwt'
import { ObjectId } from 'mongoose'

export type AuthCredentials = {
  email: string
  password: string
}

export async function login(cred: AuthCredentials, persist: boolean) {
  const user = await findUser({ email: cred.email })

  if (!user) throw createHttpError(400, 'invalid-credentials')
  if (!user.active) throw createHttpError(400, 'user-inactive')
  if (
    user.password === undefined
    || !verifyPwd(cred.password, user.password)
  ) throw createHttpError(400, 'invalid-credentials')

  return signTokens(user, persist)
}

export async function logout(userId: ObjectId | string) {

}

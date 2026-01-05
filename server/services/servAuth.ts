import { verifyPwd } from '../lib/crypto'
import { signTokens, toJwtUser, verifyRefreshToken } from '../lib/authJwt'
import { selectUsers, updateUsers } from '../models/mdlUsers'

export type AuthCredentials = {
  email: string
  password: string
}

export function login(
  cred: AuthCredentials, persist: boolean,
) {
  const user = selectUsers(
    { filter: { email: cred.email } }, true,
  )[0]
  if (!user) return { err: new Error('invalid-credentials') }
  if (!user.active) return { err: new Error('invalid-credentials') }
  if (
    user.password === null
    || !verifyPwd(cred.password, user.password)
  ) return { err: new Error('invalid-credentials') }

  return { authTokens: signTokens(user, persist) }
}

export function logout(userId: string) {
  updateUsers({ id: userId }, { last_logout_at: new Date() })
}

export function refreshTokens(refreshToken: string) {
  const refresh = verifyRefreshToken(refreshToken)
  if (refresh === null) return { err: new Error('invalid-token') }
  const user = selectUsers({ filter: { id: refresh.id } })[0]
  if (
    !user
    || (
      user.last_logout_at
      && refresh.issueAt
      && user.last_logout_at > refresh.issueAt
    )
  ) return { err: new Error('invalid-token') }
  return {
    user: toJwtUser(user),
    authTokens: signTokens(user, refresh.persist),
    persist: refresh.persist,
  }
}

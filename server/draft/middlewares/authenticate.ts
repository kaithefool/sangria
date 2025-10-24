import { RequestHandler, Response } from 'express'
import { JwtUser, isJwtUser } from '../services/authToken'

export function getJwtUser(res: Response): JwtUser | undefined {
  const user = res.locals
  return isJwtUser(user) ? user : undefined
}

export const authByHeader: RequestHandler = ({ header }, res, next) => {
  const ah = header('Authorization')
  if (!ah) return next()
  const [, accessToken] = ah.match(/^Bearer (.*?)$/) || []
  if (!accessToken) return next()

  // verify access token
}

export function authenticate() {

}

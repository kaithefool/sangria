import { RequestHandler, Response } from 'express'
import { JwtUser, isJwtUser, verifyAccessToken } from '../services/authToken'
import createHttpError from 'http-errors'

export function getJwtUser(res: Response): JwtUser | undefined {
  const user = res.locals
  return isJwtUser(user) ? user : undefined
}

export const authByHeader: RequestHandler = ({ header }, res, next) => {
  const ah = header('Authorization')
  if (!ah) return next()
  const [, token] = ah.match(/^Bearer (.*?)$/) || []
  if (!token) return next()

  const user = verifyAccessToken(token)
  if (user === null) {
    next(createHttpError(400, 'invalidToken'))
  }
  res.locals.user = user
  next()
}

export const authByCookie: RequestHandler = (req, res, next) => {

}

export function authenticate() {

}

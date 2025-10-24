import { RequestHandler } from 'express'
import createHttpError from 'http-errors'
import { Role } from '../consts'
import { getJwtUser } from './authenticate'

type RoleOpt = Role | 'guest'

export function authorize(
  roles: RoleOpt | RoleOpt[],
): RequestHandler {
  const allow = Array.isArray(roles) ? roles : [roles]

  return (req, res, next) => {
    const user = getJwtUser(res)
    const role = user?.role ?? 'guest'

    if (!allow.includes(role)) {
      next(createHttpError(
        role === 'guest' ? 401 : 403,
      ))
    }

    return next()
  }
}

import { type RequestHandler } from 'express'
import createHttpError from 'http-errors'
import type { Role } from '../consts.ts'
import { getJwtUser } from './authenticate.ts'

type RoleOpt = Role | 'guest'

export function authorize(roles: RoleOpt | RoleOpt[]): RequestHandler {
  const allow = Array.isArray(roles) ? roles : [roles]

  return (_req, res, next) => {
    const user = getJwtUser(res)
    const role = user?.role ?? 'guest'

    if (!allow.includes(role)) {
      next(createHttpError(role === 'guest' ? 401 : 403))
    }

    return next()
  }
}

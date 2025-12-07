import createHttpError from 'http-errors'
import ms from 'ms'
import { RequestHandler, Response, Request, CookieOptions } from 'express'
import { unchain } from './helpers'
import { findUser } from '../services/servUsers'
import * as aJwt from '../lib/authJwt'

const {
  HTTPS = '0',
  COOKIE_SECRET,
} = process.env

export function getJwtUser(res: Response): aJwt.JwtUser | undefined {
  const { jwtUser } = res.locals
  return aJwt.isJwtUser(jwtUser) ? jwtUser : undefined
}

export function assertJwtUser(res: Response): aJwt.JwtUser {
  const jwtUser = getJwtUser(res)
  if (jwtUser === undefined) throw new Error('missing jwt user')
  return jwtUser
}

export function setJwtUser<U extends aJwt.JwtUser>(res: Response, user: U) {
  res.locals.jwtUser = aJwt.toJwtUser(user)
}

export function getAuthnCookies(req: Request) {
  const { signedCookies: c } = req
  return {
    access: c['access.id'],
    refresh: c['refresh.id'],
  }
}

export function setAuthnCookies(
  res: Response,
  tokens: {
    access: string
    refresh: string
  },
  {
    accessTtl = aJwt.envAccessTtl,
    refreshTtl = aJwt.envRefreshTtl,
  } = {},
  cookieOpts: CookieOptions = {
    secure: HTTPS === '1',
    path: '/',
    httpOnly: true,
    sameSite: 'strict',
    signed: COOKIE_SECRET !== '',
  },
) {
  res.cookie('access.id', tokens.access, {
    maxAge: ms(accessTtl), ...cookieOpts,
  })
  res.cookie('refresh.id', tokens.refresh, {
    maxAge: ms(refreshTtl), ...cookieOpts,
  })
}

export function clearAuthnCookies(res: Response) {
  res.clearCookie('access.id')
  res.clearCookie('refresh.id')
}

export const authnByHeader: RequestHandler = (req, res, next) => {
  const ah = req.header('Authorization')
  if (!ah) return next()
  const [, token] = ah.match(/^Bearer (.*?)$/) || []
  if (!token) return next()

  const ju = aJwt.verifyAccessToken(token)
  if (ju === null) {
    return next(createHttpError(400, 'invalidToken'))
  }
  setJwtUser(res, ju)
  return next()
}

export const authnByCookie: RequestHandler = async (req, res, next) => {
  const tokens = getAuthnCookies(req)
  if (tokens.access) {
    const ju = aJwt.verifyAccessToken(tokens.access)
    if (ju !== null) {
      setJwtUser(res, ju)
      return next()
    }
  }
  if (tokens.refresh) {
    const refresh = aJwt.verifyRefreshToken(tokens.refresh)
    if (!refresh) {
      clearAuthnCookies(res)
      return next()
    }
    const user = await findUser({ _id: refresh._id })
    if (
      !user
      || (
        user.lastLogoutAt
        && refresh.issueAt
        && user.lastLogoutAt > tokens.refresh.iat
      )
    ) {
      clearAuthnCookies(res)
      return next()
    }
    const newTokens = aJwt.signTokens(user, refresh.persist)
    setAuthnCookies(res, newTokens)
    setJwtUser(res, user)
    next()
  }
}

export function authenticate({
  header = true,
  cookies = true,
} = {}): RequestHandler {
  return async (req, res, next) => {
    if (header) {
      const { err } = await unchain(authnByHeader)(req, res)
      if (err) return next(err)
    }
    if (cookies && getJwtUser(res) === undefined) {
      const { err } = await unchain(authnByCookie)(req, res)
      if (err) return next(err)
    }
    return next()
  }
}

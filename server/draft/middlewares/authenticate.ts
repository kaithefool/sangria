import createHttpError from 'http-errors'
import { RequestHandler, Response, Request, CookieOptions } from 'express'
import jwt, { JwtPayload, VerifyErrors } from 'jsonwebtoken'
import { nanoid } from 'nanoid'
import { Types } from 'mongoose'
import ms, { StringValue as MsString } from 'ms'
import { unchain } from './helpers'
import { Role } from '../consts'
import { findUser } from '../services/servUsers'

const {
  HTTPS = '0',
  COOKIE_SECRET,
  JWT_SECRET = nanoid(32),
  JWT_ACCESS_TTL = '5m',
  JWT_REFRESH_TTL = '15d',
} = process.env

const envAccessTtl = validateMsString(JWT_ACCESS_TTL)
const envRefreshTtl = validateMsString(JWT_REFRESH_TTL)

function validateMsString(v: string): MsString {
  const s = v as MsString
  try {
    ms(s)
  }
  catch (error) {
    throw error
  }
  return s
}

export type JwtUser = {
  _id: Types.ObjectId
  role: Role
  email?: string
}
export type JwtRefresh = {
  _id: Types.ObjectId
  persist: boolean
  issueAt?: Date
}

export function isJwtUser(v: unknown): v is JwtUser {
  return (
    typeof v === 'object'
    && v !== null
    && '_id' in v
    && v._id instanceof Types.ObjectId
    && 'role' in v
    && typeof v.role === 'string'
  )
}

function toJwtUser<U extends JwtUser>(user: U): JwtUser {
  return {
    _id: new Types.ObjectId(user._id),
    role: user.role,
    email: user.email,
  }
}

export function getJwtUser(res: Response): JwtUser | undefined {
  const { jwtUser } = res.locals
  return isJwtUser(jwtUser) ? jwtUser : undefined
}

export function assertJwtUser(res: Response): JwtUser {
  const jwtUser = getJwtUser(res)
  if (jwtUser === undefined) throw new Error('missing jwt user')
  return jwtUser
}

export function setJwtUser<U extends JwtUser>(res: Response, user: U) {
  res.locals.jwtUser = toJwtUser(user)
}

export function signTokens<U extends JwtUser>(
  user: U,
  persist = false,
  {
    secret = JWT_SECRET,
    accessTtl = envAccessTtl,
    refreshTtl = envRefreshTtl,
  } = {},
) {
  const ju = toJwtUser(user)
  const jr: JwtRefresh = { _id: ju._id, persist }
  return {
    access: jwt.sign(
      ju,
      secret,
      { subject: 'access', expiresIn: accessTtl },
    ),
    refresh: jwt.sign(
      jr,
      secret,
      { subject: 'refresh', expiresIn: refreshTtl },
    ),
  }
}

const isVerifyErrors = (err: unknown): err is VerifyErrors => {
  return typeof err === 'object'
    && err !== null
    && 'name' in err
    && typeof err.name === 'string'
    && [
      'TokenExpiredError',
      'JsonWebTokenError',
      'NotBeforeError',
    ].includes(err.name)
}

export function verifyToken<P extends object>(
  token: string, sub?: string, secret = JWT_SECRET,
): JwtPayload & P | null {
  try {
    const payload = jwt.verify(token, secret) as JwtPayload
    if (sub && sub !== payload.sub) {
      return null
    }
    if ('_id' in payload && typeof payload._id === 'string') {
      payload._id = new Types.ObjectId(payload._id)
    }
    return payload as JwtPayload & P
  }
  catch (err: unknown) {
    if (isVerifyErrors(err)) {
      return null
    }
    throw err
  }
}

export function verifyAccessToken(
  token: string, secret?: string,
): JwtUser | null {
  const payload = verifyToken<JwtUser>(token, 'access', secret)
  return payload ? toJwtUser(payload) : null
}

export function verifyRefreshToken(
  token: string, secret?: string,
): JwtRefresh | null {
  const payload = verifyToken<JwtRefresh>(token, 'refresh', secret)
  if (payload) {
    return {
      _id: payload._id,
      persist: payload.persist,
      issueAt: payload.iat ? new Date(payload.iat * 1000) : undefined,
    }
  }
  return null
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
    accessTtl = envAccessTtl,
    refreshTtl = envRefreshTtl,
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

export const authnByHeader: RequestHandler = ({ header }, res, next) => {
  const ah = header('Authorization')
  if (!ah) return next()
  const [, token] = ah.match(/^Bearer (.*?)$/) || []
  if (!token) return next()

  const ju = verifyAccessToken(token)
  if (ju === null) {
    return next(createHttpError(400, 'invalidToken'))
  }
  setJwtUser(res, ju)
  return next()
}

export const authnByCookie: RequestHandler = async (req, res, next) => {
  const tokens = getAuthnCookies(req)
  if (tokens.access) {
    const ju = verifyAccessToken(tokens.access)
    if (ju !== null) {
      setJwtUser(res, ju)
      return next()
    }
  }
  if (tokens.refresh) {
    const refresh = verifyRefreshToken(tokens.refresh)
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
    const newTokens = signTokens(user, refresh.persist)
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

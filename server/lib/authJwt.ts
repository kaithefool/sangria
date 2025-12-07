import jwt, { JwtPayload, VerifyErrors } from 'jsonwebtoken'
import { nanoid } from 'nanoid'
import { Types } from 'mongoose'
import ms, { StringValue as MsString } from 'ms'

import { Role } from '../consts'

const {
  JWT_SECRET = nanoid(32),
  JWT_ACCESS_TTL = '5m',
  JWT_REFRESH_TTL = '15d',
} = process.env

export const envAccessTtl = validateMsString(JWT_ACCESS_TTL)
export const envRefreshTtl = validateMsString(JWT_REFRESH_TTL)

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

export function toJwtUser<U extends JwtUser>(user: U): JwtUser {
  return {
    _id: new Types.ObjectId(user._id),
    role: user.role,
    email: user.email,
  }
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

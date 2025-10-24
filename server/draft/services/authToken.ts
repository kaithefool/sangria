import jwt, { JwtPayload, VerifyErrors } from 'jsonwebtoken'
import { nanoid } from 'nanoid'
import ms, { StringValue as MsString } from 'ms'
import { Role } from '../consts'

const {
  JWT_SECRET = nanoid(32),
  JWT_ACCESS_TTL = '5m',
  JWT_REFRESH_TTL = '15d',
} = process.env

const accessTtl = validateMsString(JWT_ACCESS_TTL)
const refreshTtl = validateMsString(JWT_REFRESH_TTL)

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
  _id: string
  role: Role
  email?: string
}
export type JwtRefresh = {
  _id: string
  persist: boolean
}

export function isJwtUser(v: unknown): v is JwtUser {
  return (
    typeof v === 'object'
    && v !== null
    && '_id' in v
    && typeof v._id === 'string'
    && 'role' in v
    && typeof v.role === 'string'
  )
}

function toJwtUser<U extends JwtUser>(user: U): JwtUser {
  return {
    _id: user._id,
    role: user.role,
    email: user.email,
  }
}

export function signTokens<U extends JwtUser>(user: U, persist: false) {
  const ju = toJwtUser(user)
  const jr: JwtRefresh = { _id: ju._id, persist }
  return {
    access: jwt.sign(
      ju,
      JWT_SECRET,
      { subject: 'access', expiresIn: accessTtl },
    ),
    refresh: jwt.sign(
      jr,
      JWT_SECRET,
      { subject: 'refresh', expiresIn: refreshTtl },
    ),
  }
}

export const isVerifyErrors = (err: unknown): err is VerifyErrors => {
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
  token: string, sub?: string,
): JwtPayload & P | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload & P
    if (sub && sub !== payload.sub) {
      return null
    }
    return payload
  }
  catch (err: unknown) {
    if (isVerifyErrors(err)) {
      return null
    }
    throw err
  }
}

export function verifyAccessToken(token: string): JwtUser | null {
  const payload = verifyToken<JwtUser>(token, 'access')
  return payload ? toJwtUser(payload) : null
}

export function verifyRefreshToken(token: string): JwtRefresh | null {
  const payload = verifyToken<JwtRefresh>(token, 'refresh')
  if (payload) {
    return {
      _id: payload._id,
      persist: payload.persist,
    }
  }
  return null
}

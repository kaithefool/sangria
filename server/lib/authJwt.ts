import jwt, { type JwtPayload, type VerifyErrors } from 'jsonwebtoken'
import ms, { type StringValue as MsString } from 'ms'
import { nanoid } from 'nanoid'
import { type Role } from '../consts.ts'

const {
  JWT_SECRET = nanoid(32),
  JWT_ACCESS_TTL = '5m',
  JWT_REFRESH_TTL = '15d',
} = process.env

export const envAccessTtl = ms(JWT_ACCESS_TTL as MsString)
export const envRefreshTtl = ms(JWT_REFRESH_TTL as MsString)

export type JwtUser = {
  id: string
  role: Role
  email?: string
}
export type JwtRefresh = {
  id: string
  persist: boolean
  issueAt?: Date
}

export function isJwtUser(v: unknown): v is JwtUser {
  return (
    typeof v === 'object' &&
    v !== null &&
    'id' in v &&
    typeof v.id === 'string' &&
    'role' in v &&
    typeof v.role === 'string'
  )
}

export function toJwtUser<U extends JwtUser>(user: U): JwtUser {
  return {
    id: user.id,
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
  }: {
    secret?: string
    accessTtl?: MsString | number
    refreshTtl?: MsString | number
  } = {},
) {
  const ju = toJwtUser(user)
  const jr: JwtRefresh = { id: ju.id, persist }
  return {
    access: jwt.sign(ju, secret, { subject: 'access', expiresIn: accessTtl }),
    refresh: jwt.sign(jr, secret, {
      subject: 'refresh',
      expiresIn: refreshTtl,
    }),
  }
}

const isVerifyErrors = (err: unknown): err is VerifyErrors => {
  return (
    typeof err === 'object' &&
    err !== null &&
    'name' in err &&
    typeof err.name === 'string' &&
    ['TokenExpiredError', 'JsonWebTokenError', 'NotBeforeError'].includes(
      err.name,
    )
  )
}

export function verifyToken<P extends object>(
  token: string,
  sub?: string,
  secret = JWT_SECRET,
): (JwtPayload & P) | null {
  try {
    const payload = jwt.verify(token, secret) as JwtPayload
    if (sub && sub !== payload.sub) {
      return null
    }
    return payload as JwtPayload & P
  } catch (err: unknown) {
    if (isVerifyErrors(err)) {
      return null
    }
    throw err
  }
}

export function verifyAccessToken(
  token: string,
  secret?: string,
): JwtUser | null {
  const payload = verifyToken<JwtUser>(token, 'access', secret)
  return payload ? toJwtUser(payload) : null
}

export function verifyRefreshToken(
  token: string,
  secret?: string,
): JwtRefresh | null {
  const payload = verifyToken<JwtRefresh>(token, 'refresh', secret)
  if (payload) {
    return {
      id: payload.id,
      persist: payload.persist,
      issueAt: payload.iat ? new Date(payload.iat * 1000) : undefined,
    }
  }
  return null
}

import { Response } from 'express'
import { Role } from '../consts'

type JwtUser = {
  _id: string
  role: Role
  email?: string
}

function isJwtUser(v: unknown): v is JwtUser {
  return (
    typeof v === 'object'
    && v !== null
    && '_id' in v
    && typeof v._id === 'string'
  )
}

export function getJwtUser(res: Response): JwtUser | undefined {
  const user = res.locals
  return isJwtUser(user) ? user : undefined
}

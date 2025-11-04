import { Schema, model } from 'mongoose'
import { Role, roles } from '../consts'

export type User = {
  _id: string
  role: Role
  email?: string
  lastLogoutAt?: Date
  // deletedAt?: Date
}

export const schema = new Schema<User>({
  role: { enum: roles },
  email: String,
  lastLogoutAt: Date,
})

export default model<User>('User', schema)

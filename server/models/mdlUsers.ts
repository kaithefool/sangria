import { Schema, model } from 'mongoose'
import {
  InferSchemaTypeWithId,
  delModel, softDelete, softDeleteMany, softDeleteOne,
} from './utils'
import { roles } from '../consts'
import { encrypt } from '../lib/crypto'

export const schema = new Schema({
  role: { type: String, enum: roles, required: true },
  active: { type: Boolean, default: true },
  email: { type: String, unique: true },
  password: {
    type: String,
    set: encrypt,
    select: false,
  },
  lastLogoutAt: Date,
}, {
  statics: {
    softDeleteOne,
    softDeleteMany,
  },
  methods: {
    softDelete,
  },
})

export type User = InferSchemaTypeWithId<typeof schema>
export const mdlDeletedUsers = delModel('User', schema)
export default model('User', schema)

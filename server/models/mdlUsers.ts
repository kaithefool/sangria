import { Schema, model } from 'mongoose'
import {
  InferSchemaTypeWithId,
  delModel, softDelete, softDeleteMany, softDeleteOne,
} from './utils'
import { roles } from '../consts'
import { encrypt } from '../utils/crypto'

export const schema = new Schema({
  role: { type: String, enum: roles, required: true },
  active: { type: Boolean, required: true },
  email: String,
  password: {
    type: String,
    set: encrypt,
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

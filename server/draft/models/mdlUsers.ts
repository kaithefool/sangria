import { Schema, model } from 'mongoose'
import {
  InferSchemaTypeWithId, softDelete, softDeleteMany, softDeleteOne,
} from './utils'
import { roles } from '../consts'

export const schema = new Schema({
  role: { type: String, enum: roles, required: true },
  email: String,
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
export const mdlDeletedUsers = model('DeletedUser', schema)
export const mdlUsers = model('User', schema)

export default mdlUsers

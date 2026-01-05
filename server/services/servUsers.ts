import z from 'zod'
import * as mdlUsers from '../models/mdlUsers'
import { roles } from '../consts'

export const userSchema = z.object({
  role: z.literal(roles),
  email: z.email(),
  password: z.string().min(8),
})

export function findUser(id: string) {
  return mdlUsers.selectUsers({ filter: { id } })[0]
}

export function findUsers(opts: mdlUsers.SelectUsersOpts) {
  return mdlUsers.selectUsers({ limit: 20, ...opts })
}

export function countUsers(
  filter?: mdlUsers.UsersFilter,
) {
  return mdlUsers.countUsers(filter)
}

export function listUsers(
  opts: mdlUsers.SelectUsersOpts,
) {
  const rows = mdlUsers.selectUsers(opts)
  const total = mdlUsers.countUsers(opts?.filter)
  return { rows, total }
}

export function createUsers(row: mdlUsers.UserInsert) {
  return mdlUsers.insertUsers(row)
}

export function patchUsers(
  filter: mdlUsers.UsersFilter,
  update: mdlUsers.UserUpdate,
) {
  return mdlUsers.updateUsers(filter, update)
}

export function deleteUsers(
  filter: mdlUsers.UsersFilter,
) {
  return mdlUsers.deleteUsers(filter)
}

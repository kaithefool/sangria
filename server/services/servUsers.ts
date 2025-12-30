import z from 'zod'
import * as mdlUsers from '../models/mdlUsers'
import { catchDupErr } from './utils'
import { roles } from '../consts'

export const userSchema = z.object({
  role: z.literal(roles),
  email: z.email(),
  password: z.string().min(8),
})

export function findUser(
  filter: mdlUsers.UsersFilter,
) {
  return mdlUsers.selectUsers({ filter })[0]
}

export async function findUsers(opts: mdlUsers.SelectUsersOpts) {
  return mdlUsers.selectUsers({ limit: 20, ...opts })
}

export async function countUsers(
  filter?: mdlUsers.UsersFilter,
) {
  return mdlUsers.countUsers(filter)
}

export async function listUsers(
  opts: mdlUsers.SelectUsersOpts,
) {
  const rows = mdlUsers.selectUsers(opts)
  const total = mdlUsers.countUsers(opts?.filter)
  return { rows, total }
}

export async function createUsers(
  ...docs: AnyKeys<User>[]
) {
  return catchDupErr(() => mdlUsers.create(...docs))
}

export async function patchUsers(
  filter: UsersFilter,
  query: UpdateQuery<User>,
) {
  return catchDupErr(
    () => mdlUsers.updateMany(matchUsers(filter), query),
  )
}

export async function deleteUsers(
  filter: UsersFilter,
) {
  await mdlUsers.softDeleteMany(matchUsers(filter))
}

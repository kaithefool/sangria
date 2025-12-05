import { AnyKeys, FilterQuery, SortOrder, UpdateQuery } from 'mongoose'
import z from 'zod'
import mdlUsers, { User } from '../models/mdlUsers'
import { catchDupErr } from './utils'
import { roles } from '../consts'

export type UsersFilter = FilterQuery<User>
export type UsersQuery = {
  filter?: UsersFilter
  sort?: { [x: string]: SortOrder }
  skip?: number
  limit?: number
}

export const userValidSchema = z.object({
  role: z.literal(roles),
  email: z.email(),
  password: z.string().min(8),
})

export function matchUsers(
  filter?: UsersFilter,
): FilterQuery<User> {
  return filter ?? {}
}

export async function findUser(
  filter: UsersFilter,
) {
  return mdlUsers.findOne(matchUsers(filter))
}

export async function findUsers({
  filter, sort, skip, limit = 60,
}: UsersQuery = {}) {
  let q = mdlUsers.find(matchUsers(filter))
  if (sort) q = q.sort(sort)
  if (skip) q.skip(skip)
  if (limit) q.limit(limit)
  return q
}

export async function countUsers(
  filter?: UsersFilter,
) {
  return mdlUsers.countDocuments(matchUsers(filter))
}

export async function listUsers(opt: UsersQuery = {}) {
  const [rows, total] = await Promise.all([
    findUsers(opt),
    countUsers(opt.filter),
  ])
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

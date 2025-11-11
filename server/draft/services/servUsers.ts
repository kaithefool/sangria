import { AnyKeys, FilterQuery, SortOrder, UpdateQuery } from 'mongoose'
import mdlUsers, { User } from '../models/mdlUsers'

export type UsersFilter = FilterQuery<User>
export type UsersQuery = {
  filter?: UsersFilter
  sort?: { [x: string]: SortOrder }
  skip?: number
  limit?: number
}

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

export async function findUsers(opt: UsersQuery = {}) {
  let q = mdlUsers.find(matchUsers(opt.filter))
  if (opt.sort) q = q.sort(opt.sort)
  if (opt.skip) q.skip(opt.skip)
  if (opt.limit) q.limit(opt.limit)
  return q
}

export async function countUsers(
  filter?: UsersFilter,
) {
  return mdlUsers.countDocuments(matchUsers(filter))
}

export async function listUsers(opt: UsersQuery = {}) {
  const [rows, total] = await Promise.all([
    countUsers(opt.filter),
    findUsers(opt),
  ])
  return { rows, total }
}

export async function createUsers(
  ...docs: AnyKeys<User>[]
) {
  return mdlUsers.create(...docs)
}

export async function patchUsers(
  filter: UsersFilter,
  query: UpdateQuery<User>,
) {
  await mdlUsers.updateMany(matchUsers(filter), query)
}

export async function deleteUsers(
  filter: UsersFilter,
) {
  await mdlUsers.softDeleteMany(matchUsers(filter))
}

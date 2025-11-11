import { AnyKeys, FilterQuery, UpdateQuery } from 'mongoose'
import mdlUsers, { User } from '../models/mdlUsers'

export type UsersFilter = FilterQuery<User>

export function matchUsers(
  filter: UsersFilter,
): FilterQuery<User> {
  return filter
}

export async function findUser(
  filter: UsersFilter,
): Promise<User | null> {
  return mdlUsers.findOne(matchUsers(filter))
}

export async function findUsers(
  filter: UsersFilter,
): Promise<User[]> {
  return mdlUsers.find(matchUsers(filter))
}

export async function countUsers(
  filter: UsersFilter,
) {
  return mdlUsers.countDocuments(matchUsers(filter))
}

export async function listUsers(
  filter: UsersFilter,
) {
  const [rows, total] = await Promise.all([
    countUsers(matchUsers(filter)),
    findUsers(matchUsers(filter)),
  ])
  return { rows, total }
}

export async function createUsers(
  ...docs: AnyKeys<User>[]
): Promise<{ _id: string }[]> {
  const created = await mdlUsers.create(...docs)
  return created.map(c => ({ _id: c._id }))
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
  await mdlUsers.deleteMany(matchUsers(filter))
}

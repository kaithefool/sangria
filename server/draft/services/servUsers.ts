import { Role } from '../consts'

export type User = {
  _id: string
  role: Role
  email?: string
  lastLogoutAt?: Date
}

export type UserFilter = {
  _id?: string
}

export async function findUser(filter: UserFilter): Promise<User | null> {}
export async function findUsers(): Promise<User[]> {}
export async function listUsers() {}
export async function createUsers() {}
export async function patchUsers() {}
export async function deleteUsers() {}

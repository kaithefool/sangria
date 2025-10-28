import { Role } from '../consts'

export type User = {
  _id: string
  role: Role
  email?: string
  lastLogoutAt?: Date
}

export async function findUser(_id: string): User | null {

}

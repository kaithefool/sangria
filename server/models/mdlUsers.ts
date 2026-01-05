import { Role } from '../consts'
import { encryptPwd } from '../lib/crypto'
import { SqlCf } from '../lib/query'
import db, { q, uuid, catchUniqErr } from '../start/db'

export type UserRow = {
  id: string
  role: Role
  email: string
  password: string | null
  active: boolean
  created_at: Date
  updated_at: Date | null
  last_logout_at: Date | null
}

export type UserInsert = {
  role: Role
  email: string
  password?: string | null
  active?: boolean
}

export type UserUpdate = {
  role?: Role
  email?: string
  password?: string | null
  active?: boolean
  last_logout_at?: Date
}

export type UsersFilter = {
  id?: string | SqlCf<string>
  role?: Role | SqlCf<string>
  email?: string
  active?: boolean
  created_at?: { gt: Date, gte: Date, lt: Date, lte: Date }
  updated_at?: { gt: Date, gte: Date, lt: Date, lte: Date }
  last_logout_at?: { gt: Date, gte: Date, lt: Date, lte: Date }
}

export function insertUsers(...rows: UserInsert[]) {
  return catchUniqErr(() => {
    const id = uuid()
    const rr = rows.map(({ password, ...r }) => ({
      id: uuid(),
      password: password ? encryptPwd(password) : null,
      ...r,
    }))
    q`
      INSERT INTO users ${q.values(...rr)};
    `.run()
    return id
  })
}

export type SelectUsersOpts = {
  filter?: UsersFilter
  sort?: { [p in keyof UserRow]?: 1 | -1 }
  skip?: number
  limit?: number
}

export function selectUsers<P extends boolean>(
  { filter = {}, skip, limit, sort }: SelectUsersOpts = {},
  password?: P,
): P extends true ? UserRow[] : Omit<UserRow, 'password'>[] {
  let cols = 'id, role, email, active, created_at, updated_at, last_logout_at'
  if (password) cols += ', password'

  return q`
    SELECT ${q.raw(cols)}
    FROM users
    ${q.where(filter)}
    ${q.orderBy(sort)}
    ${q.limit({ skip, limit })};
  `.all() as UserRow[]
}

export function countUsers(filter: UsersFilter = {}) {
  const r = q`
    SELECT count(*) AS total FROM users ${q.where(filter)};
  `.get() as { total: number }
  return r.total
}

export function updateUsers(
  filter: UsersFilter = {},
  update: UserUpdate,
) {
  return catchUniqErr(() => {
    const u = { ...update, updated_at: new Date() }
    if (u.password) u.password = encryptPwd(u.password)
    q`
      UPDATE users ${q.set(update)}
      ${q.where(filter)};
    `.run()
  })
}

export function deleteUsers(filter: UsersFilter = {}) {
  const where = q.where(filter)
  db.transaction(() => {
    q`
      INSERT INTO deleted_users SELECT * FROM users ${where};
    `.run()
    q`
      DELETE FROM users ${where};
    `.run()
  })()
}

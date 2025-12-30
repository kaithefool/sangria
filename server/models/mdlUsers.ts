import { Role } from '../consts'
import { encryptPwd } from '../lib/crypto'
import db, { q, uuid, catchUniqErr } from '../start/db'

export type UserInsert = {
  role: Role
  email?: string | null
  password?: string | null
}

export function insertUser({
  role, email = null, password = null,
}: UserInsert) {
  return catchUniqErr(() => {
    const id = uuid()
    db.query(q`
      INSERT INTO users ${q.values({
        id, role, email,
        password: password ? encryptPwd(password) : password,
      })};
    `).run()
    return id
  })
}

export type UsersFilter = {
  id?: string | { ne: string }
  role?: Role
  email?: string
  created_at?: { gt: Date, gte: Date, lt: Date, lte: Date }
  updated_at?: { gt: Date, gte: Date, lt: Date, lte: Date }
  last_logout_at?: { gt: Date, gte: Date, lt: Date, lte: Date }
}

export type SelectUsersOpts = {
  filter?: UsersFilter
  sort?: { [p in keyof UserRow]: 1 | -1 }
  skip?: number
  limit?: number
}

export type UserRow = {
  id: string
  role: Role
  email: string | null
  password: string | null
  created_at: Date
  updated_at: Date | null
  last_logout_at: Date | null
}

export function selectUsers<P extends boolean = false>(
  { filter = {}, skip, limit, sort }: SelectUsersOpts = {},
  password?: P,
): P extends true ? UserRow[] : Omit<UserRow, 'password'>[] {
  let cols = 'id, role, email, created_at, updated_at, last_logout_at'
  if (password) cols += ', password'

  return db.query(q`
    SELECT ${q.raw(cols)}
    FROM users
    ${q.where(filter)}
    ${q.orderBy(sort)}
    ${q.limit({ skip, limit })};
  `).all() as UserRow[]
}

export function countUsers(filter: UsersFilter = {}) {
  const r = db.query(q`
    SELECT count(*) AS total FROM users ${q.where(filter)};
  `).get() as { total: number }
  return r.total
}

export type UserUpdate = {
  role?: Role
  email?: string | null
  password?: string | null
  last_logout_at?: Date
}

export async function updateUsers(
  filter: UsersFilter = {},
  update: UserUpdate,
) {
  return catchUniqErr(() => {
    const u = { ...update, updated_at: new Date() }
    if (u.password) u.password = encryptPwd(u.password)
    db.query(q`
      UPDATE users ${q.set(update)}
      ${q.where(filter)};
    `).run()
  })
}

export function deleteUsers(filter: UsersFilter = {}) {
  const where = q.where(filter)
  db.transaction(() => {
    db.query(q`
      INSERT INTO deleted_users SELECT * FROM users ${where};
    `).run()
    db.query(q`
      DELETE FROM users ${where};
    `).run()
  })()
}

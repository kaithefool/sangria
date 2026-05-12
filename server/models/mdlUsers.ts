import { Role } from '../consts'
import { encryptPwd } from '../lib/crypto'
import db, { q, uuid, catchUniqErr } from '../start/db'
import { RowsFilter, RowInsert, RowUpdate, SelectRowsOpts } from './utils'

export type UserRow = {
  id: string
  role: Role
  email: string
  password: string | null
  active: 1 | 0
  created_at: Date
  updated_at: Date | null
  last_logout_at: Date | null
}

export type UserInsert = RowInsert<UserRow, 'role' | 'email'>
export type UserUpdate = RowUpdate<UserRow>
export type UsersFilter = RowsFilter<UserRow>
export type SelectUsersOpts = SelectRowsOpts<UserRow, UsersFilter>

export function insertUsers(...rows: UserInsert[]) {
  return catchUniqErr(() => {
    const rr = rows.map(({ password, ...r }) => ({
      id: uuid(),
      password: password ? encryptPwd(password) : null,
      ...r,
    }))
    q`INSERT INTO users ${q.values(...rr)};`.run()
    return rr.map((r) => ({ id: r.id }))
  })
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
  `
    .all<UserRow>()
    .map(q.castDates(['created_at', 'updated_at', 'last_logout_at']))
}

export function countUsers(filter: UsersFilter = {}) {
  const r = q`
    SELECT count(*) AS total FROM users ${q.where(filter)};
  `.get() as { total: number }
  return r.total
}

export function updateUsers(filter: UsersFilter = {}, update: UserUpdate) {
  return catchUniqErr(() => {
    const u = { ...update, updated_at: new Date() }
    if (u.password) u.password = encryptPwd(u.password)
    q`
      UPDATE users ${q.set(u)}
      ${q.where(filter)};
    `.run()
  })
}

export function deleteUsers(filter: UsersFilter = {}) {
  const where = q.where(filter)
  db.transaction(() => {
    q`INSERT INTO deleted_users SELECT * FROM users ${where};`.run()
    q`DELETE FROM users ${where};`.run()
  })()
}

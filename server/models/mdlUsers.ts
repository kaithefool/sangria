import { Role } from '../consts'
import { encryptPwd } from '../lib/crypto'
import db, { q, uuid, catchUniqErr } from '../start/db'

export type UserRow = {
  id: string
  role: Role
  email: string | null
  password: string | null
  createdAt: Date
  updatedAt: Date
  lastLogoutAt: Date | null
}

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
}

export type SelectUsersOpts = {
  filter?: UsersFilter
  skip?: number
  limit?: number
  password?: boolean
}

export function selectUsers<P extends boolean = false>(
  { filter = {}, skip, limit }: SelectUsersOpts,
  password?: P,
): P extends true ? UserRow[] : Omit<UserRow, 'password'>[] {
  let cols = 'id, role, email, created_at'
  if (password) cols += ', password'

  return db.query(q`
    SELECT ${q.raw(cols)}
    FROM users
    ${q.where(filter)}
    ${q.limit({ skip, limit })};
  `).all() as UserRow[]
}

export function countUsers(filter: UsersFilter = {}) {
  const r = db.query(q`
    SELECT count(*) AS total FROM users ${q.where(filter)};
  `).get() as { total: number }
  return r.total
}

// export async function updateUsers(
//   filter: UsersFilter = {},
//   update: {
//     role?: Role
//     email?: string | null
//     password?: string | null
//   },
// ) {
//   const u = { ...update }
//   if (u.password) u.password = encryptPwd(u.password)
//   return q.catchDupErr(() => db.run(q`
//     UPDATE users ${q.set(update)}
//     ${q.where(filter)};
//   `))
// }

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

async function test() {
  const [err, id] = await insertUser({
    role: 'admin', email: 'foo@bar.com', password: '12345678',
  })
  if (err) {
    console.error(err)
    return
  }
  console.log(id)
  console.log(await selectUsers({ filter: { id } }))
  deleteUsers({ id })
  console.log(await selectUsers({ filter: { id } }))
}

test()

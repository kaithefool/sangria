import { Role } from '../consts'
import { encryptPwd } from '../lib/crypto'
import { SqlDupErr } from '../lib/query/catchDupErr'
import db, { q, uuid } from '../start/db'

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

export async function insertUser({
  role, email = null, password = null,
}: UserInsert): Promise<[SqlDupErr] | [null, string]> {
  const id = uuid()
  const [err] = await q.catchDupErr(() => db.run(q`
    INSERT INTO users ${q.values({
      id, role, email,
      password: password ? encryptPwd(password) : password,
    })};
  `))
  if (err) return [err]
  return [null, id]
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
  { filter = {}, skip = 0, limit = 20 }: SelectUsersOpts,
  password?: P,
): Promise<P extends true ? UserRow[] : Omit<UserRow, 'password'>[]> {
  let cols = 'id, role, email, created_at'
  if (password) cols += ', password'

  return db.all<UserRow[]>(q`
    SELECT ${q.raw(cols)}
    FROM users ${q.where(filter)}
    LIMIT ${skip}, ${limit};
  `)
}

export async function countUsers(filter: UsersFilter = {}) {
  const r = await db.get<{ total: number }>(`
    SELECT count(*) AS total FROM users ${q.where(filter)};
  `)
  return r?.total ?? 0
}

export async function updateUsers(
  filter: UsersFilter = {},
  update: {
    role?: Role
    email?: string | null
    password?: string | null
  },
) {
  const u = { ...update }
  if (u.password) u.password = encryptPwd(u.password)
  return q.catchDupErr(() => db.run(q`
    UPDATE users ${q.set(update)}
    ${q.where(filter)};
  `))
}

export async function deleteUsers(filter: UsersFilter = {}) {
  const where = q.where(filter)
  await db.exec('BEGIN TRANSACTION;')
  await db.run(q`INSERT INTO deleted_users SELECT * FROM users ${where};`)
  await db.run(q`DELETE FROM users ${where};`)
  await db.exec('COMMIT;')
}

async function test() {
  const [, id] = await insertUser({
    role: 'admin', email: 'foo@bar.com', password: '12345678',
  })
  console.log(await selectUsers({ filter: { id } }))
  await deleteUsers({ id })
  console.log(await selectUsers({ filter: { id } }))
}

test()

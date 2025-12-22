import { Role } from '../consts'
import { encryptPwd } from '../lib/crypto'
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

export async function insertUser({
  role, email = null, password = null,
}: {
  role: Role
  email?: string | null
  password?: string | null
}) {
  const id = uuid()
  await db.run(q`
    INSERT INTO users ${q.values({
      id, role, email,
      password: password ? encryptPwd(password) : password,
    })};
  `)
  return id
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

export function selectUsers({
  filter = {}, skip = 0, limit = 20, password = false,
}: SelectUsersOpts) {
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
  return db.run(q`
    UPDATE users ${q.set(update)}
    ${q.where(filter)};
  `)
}

export async function deleteUsers(filter: UsersFilter = {}) {
  return db.run(q`
    DELETE FROM users ${q.where(filter)};
  `)
}

async function run() {
  const id = await insertUser({
    role: 'admin',
    email: 'foo@bar.com',
    password: '12345678',
  })
  console.log(await selectUsers({ filter: { id } }))
  console.log(await countUsers())
  await updateUsers({ id }, { role: 'client' })
  console.log(await selectUsers({ filter: { id } }))
  await deleteUsers({ id })
  console.log(await selectUsers({}))
}

run()

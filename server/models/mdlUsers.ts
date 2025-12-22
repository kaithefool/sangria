import { Role } from '../consts'
import { encryptPwd } from '../lib/crypto'
import db, { q, uuid } from '../start/db'

export type UserRow = {
  id: string
  role: Role
  email: string | null
  password: string | null
  createdAt: Date
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

export type UserFilter = {
  id?: string | { ne: string }
  role?: Role
  email?: string
}

export type SelectUsersOpts = {
  filter?: UserFilter
  skip?: number
  limit?: number
  password?: boolean
}

export function selectUsers({
  filter = {}, skip, limit, password = false,
}: SelectUsersOpts) {
  let cols = 'id, role, email, created_at'
  if (password) cols += ', password'

  return db.all<UserRow[]>(q`
    SELECT ${{ sql: cols }} FROM users ${q.where(filter)};
  `)
}

async function run() {
  const id = await insertUser({
    role: 'admin',
    email: 'foo@bar.com',
    password: '12345678',
  })
  const users = await selectUsers({ filter: { id } })
  console.log(users)
}

run()

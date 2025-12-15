import { Role } from '../consts'
import { encryptPwd } from '../lib/crypto'
import db, { uuid } from '../start/db'

export type User = {
  id: Buffer<ArrayBuffer>
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
  await db.run(`
    INSERT INTO users (id, role, email, password, created_at)
    VALUES (?, ?, ?, ?, ?);
  `, [
    id,
    role,
    email,
    typeof password === 'string' ? encryptPwd(password) : null,
    new Date(),
  ])
  return id
}

export function selectUsers() {
  return db.all(`
    SELECT * FROM users;
  `)
}

async function run() {
  await insertUser({
    role: 'admin',
    email: 'foo@bar.com',
    password: '12345678',
  })

  const users = await selectUsers()
  console.log(users)
}

run()

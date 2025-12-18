import { Role } from '../consts'
import { encryptPwd } from '../lib/crypto'
import db, { q, uuid } from '../start/db'

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
  await db.run(q`
    INSERT INTO users ${q.values({
      id, role, email,
      password: password ? encryptPwd(password) : password,
    })};
  `)
  return id
}

export function selectUsers(id?: any) {
  if (id) {
    return db.all(q`SELECT * FROM users WHERE id = ${id}`)
  }
  return db.all(`
    SELECT * FROM users;
  `)
}

async function run() {
  const id = await insertUser({
    role: 'admin',
    email: 'foo@bar.com',
    password: '12345678',
  })

  console.log('inserted', id)

  const users = await selectUsers()
  console.log(users)
  console.log(await selectUsers(users[0].id))
}

run()

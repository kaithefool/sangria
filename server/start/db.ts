import { v7 as uuid } from 'uuid'
import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import { join } from 'node:path'

const dbPath = join(
  import.meta.dirname,
  '../../volumes/db/app.db',
)

export function dbId(idInStr?: string) {
  return Buffer.from(idInStr ?? uuid(), 'binary')
}

async function connect() {
  return open({
    filename: dbPath,
    driver: sqlite3.Database,
  })
}

export default await connect()

// const db = new sqlite.Database(dbPath, () => {
//   db.all(`
//     INSERT INTO users (id, role, email, password)
//     VALUES ($id, $role, $email, $password);
//   `, {
//     $id: Buffer.from(uuid(), 'binary'),
//     $role: 'admin',
//     $email: 'foo@bar.com',
//     $password: 'pwd',
//   }, (err, rows) => {
//     console.log('insert: ', rows)
//   })

//   db.all('SELECT * FROM users', (err, rows) => {
//     console.log(rows)
//   })
// })

import { Database } from 'better-sqlite3'
import fs from 'node:fs/promises'
import { join } from 'node:path'

const { dirname } = import.meta
const dir = join(dirname, '../migrations')

export async function readMigrationFiles() {
  const files = await fs.readdir(dir)
  files.sort()
  return Promise.all(
    files.map(f => fs.readFile(join(dir, f), 'utf-8')),
  )
}

export async function migrate(db: Database, version?: number) {
  let sql = await readMigrationFiles()
  let ver = await db.pragma('user_version', { simple: true }) as number
  if (typeof ver !== 'number') ver = 0
  sql = sql.slice(ver, version)
  for (let i = 0; i < sql.length; i += 1) {
    await db.exec(sql[i])
    await db.pragma(`user_version = ${i + 1}`)
  }
}

export default migrate

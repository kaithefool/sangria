import { Database } from 'better-sqlite3'
import fs from 'node:fs'
import { join } from 'node:path'

const { dirname } = import.meta
const dir = join(dirname, '../migrations')

export function readMigrationFiles() {
  const files = fs.readdirSync(dir)
  const sql: string[] = []
  files.sort()
  for (let i = 0; i < files.length; i += 1) {
    sql.push(fs.readFileSync(join(dir, files[i]), 'utf-8'))
  }
  return sql
}

export function migrate(db: Database, version?: number) {
  let sql = readMigrationFiles()
  let ver = db.pragma('user_version', { simple: true }) as number
  if (typeof ver !== 'number') ver = 0
  sql = sql.slice(ver, version)
  for (let i = 0; i < sql.length; i += 1) {
    db.exec(sql[i])
    db.pragma(`user_version = ${i + 1}`)
  }
}

export default migrate

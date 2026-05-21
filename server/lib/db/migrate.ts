import { type Database } from 'better-sqlite3'
import fs from 'node:fs'
import { join, basename } from 'node:path'

const { dirname } = import.meta
const dir = join(dirname, '../../migrations')

export function readMigrationFiles() {
  const files = fs.readdirSync(dir)
  const sql: string[] = []
  files.sort()
  for (const file of files) {
    sql.push(fs.readFileSync(join(dir, file), 'utf-8'))
  }
  return sql
}

export function migrate(db: Database, version?: number) {
  let sql = readMigrationFiles()
  let ver = db.pragma('user_version', { simple: true }) as number
  if (typeof ver !== 'number') ver = 0
  sql = sql.slice(ver, version)
  let i = ver
  for (const s of sql) {
    i += 1
    db.exec(s)
    db.pragma(`user_version = ${i}`)
  }
}

export function archive(dbPath: string, archiveDir: string) {
  const shmPath = dbPath + '-shm'
  const walPath = dbPath + '-wal'

  if (!fs.existsSync(dbPath)) return
  if (!fs.existsSync(archiveDir)) {
    fs.mkdirSync(archiveDir)
  }
  const ts = new Date().toISOString()
  const targetDir = join(archiveDir, ts)
  fs.mkdirSync(targetDir)
  fs.renameSync(dbPath, join(targetDir, basename(dbPath)))
  if (fs.existsSync(shmPath)) {
    fs.renameSync(shmPath, join(targetDir, basename(shmPath)))
  }
  if (fs.existsSync(walPath)) {
    fs.renameSync(walPath, join(targetDir, basename(walPath)))
  }
}

export default migrate

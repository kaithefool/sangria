import { v7 } from 'uuid'
import Database from 'better-sqlite3'
import { join } from 'node:path'
import fs from 'node:fs'
import q, { SqlQuery } from '../lib/query'
import catchUniqErr from '../lib/catchUniqErr'
import migrate from '../lib/migrate'

const { NODE_ENV } = process.env
const { dirname } = import.meta
const dbDir = join(dirname, '../../volumes/db')
const dbPath = join(dbDir, 'app.db')
const archiveDir = join(dbDir, 'archive')

export class Db extends Database {
  query(query: SqlQuery) {
    return this.prepare(query.sql).bind(query.values)
  }
}

export { q }
export { catchUniqErr }

export function uuid() {
  return v7()
}

export function archiveDb() {
  if (!fs.existsSync(dbPath)) return
  if (!fs.existsSync(archiveDir)) {
    fs.mkdirSync(archiveDir)
  }
  const ts = new Date().toISOString()
  fs.renameSync(dbPath, join(archiveDir, `${ts}.db`))
}

function connect() {
  if (NODE_ENV !== 'production') archiveDb()

  const db = new Db(dbPath)
  db.pragma('journal_mode = WAL')
  migrate(db)
  process.on('exit', () => db.close())
  return db
}

export default connect()

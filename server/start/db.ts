import { v7 } from 'uuid'
import Database from 'better-sqlite3'
import { join } from 'node:path'
import q from '../lib/query'
import migrate from '../lib/migrate'

const { dirname } = import.meta
const dbPath = join(dirname, '../../volumes/db/app.db')

export { q }

export function uuid() {
  return v7()
}

async function connect() {
  const db = new Database(dbPath)
  await db.pragma('journal_mode = WAL')
  await migrate(db)

  return db
}

export default await connect()

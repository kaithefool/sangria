import Db from 'better-sqlite3'
import { join } from 'node:path'
import { v7 } from 'uuid'
import catchUniqErr from '../lib/db/catchUniqErr.ts'
import { archive, migrate } from '../lib/db/migrate.ts'
import { buildQ } from '../lib/db/query/buildQ.ts'

const { NODE_ENV } = process.env
const { dirname } = import.meta
const dbDir = join(dirname, '../database')
const dbPath = join(dbDir, 'app.db')
const archiveDir = join(dbDir, 'archive')

export { catchUniqErr }

export function uuid() {
  return v7()
}

function connect() {
  if (NODE_ENV !== 'production') archive(dbPath, archiveDir)
  const db = new Db(dbPath)
  db.pragma('journal_mode = WAL')
  migrate(db)
  process.on('exit', () => db.close())
  return db
}

export const db = connect()
export const q = buildQ(db)

export default db

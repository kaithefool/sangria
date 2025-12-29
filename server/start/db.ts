import { v7 } from 'uuid'
import Database from 'better-sqlite3'
import { join } from 'node:path'
import q, { SqlQuery } from '../lib/query'
import catchUniqErr from '../lib/catchUniqErr'
import migrate from '../lib/migrate'

const { dirname } = import.meta
const dbPath = join(dirname, '../../volumes/db/app.db')

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

function connect() {
  const db = new Db(dbPath)
  db.pragma('journal_mode = WAL')
  migrate(db)
  process.on('exit', () => db.close())
  return db
}

export default connect()

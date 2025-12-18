import { v7 } from 'uuid'
import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import { join } from 'node:path'
import q from '../lib/query'

const { dirname } = import.meta
const dbPath = join(dirname, '../../volumes/db/app.db')

export { q }

export function uuid() {
  return v7()
}

async function connect() {
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  })
  await db.run('PRAGMA journal_mode=WAL;')
  await db.migrate({
    force: true,
    migrationsPath: join(dirname, '../migrations'),
  })
  return db
}

export default await connect()

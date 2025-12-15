import { v7 } from 'uuid'
import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import { join } from 'node:path'

const { dirname } = import.meta
const dbPath = join(dirname, '../../volumes/db/app.db')

export function uuid(idInStr?: string) {
  return Buffer.from(idInStr ?? v7(), 'binary')
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

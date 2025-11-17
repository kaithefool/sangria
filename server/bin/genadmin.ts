import * as readline from 'node:readline/promises'
import { stdin, stdout } from 'node:process'
import '../start/db'
import { createUsers } from '../services/servUsers'

const rl = readline.createInterface({ input: stdin, output: stdout })
const defaults = {
  email: 'admin@d.com',
  password: '123$5^7*(0',
}

async function run() {
  const email = await rl
    .question(`Email? [default: ${defaults.email}]`)
    || defaults.email
  const password = await rl
    .question(`Password? [default: ${defaults.password}]`)
    || defaults.password

  await createUsers({ role: 'admin', email, password })
  console.info(
    'Created admin user: ',
    `[email: ${email}, password: ${password}]`,
  )
  process.exit()
}

run()

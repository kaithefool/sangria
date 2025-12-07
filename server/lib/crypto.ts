import { scryptSync, randomBytes, timingSafeEqual } from 'node:crypto'

export function encryptPwd(password: string) {
  const salt = randomBytes(32).toString('hex')
  const hash = scryptSync(password, salt, 32).toString('hex')

  return hash + salt
}

export function verifyPwd(password: string, encrypted: string) {
  const salt = encrypted.slice(64)
  const hash = Buffer.from(encrypted.slice(0, 64), 'hex')
  const targetHash = scryptSync(password, salt, 32)

  return timingSafeEqual(targetHash, hash)
}

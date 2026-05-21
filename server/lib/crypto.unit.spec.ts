import { describe, it, expect } from 'vitest'
import { encryptPwd, verifyPwd } from './crypto.ts'

describe('crypto', () => {
  it('encrypts and verifies password', () => {
    const password = 'foo bar baz qux'
    const hashed = encryptPwd(password)

    expect(verifyPwd(password, hashed)).toBe(true)
    expect(verifyPwd(`${password} `, hashed)).toBe(false)
  })
})

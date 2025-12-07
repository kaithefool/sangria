import { describe, it, expect } from '@jest/globals'
import { encryptPwd, verifyPwd } from './crypto'

describe('crypto', () => {
  it('encrypts and verifies password', () => {
    const password = 'foo bar baz qux'
    const hashed = encryptPwd(password)

    expect(verifyPwd(password, hashed)).toBe(true)
    expect(verifyPwd(`${password} `, hashed)).toBe(false)
  })
})

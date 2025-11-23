import { describe, it, expect } from '@jest/globals'
import { encrypt, verify } from './crypto'

describe('crypto', () => {
  it('encrypts and verifies password', () => {
    const password = 'foo bar baz qux'
    const hashed = encrypt(password)

    expect(verify(password, hashed)).toBe(true)
    expect(verify(`${password} `, hashed)).toBe(false)
  })
})

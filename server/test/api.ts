import { expect } from '@jest/globals'
import { Response } from 'superagent'

export const apiRoot = process.argv
  .filter(a => a.match(/^--api=/))[0]
  ?.replace('--api=', '')
  ?? 'http://localhost:3000'

export function expectResJson(res: Response) {
  expect(res.headers['content-type']).toMatch(/application\/json/)
}

export function expectResCreated(
  res: Response, expected: Record<string, unknown>,
) {
  expectResJson(res)
  expect(typeof res.body?._id).toBe('string')
  expect(res.body).toMatchObject(expected)
}

export function expectResList(res: Response) {
  expectResJson(res)
  expect(typeof res.body?.total).toBe('number')
  expect(Array.isArray(res.body?.rows)).toBe(true)
}

export function expectResFoundOne(
  res: Response, expected: Record<string, unknown>,
) {
  expectResJson(res)
  expect(typeof res.body?._id).toBe('string')
  expect(res.body).toMatchObject(expected)
}

import request from 'superagent'
import { afterThis } from './hooks'
import { expect } from '@jest/globals'

export const root = process.argv
  .filter(a => a.match(/^--api=/))[0]
  ?.replace('--api=', '')
  ?? 'http://localhost:3000'

export const userApi = `${root}/api/users`

export async function setupTestUser(
  insert: { role: string, email: string, password: string },
) {
  const res = await request.post(userApi).send(insert)
  expect(res.headers['content-type']).toMatch('application/json')
  expect(res.status).toBe(200)
  expect(typeof res.body?.id).toBe('string')
  afterThis(() => request.delete(`${userApi}/${res.body.id}`))
}

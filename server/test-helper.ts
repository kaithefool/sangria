import { afterEach, expect } from '@jest/globals'
import request, { Request, Response, ResponseError } from 'superagent'

const { argv } = process

export const apiRoot = argv
  .filter(a => a.match(/^--api=/))[0]
  ?.replace('--api=', '')
  ?? 'http://localhost:3000'

const afterThisStack: {
  [x: string]: Array<() => void>
} = {}

function getTestId() {
  const s = expect.getState()
  return `${s.testPath}:${s.currentTestName}`
}

afterEach(async () => {
  const stack = afterThisStack[getTestId()]
  if (stack !== undefined) {
    const s = [...stack].reverse()
    for (const fn of s) {
      await fn()
    }
  }
})

export function afterThis(fn: () => void) {
  const testId = getTestId()
  afterThisStack[testId] = [
    ...afterThisStack[testId] ?? [],
    fn,
  ]
}

export function expectJson(res: Response) {
  expect(res.headers['content-type']).toMatch(/application\/json/)
}

export async function expectOk(req: Request, status: number = 200) {
  const res = await req
  expect(res.status).toBe(status)
  return res
}

export async function expectErr(req: Request, status: number = 400) {
  expect.assertions(1)
  try {
    await req
  }
  catch (e) {
    const err = e as ResponseError
    expect(err.status).toBe(status)
    return err
  }
}

export async function expectOkCreate(req: Request) {
  let id: string | undefined = undefined
  afterThis(async () => {
    if (id !== undefined) {
      await request.delete(`${apiRoot}/api/users/${id}`)
    }
  })
  const res = await expectOk(req)
  expectJson(res)
  expect(typeof res.body?._id).toBe('string')
  id = res.body._id
  return res
}

export async function expectOkFindOne(
  req: Request, expected: Record<string, unknown>,
) {
  const res = await expectOk(req)
  expectJson(res)
  expect(typeof res.body?._id).toBe('string')
  expect(res.body).toMatchObject(expected)
  return res
}

export async function expectOkDelete(req: Request) {
  const res = await expectOk(req)
}

export async function expectOkList(req: Request) {
  const res = await expectOk(req)
  expectJson(res)
  expect(Array.isArray(res.body?.rows)).toBe(true)
  expect(typeof res.body?.total).toBe('number')
  return res
}

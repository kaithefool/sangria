import { expect } from '@jest/globals'
import { Request, Response, ResponseError } from 'superagent'
import { afterThis } from './thisHooks'

export const apiRoot = process.argv
  .filter(a => a.match(/^--api=/))[0]
  ?.replace('--api=', '')
  ?? 'http://localhost:3000'

export function expectJson(res: Response) {
  expect(res.headers['content-type']).toMatch(/application\/json/)
}

export async function expectOk(
  req: Request | Promise<Response>, status: number = 200,
) {
  const res = await req
  expect(res.status).toBe(status)
  return res
}

export async function expectErr(
  req: Request | Promise<Response>, status: number = 400,
) {
  let error: ResponseError | undefined = undefined
  try {
    await req
  }
  catch (e) {
    error = e as ResponseError
  }
  expect(error).not.toBeUndefined()
  expect(error?.status).toBe(status)
  return error
}

export async function expectOkCreate(
  req: Request, teardown?: (id: string) => void,
) {
  let id: string | undefined = undefined
  if (teardown !== undefined) {
    afterThis(async () => {
      if (id !== undefined) {
        await teardown(id)
      }
    })
  }
  const res = await expectOk(req)
  expectJson(res)
  expect(typeof res.body?._id).toBe('string')
  id = res.body._id
  return res
}

export async function expectErrCreate(
  req: Request,
  status: number = 400,
  teardown?: (id: string) => void,
) {
  let id: string | undefined = undefined
  if (teardown !== undefined) {
    afterThis(async () => {
      if (id !== undefined) {
        await teardown(id)
      }
    })
  }
  await expectErr((async () => {
    const res = await req
    if (typeof res.body?._id) {
      id = res.body._id
    }
    return res
  })(), status)
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

export async function expectOkList(req: Request) {
  const res = await expectOk(req)
  expectJson(res)
  expect(Array.isArray(res.body?.rows)).toBe(true)
  expect(typeof res.body?.total).toBe('number')
  return res
}

export async function expectOkPatch(req: Request) {
  return await expectOk(req)
}

export async function expectOkDelete(req: Request) {
  return await expectOk(req)
}

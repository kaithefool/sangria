import { describe, expect, it } from 'vitest'
import type { Request, RequestHandler, Response } from 'express'
import createHttpError from 'http-errors'
import { unchain } from './helpers.ts'

describe('unchain middleware func', () => {
  const req = {} as Request
  const res = {} as Response

  it('accepts both sync & async request handler', async () => {
    const syncRh: RequestHandler = (_req, _res, next) => next()
    const asyncRh: RequestHandler = async (_req, _res, next) => next()

    expect(await unchain(syncRh)(req, res)).toMatchObject({
      err: undefined,
      end: false,
    })
    expect(await unchain(asyncRh)(req, res)).toMatchObject({
      err: undefined,
      end: false,
    })
  })
  it('returns error if next func is called with parameter', async () => {
    const err = createHttpError(400, 'fake-err')
    const syncRh: RequestHandler = (_req, _res, next) => next(err)
    const asyncRh: RequestHandler = async (_req, _res, next) => next(err)

    expect(await unchain(syncRh)(req, res)).toMatchObject({ err, end: true })
    expect(await unchain(asyncRh)(req, res)).toMatchObject({ err, end: true })
  })
  it("returns end as true if next func hasn't be called", async () => {
    const syncRh: RequestHandler = () => {}
    const asyncRh: RequestHandler = async () => {}

    expect(await unchain(syncRh)(req, res)).toMatchObject({
      err: undefined,
      end: true,
    })
    expect(await unchain(asyncRh)(req, res)).toMatchObject({
      err: undefined,
      end: true,
    })
  })
})

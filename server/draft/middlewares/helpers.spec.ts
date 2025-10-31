import { describe, it, expect } from '@jest/globals'
import { unchain } from './helpers'
import { Request, RequestHandler, Response } from 'express'
import createHttpError from 'http-errors'

describe('unchain middleware func', () => {
  const req = {} as Request
  const res = {} as Response

  it('accepts both sync & async request handler', async () => {
    const syncRh: RequestHandler = (req, res, next) => next()
    const asyncRh: RequestHandler = async (req, res, next) => next()

    expect(await unchain(syncRh)(req, res)).toEqual([undefined, false])
    expect(await unchain(asyncRh)(req, res)).toEqual([undefined, false])
  })
  it('returns error if next func is called with parameter', async () => {
    const err = createHttpError(400, 'fake-err')
    const syncRh: RequestHandler = (req, res, next) => next(err)
    const sOut = await unchain(syncRh)(req, res)
    const asyncRh: RequestHandler = async (req, res, next) => next(err)
    const aOut = await unchain(asyncRh)(req, res)

    expect(sOut[0]).toMatchObject(err)
    expect(sOut[1]).toBe(true)
    expect(aOut[0]).toMatchObject(err)
    expect(aOut[1]).toBe(true)
  })
  it('returns end as true if next func hasn\'t be called', async () => {
    const syncRh: RequestHandler = () => {}
    const asyncRh: RequestHandler = async () => {}

    expect(await unchain(syncRh)(req, res)).toEqual([undefined, true])
    expect(await unchain(asyncRh)(req, res)).toEqual([undefined, true])
  })
})

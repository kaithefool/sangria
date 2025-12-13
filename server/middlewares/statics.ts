import express, { RequestHandler } from 'express'
import { join } from 'node:path'
import { unchain } from './helpers'
import createHttpError from 'http-errors'

export default function statics(...path: string[]): RequestHandler {
  return async (req, res, next) => {
    const { end } = await unchain(
      express.static(join(...path)),
    )(req, res)

    if (!end) return next(createHttpError(404))
  }
}

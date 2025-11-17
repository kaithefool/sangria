import express, { RequestHandler } from 'express'
import path from 'node:path'
import { unchain } from './helpers'
import createHttpError from 'http-errors'

export default function statics(...paths: string[]): RequestHandler {
  return async (req, res, next) => {
    const { end } = await unchain(
      express.static(path.resolve(...paths)),
    )(req, res)

    if (!end) return next(createHttpError(404))
  }
}

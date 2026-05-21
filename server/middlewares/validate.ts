import type { RequestHandler, Response } from 'express'
import createHttpError from 'http-errors'
import * as z from 'zod'

export function getValidInput<S extends z.ZodObject>(
  res: Response,
  schema: S,
): z.output<S> | undefined {
  const { locals } = res
  if (
    !(
      'input' in locals &&
      'inputSchema' in locals &&
      locals.inputSchema === schema
    )
  ) {
    return undefined
  }
  return locals.input as z.output<typeof schema>
}

export function assertValidInput<S extends z.ZodObject>(
  res: Response,
  schema: S,
): z.output<S> {
  const input = getValidInput(res, schema)
  if (input === undefined) {
    throw new Error('unmatched input schema')
  }
  return input
}

export default function validate(schema: z.ZodObject): RequestHandler {
  return ({ query, params, body }, { locals }, next) => {
    try {
      locals.input = schema.parse({
        query,
        params,
        body,
      })
      locals.inputSchema = schema
      return next()
    } catch (err) {
      return next(createHttpError(400, 'invalidInput', { zod: err }))
    }
  }
}

export function sort<const K extends string[]>(keys: K) {
  return z.record(z.literal(keys), z.literal([1, -1])).optional()
}

export function skip() {
  return z.number().positive().optional()
}

export function limit(max: number = 20) {
  return z.number().positive().max(max).optional()
}

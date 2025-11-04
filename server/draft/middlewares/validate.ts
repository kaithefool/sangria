import { RequestHandler, Response } from 'express'
import createHttpError from 'http-errors'
import * as z from 'zod'

const cfOpMap = {
  eq: '$eq',
  in: '$in',
  nin: '$nin',
  gt: '$gt',
  gte: '$gte',
  lt: '$lt',
  lte: '$lte',
}

export type CfOp = keyof typeof cfOpMap

export function transformCfOp(allow: CfOp[]) {

}

export function getValidInput<S extends z.ZodObject>(
  res: Response, schema: S,
): z.output<S> | undefined {
  const { locals } = res
  if (!(
    'input' in locals
    && 'inputSchema' in locals
    && locals.inputSchema === schema
  )) {
    return undefined
  }
  return locals.input as z.output<typeof schema>
}

export function assertValidInput<S extends z.ZodObject>(
  res: Response, schema: S,
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
        query, params, body,
      })
      locals.inputSchema = schema
      return next()
    }
    catch (err) {
      return next(createHttpError(400, 'invalidInput', { zod: err }))
    }
  }
}

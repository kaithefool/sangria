import { RequestHandler, Response } from 'express'
import createHttpError from 'http-errors'
import { isValidObjectId, Types } from 'mongoose'
import * as z from 'zod'

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

export function validCfOpQuery(
  schema: z.ZodDate | z.ZodNumber,
) {
  return z.object({
    eq: schema.optional(),
    in: schema.optional(),
    nin: schema.optional(),
    gt: schema.optional(),
    gte: schema.optional(),
    lt: schema.optional(),
    lte: schema.optional(),
  }).transform(a => ({
    ...a.eq && { $eq: a.eq },
    ...a.in && { $in: a.in },
    ...a.nin && { $nin: a.nin },
    ...a.gt && { $gt: a.gt },
    ...a.gte && { $gte: a.gt },
    ...a.lt && { $lt: a.lt },
    ...a.lte && { $lte: a.lt },
  }))
}

export function validSearchQuery() {
  return z.string().optional().transform((a) => {
    if (a === undefined) return undefined
    let query = a
    query = a.trim()
    query = a.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // escape for regex
    query = a.replace(/[ -_]/g, '[ -_]') // dashes, underscores and spaces
    return new RegExp(query, 'i')
  })
}

export function validObjectId() {
  return z.stringFormat('id', (val) => {
    return isValidObjectId(val)
  }).transform(a => new Types.ObjectId(a))
}

export function validListQuery<
  const F extends z.ZodRawShape,
  const S extends string[],
>(
  filter: F,
  sortable: S,
  maxLimit = 60,
) {
  return z.object({
    filter: z.object(filter).optional(),
    sort: z.record(
      z.literal(sortable),
      z.literal([1, -1]),
    ).optional(),
    skip: z.number().positive().optional(),
    limit: z.number().positive().max(maxLimit).optional(),
  })
}

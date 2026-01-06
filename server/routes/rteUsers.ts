import { Router } from 'express'
import z from 'zod'
import validate, * as v from '../middlewares/validate'
import * as servUsers from '../services/servUsers'
import createHttpError from 'http-errors'

const rteUsers = Router()

const listSchema = z.object({
  query: z.object({
    filter: z.object({
      active: z.boolean().optional(),
    }).optional(),
    sort: v.sort(['role', 'email', 'created_at', 'updated_at']),
    skip: v.skip(),
    limit: v.limit(),
  }),
})
rteUsers.get(
  '/',
  validate(listSchema),
  (req, res) => {
    const { query } = v.assertValidInput(res, listSchema)
    const out = servUsers.listUsers(query)
    return res.json(out)
  },
)

const findByIdSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
})
rteUsers.get(
  '/:id',
  validate(findByIdSchema),
  async (req, res) => {
    const { params: { id } } = v.assertValidInput(res, findByIdSchema)
    const out = servUsers.findUser(id)
    if (out === undefined) throw createHttpError(404)
    return res.json(out)
  },
)

const createSchema = z.object({
  body: servUsers.userSchema,
})
rteUsers.post(
  '/',
  validate(createSchema),
  (req, res, next) => {
    const { body } = v.assertValidInput(res, createSchema)
    const [err, out] = servUsers.createUsers(body)
    if (err) return next(createHttpError(400, 'uniq-key-error', {
      reason: err.col,
    }))
    return res.json(out)
  },
)

const patchSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: servUsers.userSchema.partial(),
})
rteUsers.patch(
  '/:_id',
  validate(patchSchema),
  (req, res, next) => {
    const { params: { id }, body } = v.assertValidInput(res, patchSchema)
    const [err] = servUsers.patchUsers({ id }, body)
    if (err) return next(createHttpError(400, 'uniq-key-error', {
      reason: err.col,
    }))
    return res.end()
  },
)

const deleteSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
})
rteUsers.delete(
  '/:_id',
  validate(deleteSchema),
  (req, res) => {
    const { params: { id } } = v.assertValidInput(res, deleteSchema)
    servUsers.deleteUsers({ id })
    return res.end()
  },
)

export default rteUsers

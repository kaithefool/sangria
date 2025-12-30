import { Router } from 'express'
import z from 'zod'
import validate, {
  assertValidInput, validListQuery, validObjectId,
  validSearchQuery,
} from '../middlewares/validate'
import {
  createUsers, deleteUsers, findUser, listUsers, patchUsers,
  userSchema,
} from '../services/servUsers'
import createHttpError from 'http-errors'

const rteUsers = Router()

const listSchema = z.object({
  query: validListQuery({
    active: z.boolean().optional(),
    search: validSearchQuery().optional(),
  }, ['email']),
})
rteUsers.get(
  '/',
  validate(listSchema),
  async (req, res) => {
    const { query } = assertValidInput(res, listSchema)
    const out = await listUsers(query)
    return res.json(out)
  },
)

const findByIdSchema = z.object({
  params: z.object({
    _id: validObjectId(),
  }),
})
rteUsers.get(
  '/:_id',
  validate(findByIdSchema),
  async (req, res) => {
    const { params } = assertValidInput(res, findByIdSchema)
    const out = await findUser({ _id: params._id })
    if (out === null) throw createHttpError(404)

    return res.json(out)
  },
)

const createSchema = z.object({
  body: userSchema,
})
rteUsers.post(
  '/',
  validate(createSchema),
  async (req, res, next) => {
    const { body } = assertValidInput(res, createSchema)
    const [dupErr, out] = await createUsers(body)
    if (dupErr) return next(createHttpError(400, 'duplicate-key', {
      reason: dupErr.keyValue,
    }))
    return res.json(out)
  },
)

const patchSchema = z.object({
  params: z.object({
    _id: validObjectId(),
  }),
  body: userSchema.partial(),
})
rteUsers.patch(
  '/:_id',
  validate(patchSchema),
  async (req, res, next) => {
    const { params, body } = assertValidInput(res, patchSchema)
    const [dupErr] = await patchUsers({ _id: params._id }, body)
    if (dupErr) return next(createHttpError(400, 'duplicate-key', {
      reason: dupErr.keyValue,
    }))
    return res.end()
  },
)

const deleteSchema = z.object({
  params: z.object({
    _id: validObjectId(),
  }),
})
rteUsers.delete(
  '/:_id',
  validate(deleteSchema),
  async (req, res) => {
    const { params } = assertValidInput(res, deleteSchema)
    await deleteUsers({ _id: params._id })
    return res.end()
  },
)

export default rteUsers

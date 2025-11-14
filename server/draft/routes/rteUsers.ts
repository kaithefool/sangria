import { Router } from 'express'
import z from 'zod'
import validate, {
  assertValidInput, validListQuery, validObjectId,
  validSearchQuery,
} from '../middlewares/validate'
import { authorize } from '../middlewares/authorize'
import {
  createUsers, deleteUsers, findUser, listUsers, patchUsers,
} from '../services/servUsers'

const rteUsers = Router()

rteUsers.use(authorize(['admin']))

const listSchema = z.object({
  query: validListQuery({
    active: z.boolean().optional(),
    search: validSearchQuery().optional(),
  }, ['email']),
})
rteUsers.get(
  '/',
  validate(listSchema),
  async (req, res, next) => {
    const { query } = assertValidInput(res, listSchema)
    res.locals.out = await listUsers(query)
    return next()
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
  async (req, res, next) => {
    const { params } = assertValidInput(res, findByIdSchema)
    res.locals.out = await findUser({ _id: params._id })
    return next()
  },
)

const createSchema = z.object({
  body: z.object({
    email: z.email(),
    password: z.string().min(8),
  }),
})
rteUsers.post(
  '/',
  validate(createSchema),
  async (req, res, next) => {
    const { body } = assertValidInput(res, createSchema)
    res.locals.out = await createUsers(body)
    return next()
  },
)

const patchSchema = z.object({
  params: z.object({
    _id: validObjectId(),
  }),
  body: z.object({
    email: z.email().optional(),
    password: z.string().min(8).optional(),
  }),
})
rteUsers.post(
  '/:_id',
  validate(patchSchema),
  async (req, res, next) => {
    const { params, body } = assertValidInput(res, patchSchema)
    await patchUsers({ _id: params._id }, body)
    return next()
  },
)

const deleteSchema = z.object({
  params: z.object({
    _id: validObjectId(),
  }),
})
rteUsers.get(
  '/:_id',
  validate(deleteSchema),
  async (req, res, next) => {
    const { params } = assertValidInput(res, deleteSchema)
    await deleteUsers({ _id: params._id })
    return next()
  },
)

export default rteUsers

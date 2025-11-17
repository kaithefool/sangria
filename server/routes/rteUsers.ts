import { Router } from 'express'
import z from 'zod'
import validate, {
  assertValidInput, validListQuery, validObjectId,
  validSearchQuery,
} from '../middlewares/validate'
import {
  createUsers, deleteUsers, findUser, listUsers, patchUsers,
} from '../services/servUsers'

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
    return res.json(out)
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
  async (req, res) => {
    const { body } = assertValidInput(res, createSchema)
    const out = await createUsers(body)
    return res.json(out)
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
rteUsers.patch(
  '/:_id',
  validate(patchSchema),
  async (req, res) => {
    const { params, body } = assertValidInput(res, patchSchema)
    await patchUsers({ _id: params._id }, body)
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

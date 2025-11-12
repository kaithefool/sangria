import { Router } from 'express'
import validate, {
  assertValidInput, validListQuery, validObjectId,
} from '../middlewares/validate'
import z from 'zod'
import { authorize } from '../middlewares/authorize'
import { findUser, listUsers } from '../services/servUsers'

const router = Router()

const listSchema = z.object({
  query: validListQuery({
    active: z.boolean().optional(),
  }, ['email']),
})
router.get(
  '/',
  authorize(['admin']),
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
router.get(
  '/:_id',
  authorize(['admin']),
  async (req, res, next) => {
    const { params } = assertValidInput(res, findByIdSchema)
    res.locals.out = await findUser({ _id: params._id })
    return next()
  },
)

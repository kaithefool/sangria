import { Router } from 'express'
import validate, { assertValidInput } from '../middlewares/validate'
import z from 'zod'
import { userValidSchema } from '../services/servUsers'
import { authorize } from '../middlewares/authorize'
import { login } from '../services/servAuth'

const rteAuth = Router()

const loginSchema = z.object({
  body: userValidSchema.pick({ email: true, password: true }),
})
rteAuth.post(
  '/login',
  authorize('guest'),
  validate(loginSchema),
  async (req, res) => {
    const { body } = assertValidInput(res, loginSchema)
    login(body)
  },
)

export default rteAuth

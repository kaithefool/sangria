import { Router } from 'express'
import validate from '../middlewares/validate'
import z from 'zod'
import { userValidSchema } from '../services/servUsers'

const rteAuth = Router()

const loginSchema = z.object({
  body: userValidSchema.pick({ email: true, password: true }),
})
rteAuth.post(
  '/login',
  validate(loginSchema),
)

export default rteAuth

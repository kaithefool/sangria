import { Router } from 'express'
import validate, { assertValidInput } from '../middlewares/validate'
import z from 'zod'
import { userValidSchema } from '../services/servUsers'
import { authorize } from '../middlewares/authorize'
import { login, logout } from '../services/servAuth'
import { getJwtUser, setAuthnCookies } from '../middlewares/authenticate'

const rteAuth = Router()

const loginSchema = z.object({
  body: z.object({
    cookies: z.boolean().optional(),
    persist: z.boolean().optional(),
    ...userValidSchema
      .pick({ email: true, password: true })
      .shape,
  }),
})
rteAuth.post(
  '/login',
  authorize('guest'),
  validate(loginSchema),
  async (req, res) => {
    const {
      body: { persist = false, cookies = false, ...cred },
    } = assertValidInput(res, loginSchema)
    const authTokens = await login(cred, persist)
    if (cookies) {
      setAuthnCookies(res, authTokens)
      return res.end()
    }
    return res.json(authTokens)
  },
)

rteAuth.post(
  '/logout',
  async (req, res) => {
    const jwtUser = getJwtUser(res)
    if (jwtUser) {
      await logout(jwtUser._id)
    }
    return res.end()
  },
)

export default rteAuth

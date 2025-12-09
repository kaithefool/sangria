import { Router } from 'express'
import validate, { assertValidInput } from '../middlewares/validate'
import z from 'zod'
import { userValidSchema } from '../services/servUsers'
import { authorize } from '../middlewares/authorize'
import { login, logout, refreshTokens } from '../services/servAuth'
import { clearAuthnCookies, getAuthnCookies, getJwtUser, setAuthnCookies } from '../middlewares/authenticate'
import createHttpError from 'http-errors'

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
  async (req, res, next) => {
    const {
      body: { persist = false, cookies = false, ...cred },
    } = assertValidInput(res, loginSchema)
    const { err, authTokens } = await login(cred, persist)
    if (err) return next(createHttpError(400, err))
    if (cookies) {
      setAuthnCookies(res, authTokens, { persist })
      return res.end()
    }
    return res.json(authTokens)
  },
)

const refreshSchema = z.object({
  body: z.object({
    refresh: z.string(),
  }),
})
rteAuth.post(
  '/refresh',
  validate(refreshSchema),
  async (req, res, next) => {
    const { body: { refresh } } = assertValidInput(res, refreshSchema)
    const { err, authTokens } = await refreshTokens(refresh)
    if (err) return next(createHttpError(400, err))
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
    const ac = getAuthnCookies(req)
    if (ac.access || ac.refresh) {
      clearAuthnCookies(res)
    }
    return res.end()
  },
)

rteAuth.get(
  '/ping',
  (req, res) => {
    const jwtUser = getJwtUser(res)
    return res.json(jwtUser)
  },
)

export default rteAuth

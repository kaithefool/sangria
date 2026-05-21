import { Router } from 'express'
import handleErr from '../../middlewares/handleErr.ts'
import rteUsers from './rteUsers.ts'
import rteAuth from './rteAuth.ts'
import createHttpError from 'http-errors'

const rteApi = Router()

rteApi.use('/users', rteUsers)
rteApi.use('/auth', rteAuth)

rteApi.use((_req, _res, next) => next(createHttpError(404)))
rteApi.use(handleErr('json'))

export default rteApi

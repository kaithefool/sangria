import { Router } from 'express'
import handleErr from '../../middlewares/handleErr.ts'
import rteUsers from './rteUsers.ts'
import rteAuth from './rteAuth.ts'

const routes = Router()

routes.use('/api/users', rteUsers)
routes.use('/api/auth', rteAuth)

routes.use(handleErr('json'))

export default routes

import { Router } from 'express'
import { authenticate } from '../middlewares/authenticate'
import i18n from '../middlewares/i18n'
import handleErr from '../middlewares/handleErr'
import rteUsers from './rteUsers'
import rteAuth from './rteAuth'

const routes = Router()
routes.use(authenticate())
routes.use(i18n)

routes.use('/api/users', rteUsers)
routes.use('/api/auth', rteAuth)

routes.use(handleErr('json'))

export default routes

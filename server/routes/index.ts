import { Router } from 'express'
import { authenticate } from '../middlewares/authenticate'
import rteUsers from './rteUsers'
import i18n from '../middlewares/i18n'
import handleErr from '../middlewares/handleErr'

const routes = Router()
routes.use(authenticate())
routes.use(i18n)

routes.use('/api/users', rteUsers)

routes.use(handleErr('json'))

export default routes

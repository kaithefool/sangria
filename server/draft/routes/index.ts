import { Router } from 'express'
import { authenticate } from '../middlewares/authenticate'
import rteUsers from './rteUsers'

const routes = Router()

routes.use(authenticate())
routes.use('/api/users', rteUsers)

export default routes

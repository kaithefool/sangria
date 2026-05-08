import { Router } from 'express'
import { authenticate } from '../middlewares/authenticate.ts'
import i18n from '../middlewares/i18n.ts'
import handleErr from '../middlewares/handleErr.ts'

const routes = Router()

routes.use(authenticate())
routes.use(i18n)

// routes.use('/api')

routes.use(handleErr('html'))

export default routes

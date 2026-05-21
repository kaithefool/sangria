import { Router } from 'express'
import { authenticate } from '../middlewares/authenticate.ts'
import i18n from '../middlewares/i18n.ts'
import rteApi from './api/rteApi.ts'
import rteHtml from './html/rteHtml.ts'

const rteRoot = Router()

rteRoot.use(authenticate())
rteRoot.use(i18n)

rteRoot.use('/api', rteApi)
rteRoot.use('/', rteHtml)

export default rteRoot

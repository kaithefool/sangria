import cookieParser from 'cookie-parser'
import express from 'express'
import morgan from 'morgan'
import { nanoid } from 'nanoid'
import { join } from 'path'
import qs from 'qs'
import handleErr from './middlewares/handleErr.ts'
import statics from './middlewares/statics.ts'
import rteRoot from './routes/rteRoot.ts'
import './start/db.ts'

const { dirname } = import.meta
const { COOKIE_SECRET = nanoid(32) } = process.env
const app = express()

app.set('view engine', 'hbs')
app.set('views', join(dirname, 'views'))
app.set('query parser', (str: string) =>
  qs.parse(str, { strictNullHandling: true }),
)

app.use(morgan('dev'))
app.use(cookieParser(COOKIE_SECRET))
app.use('/locales', statics(dirname, 'locales'))
app.use('/uploads', statics(dirname, 'uploads'))
app.use('/assets', statics(dirname, 'assets'))
app.use(express.urlencoded())
app.use(express.json())
app.use(rteRoot)
app.use(handleErr('html'))

export default app

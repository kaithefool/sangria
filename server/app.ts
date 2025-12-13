import express from 'express'
import { join } from 'path'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import qs from 'qs'
import './start'
import statics from './middlewares/statics'
import routes from './routes'
import { nanoid } from 'nanoid'

const { dirname } = import.meta
const {
  COOKIE_SECRET = nanoid(32),
} = process.env
const app = express()

app.set('view engine', 'hbs')
app.set('views', join(dirname, 'views'))
app.set(
  'query parser',
  (str: string) => qs.parse(str, { strictNullHandling: true }),
)

app.use(morgan('dev'))
app.use(cookieParser(COOKIE_SECRET))
app.use('/locales', statics(dirname, 'locales'))
app.use('/uploads', statics(dirname, 'uploads'))
app.use('/assets', statics(dirname, 'assets'))
app.use(express.urlencoded())
app.use(express.json())
app.use(routes)

export default app

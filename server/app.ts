import express from 'express'
import path from 'path'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import qs from 'qs'
import './start'
import statics from './middlewares/statics'
import routes from './routes'

const app = express()

app.set('view engine', 'hbs')
app.set('views', path.join(__dirname, 'views'))
app.set(
  'query parser',
  (str: string) => qs.parse(str, { strictNullHandling: true }),
)

app.use(morgan('dev'))
app.use(cookieParser())
app.use('/locales', statics(__dirname, 'locales'))
app.use('/uploads', statics(__dirname, 'uploads'))
app.use('/assets', statics(__dirname, 'assets'))
app.use(express.urlencoded())
app.use(express.json())
app.use(routes)

export default app

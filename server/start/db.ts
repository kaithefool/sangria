import mongoose from 'mongoose'
import { name } from '../package.json'

const {
  MONGO_URI = `mongodb://localhost:27017/${name}`,
  MONGO_AUTO_INDEX = '1',
} = process.env

mongoose.set('strictQuery', true)

const db = mongoose.connect(MONGO_URI, {
  autoIndex: MONGO_AUTO_INDEX === '1',
})

export default db

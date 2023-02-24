import dotenv from 'dotenv'
import express, { type ErrorRequestHandler } from 'express'
import morgan from 'morgan'
import authRouter from './routes/auth'
import initializeSession from './session'

dotenv.config()

const app = express()

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'))
}

app.use(express.json())
app.use(initializeSession)

app.get('/', (req, res) => res.send('Hello, world!'))
app.use('/auth', authRouter)

app.use(((error, req, res, next) => {
  console.error(error)
  res.status(500).send({ error })
}) as ErrorRequestHandler)

export default app

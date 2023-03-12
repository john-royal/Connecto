import dotenv from 'dotenv'
import express, { type ErrorRequestHandler } from 'express'
import helmet from 'helmet'
import { createServer } from 'http'
import morgan from 'morgan'
import * as authController from './controllers/auth'
import initializeSession from './lib/session'
import io from './lib/socket'

dotenv.config()

const app = express()

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'))
}

app.use(express.json())
app.use(initializeSession)
app.use(helmet())

app.get('/', (req, res) => res.send('Hello, world!'))
app.post('/auth/register', authController.register)
app.post('/auth/login', authController.login)
app.get('/auth/session', authController.session)
app.get('/auth/logout', authController.logout)

app.use(((error, req, res, next) => {
  console.error(error)
  res.status(500).send({ error })
}) as ErrorRequestHandler)

const server = createServer(app)
io.attach(server)

export default server

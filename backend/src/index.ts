import dotenv from 'dotenv'
import express, { type ErrorRequestHandler } from 'express'
import helmet from 'helmet'
import { createServer } from 'http'
import morgan from 'morgan'
import { Server } from 'socket.io'
import { type Message } from './prisma'
import authRouter from './routes/auth'
import initializeSession from './session'

dotenv.config()

const app = express()

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'))
}

app.use(express.json())
app.use(initializeSession)
app.use(helmet())

app.use((req, res, next) => {
  // TODO: Make this a little more elegant.

  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  next()
})

app.get('/', (req, res) => res.send('Hello, world!'))
app.use('/auth', authRouter)

app.use(((error, req, res, next) => {
  console.error(error)
  res.status(500).send({ error })
}) as ErrorRequestHandler)

const server = createServer(app)
const io = new Server(server)

io.on('connection', (socket) => {
  console.log('Client connected')

  socket.on('message', (message: Message) => {
    console.log(`Message received:`, message)
    io.emit('message', message) // broadcast to all clients
  })

  socket.on('disconnect', () => {
    console.log('Client disconnected')
  })
})

export default server

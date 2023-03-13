import dotenv from 'dotenv'
import express from 'express'
import { createServer } from 'http'
import io from './lib/socket'
import router from './routes'

dotenv.config()

const app = express()
app.use(router)

const server = createServer(app)
io.attach(server)

export default server

/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { type NextFunction, type Request, type Response } from 'express'
import { Server } from 'socket.io'
import type { Message } from './prisma'
import prisma from './prisma'
import { session, helpers } from './session'

const io = new Server()

io.use((socket, next) => {
  session(socket.request as Request, {} as Response, next as NextFunction)
})

io.use((socket, next) => {
  helpers(socket.request as Request, {} as Response, next as NextFunction)
})

io.on('connection', (socket) => {
  console.log('Client connected: ', (socket.request as Request).user)

  socket.on('join', async (id: string) => {
    const thread = await prisma.thread.findUnique({ where: { id: Number(id) } })
    if (thread == null) {
      socket.emit('error', { message: 'Thread not found' })
    } else if (
      thread.customerId !== (socket.request as Request).session.userId
    ) {
      socket.emit('error', { message: 'Unauthorized' })
    } else {
      await socket.join(id)
      socket.emit('joined', id)
    }
  })

  socket.on('message', (message: Message) => {
    console.log(`Message received:`, message)
    io.emit('message', message) // broadcast to all clients
  })

  socket.on('disconnect', () => {
    console.log('Client disconnected')
  })
})

export default io

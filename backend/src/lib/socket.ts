/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { type NextFunction, type Request, type Response } from 'express'
import { Server } from 'socket.io'
import prisma from './prisma'
import { helpers, session } from './session'

const io = new Server()

for (const middleware of [session, helpers]) {
  io.use((socket, next) => {
    middleware(socket.request as Request, {} as Response, next as NextFunction)
  })
}

io.on('connection', (socket) => {
  const user = (socket.request as Request).user
  let threadId: number | undefined

  socket.on('join', async ({ id }: { id: number }) => {
    const thread = await prisma.thread.findUnique({
      select: { customerId: true },
      where: { id }
    })
    if (thread == null) {
      socket.emit('error', { message: 'Thread not found' })
    } else if (
      user == null ||
      (user?.id !== thread.customerId && !user.isAdmin)
    ) {
      socket.emit('error', { message: 'Unauthorized' })
    } else {
      threadId = id
      await socket.join(threadId.toString())
      socket.emit('joined', { id })
    }
  })

  // leave the thread
  socket.on('leave', async () => {
    if (threadId == null) return
    await socket.leave(threadId.toString())
    threadId = undefined
    socket.emit('left', '')
  })

  socket.on(
    'message',
    async ({
      content,
      attachmentUrl,
      latitude,
      longitude
    }: {
      content: string
      attachmentUrl?: string
      latitude?: number
      longitude?: number
    }) => {
      console.log('Message received: ', {
        content,
        attachmentUrl,
        latitude,
        longitude
      })
      if (user == null || threadId == null) {
        socket.emit('error', { message: 'Unauthorized' })
        return
      }
      await prisma.message.create({
        data: {
          content,
          attachmentUrl,
          latitude,
          longitude,
          thread: { connect: { id: threadId } },
          user: {
            connect: { id: user.id }
          }
        },
        include: { user: true }
      })
    }
  )

  socket.on('typing', () => {
    if (threadId == null) return
    socket.to(threadId.toString()).emit('typing', user)
  })

  socket.on('stop typing', () => {
    if (threadId == null) return
    socket.to(threadId.toString()).emit('stop typing', user)
  })

  socket.on('disconnect', () => {
    console.log('Client disconnected')
  })
})

export default io

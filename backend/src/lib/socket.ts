/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { type NextFunction, type Request, type Response } from 'express'
import { Server } from 'socket.io'
import prisma from './prisma'
import { helpers, session } from './session'
import fetch from 'isomorphic-unfetch'

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

  socket.on('message', async (content: string) => {
    console.log('Message received: ', content)
    if (user == null || threadId == null) {
      socket.emit('error', { message: 'Unauthorized' })
      return
    }
    const message = await prisma.message.create({
      data: {
        content,
        thread: { connect: { id: threadId } },
        user: {
          connect: { id: user.id }
        }
      },
      include: { user: true }
    })
    io.to(threadId.toString()).emit('message', message)
    const recipients = await prisma.user.findMany({
      where: {
        AND: [
          {
            OR: [{ isAdmin: true }, { threads: { some: { id: threadId } } }]
          },
          {
            NOT: { id: message.user.id }
          }
        ]
      }
    })
    for (const recipient of recipients) {
      fetch('https://textbelt.com/text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          phone: recipient.phone,
          message: `From ${user.name}: ${content}`,
          key: '0c1796b9d2cdc8aff931ad928af02b3de18c9089WfDn42a2oVOZH8fzFh8TiOSZ9'
        })
      })
    }
  })

  socket.on('disconnect', () => {
    console.log('Client disconnected')
  })
})

export default io

import { type RequestHandler } from 'express'
import prisma from '../lib/prisma'
import io from '../lib/socket'

export const textbelt: RequestHandler = async (req, res) => {
  const { threadId, userId } = req.params
  const { text: content } = req.body

  const message = await prisma.message.create({
    data: {
      content,
      thread: { connect: { id: Number(threadId) } },
      user: { connect: { id: Number(userId) } }
    },
    include: { user: true }
  })
  io.to(threadId as string).emit('message', message)
  res.status(201).send({ success: true })
}

import {
  PrismaClient,
  type Message,
  type Session,
  type Thread,
  type User
} from '@prisma/client'
import { hash } from 'argon2'
import { onNewMessage, onNewThread } from '../services/chatbot'
import onMessageSent from '../services/notifications'

const prisma = new PrismaClient()

prisma.$use(async (params, next) => {
  if (params.model === 'User' && params.action === 'create') {
    params.args.data.password = await hash(params.args.data.password)
  }
  const result = await next(params)

  if (params.model === 'Message' && params.action === 'create') {
    const message = result as Message
    await Promise.all([
      prisma.thread.update({
        where: { id: message.threadId },
        data: { updatedAt: new Date() }
      }),
      onMessageSent(message),
      onNewMessage(message.id, message.threadId)
    ])
  }

  if (params.model === 'Thread' && params.action === 'create') {
    const id = (result as Thread).id
    await onNewThread(id)
  }

  return result
})

export default prisma
export type { User, Thread, Message, Session }

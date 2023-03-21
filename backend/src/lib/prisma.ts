import {
  PrismaClient,
  type Message,
  type Session,
  type Thread,
  type User
} from '@prisma/client'
import { hash } from 'argon2'
import { onCreateMessage, onCreateThread } from '../services/chatbot'
import onMessageSent from '../services/notifications'

const prisma = new PrismaClient()

prisma.$use(async (params, next) => {
  if (params.model === 'User' && params.action === 'create') {
    params.args.data.password = await hash(params.args.data.password)
  }
  const result = await next(params)

  if (params.model === 'Message' && params.action === 'create') {
    await onMessageSent(result as Message)
    await onCreateMessage(result as Message)
  }
  if (params.model === 'Thread' && params.action === 'create') {
    await onCreateThread(result as Thread)
  }

  return result
})

export default prisma
export type { User, Thread, Message, Session }

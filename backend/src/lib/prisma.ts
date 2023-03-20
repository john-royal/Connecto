import {
  PrismaClient,
  type Message,
  type Session,
  type Thread,
  type User
} from '@prisma/client'
import { hash } from 'argon2'
import autoReply from '../services/lex'
import onMessageSent from '../services/notifications'

const prisma = new PrismaClient()

prisma.$use(async (params, next) => {
  if (params.model === 'User' && params.action === 'create') {
    params.args.data.password = await hash(params.args.data.password)
  }
  const result = await next(params)

  if (params.model === 'Message' && params.action === 'create') {
    await onMessageSent(result as Message)
    console.log('replying...')
    await autoReply(result as Message)
  }

  return result
})

export default prisma
export type { User, Thread, Message, Session }

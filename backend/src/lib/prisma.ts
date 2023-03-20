import {
  PrismaClient,
  type Message,
  type Session,
  type Thread,
  type User
} from '@prisma/client'
import { hash } from 'argon2'
import fetch from 'isomorphic-unfetch'
import { sendEmail } from './aws'

const prisma = new PrismaClient()

prisma.$use(async (params, next) => {
  if (params.model === 'User' && params.action === 'create') {
    params.args.data.password = await hash(params.args.data.password)
  }
  const result = await next(params)

  if (params.model === 'Message' && params.action === 'create') {
    const message = result as Message & { user: User }
    const recipients = await prisma.user.findMany({
      where: {
        AND: [
          {
            OR: [
              { isAdmin: true },
              { threads: { some: { id: message.threadId } } }
            ]
          },
          {
            NOT: { id: message.user.id }
          }
        ]
      }
    })
    for (const recipient of recipients) {
      const CALLBACK_URL = `https://connecto.johnmroyal.com/api/webhooks/textbelt?threadId=${message.threadId}&userId=${recipient.id}`
      await fetch(
        `https://textbelt.com/text?replyWebhookUrl=${encodeURIComponent(
          CALLBACK_URL
        )}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            phone: recipient.phone,
            message: `From ${message.user.name}: ${message.content}`,
            key: process.env.TEXTBELT_API_KEY
          })
        }
      )
    }
    try {
      await sendEmail({
        to: recipients.map((r: User) => r.email),
        subject: `New message from ${message.user.name}`,
        body: `From ${message.user.name}: ${message.content}`
      })
    } catch (error) {
      // For sandbox testing, AWS requires that all recipients verify their email addresses.
      // This catches the error in case someone isn't verified.
      console.error(error)
    }
  }

  return result
})

export default prisma
export type { User, Thread, Message, Session }

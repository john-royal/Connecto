import { RecognizeTextCommand } from '@aws-sdk/client-lex-runtime-v2'
import { lex } from '../lib/aws'
import prisma, { type Message } from '../lib/prisma'
import io from '../lib/socket'

export default async function autoReply({
  id,
  content,
  threadId
}: Message): Promise<void> {
  // abort if the message isn't sent by a customer
  const message = await prisma.message.findUniqueOrThrow({
    where: { id },
    include: { user: true }
  })
  if (message.user.isAdmin) {
    console.log('message sent by an admin, aborting')
    return
  }
  // abort if the thread contains any messages sent by a human admin
  const count = await prisma.message.count({
    where: {
      thread: { id: threadId },
      user: { isAdmin: true, email: { not: 'connecto@connecto.connecto' } }
    }
  })
  if (count > 0) {
    console.log('thread contains messages sent by a human admin, aborting')
    return
  }
  console.log('calling the bot...')
  io.to(threadId.toString()).emit('typing', { id: NaN, name: 'Connecto' })
  const result = await lex.send(
    new RecognizeTextCommand({
      botAliasId: 'TSTALIASID',
      botId: 'WLJYWIRFWO',
      localeId: 'en_US',
      sessionId: `${threadId}`,
      text: content
    })
  )
  io.to(threadId.toString()).emit('stop typing')
  console.log(result)
  if (result.messages == null || result.messages.length === 0) return
  const replyText = result.messages[result.messages.length - 1].content
  if (replyText == null) {
    console.log('reply text is null, exiting...')
    return
  }
  await prisma.message.create({
    data: {
      content: replyText,
      thread: { connect: { id: threadId } },
      user: { connect: { email: 'connecto@connecto.connecto' } }
    }
  })
}

import {
  BOT_USER_ID,
  BOT_USER_NAME,
  generateBotReply,
  generateReplySuggestions,
  type ThreadWithCustomerMessages
} from '../lib/completions'
import prisma, { type Message, type Thread } from '../lib/prisma'
import io from '../lib/socket'

const BOT_USER = { id: BOT_USER_ID, name: BOT_USER_NAME, isAdmin: true }

const fetchThread = async (
  id: Thread['id']
): Promise<ThreadWithCustomerMessages> => {
  return await prisma.thread.findUniqueOrThrow({
    where: { id },
    include: {
      customer: true,
      messages: {
        include: {
          user: true
        },
        orderBy: { createdAt: 'asc' }
      }
    }
  })
}

const emitReplySuggestions = async (threadId: Thread['id']): Promise<void> => {
  const thread = await fetchThread(threadId)
  const completions = await generateReplySuggestions(thread)
  io.to(`${threadId}`).emit('completions', {
    admin:
      thread.messages.length > 0
        ? !thread.messages[thread.messages.length - 1].user.isAdmin
        : false,
    completions
  })
}

async function onNewThread(id: Thread['id']): Promise<void> {
  io.to(`${id}`).emit('typing', BOT_USER)
  const thread = await fetchThread(id)
  const greetingMessage = await generateBotReply(thread)
  if (greetingMessage != null) {
    await prisma.message.create({
      data: {
        content: greetingMessage,
        thread: { connect: { id } },
        user: { connect: { id: BOT_USER_ID } }
      }
    })
  }
  io.to(`${id}`).emit('stop typing', BOT_USER)
}

async function onNewMessage(
  messageId: Message['id'],
  threadId: Thread['id']
): Promise<void> {
  const { user } = await prisma.message.findUniqueOrThrow({
    where: { id: messageId },
    select: { user: { select: { isAdmin: true } } }
  })
  if (!user.isAdmin) {
    io.to(`${threadId}`).emit('typing', BOT_USER)
    const thread = await fetchThread(threadId)
    const content = await generateBotReply(thread)
    if (content != null) {
      await prisma.message.create({
        data: {
          content,
          thread: { connect: { id: threadId } },
          user: { connect: { id: BOT_USER_ID } }
        }
      })
    }
    io.to(`${threadId}`).emit('stop typing', BOT_USER)
  }
  await emitReplySuggestions(threadId)
}

export { onNewThread, onNewMessage, emitReplySuggestions as onJoinThread }

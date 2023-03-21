import {
  ChatCompletionRequestMessageRoleEnum,
  Configuration,
  OpenAIApi
} from 'openai'
import prisma, { type Message, type Thread } from '../lib/prisma'
import io from '../lib/socket'

const openai = new OpenAIApi(
  new Configuration({
    apiKey: process.env.OPENAI_API_KEY
  })
)

const BOT_USER_ID = 0
const BOT_USER_NAME = 'Janet'

const generateNextMessage = async (
  customer: { name: string; isAdmin: boolean },
  messages: Array<
    Message & { user: { id: number; name: string; isAdmin: boolean } }
  >
): Promise<string | undefined> => {
  if (
    customer.isAdmin ||
    messages.find(({ user }) => user.isAdmin && user.id !== BOT_USER_ID) != null
  )
    return
  const result = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: ChatCompletionRequestMessageRoleEnum.System,
        content: `You’re ${BOT_USER_NAME}, a customer service chatbot that is part of the Connecto messaging platform. Your primary function is to automate routine greetings and data collection to help human representatives work more efficiently. Keep in mind that you cannot directly help customers, but rather gather information and transfer them to a representative. When interacting with the customer, maintain a friendly, polite, and concise tone.

        The customer's name is ${
          customer.name
        }. The current date and time is ${new Date().toLocaleString()}. Please greet the customer and respond to their messages accordingly.
        
        Here is an example conversation:
        
        Good [morning/afternoon/evening], [User]! Thank you for contacting our customer service. My name is ${BOT_USER_NAME}. How can I help you?
        
        I'd like to check the status of my order.
        
        Sure thing! May I please have your order number so we can look into this for you?
        
        My order number is 12345.
        
        Got it! I'll now transfer you to a representative who can help you with your order status. Please hold for a moment, and someone will be with you shortly. Thanks for choosing Connecto!`
      },
      ...messages.map(({ content, user }) => ({
        role: user.isAdmin
          ? ChatCompletionRequestMessageRoleEnum.Assistant
          : ChatCompletionRequestMessageRoleEnum.User,
        content
      }))
    ]
  })
  console.dir(result.data, { depth: null })
  return result.data.choices[0].message?.content
}

export async function onCreateThread({
  id
}: Pick<Thread, 'id'>): Promise<void> {
  try {
    io.to(`${id}`).emit('typing', { name: BOT_USER_NAME, email: BOT_USER_ID })
    const { customer, messages } = await prisma.thread.findUniqueOrThrow({
      where: { id },
      select: {
        customer: {
          select: { name: true, email: true, isAdmin: true }
        },
        messages: {
          include: {
            user: { select: { id: true, name: true, isAdmin: true } }
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    })
    const responseContent = await generateNextMessage(customer, messages)
    if (responseContent != null) {
      await prisma.message.create({
        data: {
          content: responseContent,
          thread: { connect: { id } },
          user: { connect: { id: BOT_USER_ID } }
        }
      })
    }
  } catch (error) {
    console.error('Error in chatbot service:', error)
  } finally {
    io.to(`${id}`).emit('stop typing')
  }
}

export async function onCreateMessage({
  id,
  threadId
}: Pick<Message, 'id' | 'threadId'>): Promise<void> {
  const { user } = await prisma.message.findUniqueOrThrow({
    where: { id },
    select: { user: { select: { isAdmin: true } } }
  })
  if (user.isAdmin) return
  await onCreateThread({ id: threadId })
}

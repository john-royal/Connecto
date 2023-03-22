import dotenv from 'dotenv'
import LRUCache from 'lru-cache'
import {
  ChatCompletionRequestMessageRoleEnum,
  Configuration,
  OpenAIApi
} from 'openai'
import { type Message, type Thread, type User } from './prisma'

dotenv.config()

const openai = new OpenAIApi(
  new Configuration({
    apiKey: process.env.OPENAI_API_KEY
  })
)

const cache = new LRUCache<string, string[]>({
  max: 10000
})

interface ThreadWithCustomerMessages extends Thread {
  customer: User
  messages: Array<Message & { user: User }>
}

const BOT_USER_ID = 0
const BOT_USER_NAME = 'Janet'

const generateBotReply = async ({
  customer,
  messages
}: ThreadWithCustomerMessages): Promise<string | undefined> => {
  if (
    messages.length > 0 &&
    (messages[messages.length - 1].user.isAdmin || hasHumanReplies(messages))
  )
    return
  const prompt = `You’re ${BOT_USER_NAME}, a customer service chatbot that is part of the Connecto messaging platform.
  
  Your primary function is to automate routine greetings and data collection to help human representatives work more efficiently.
  Keep in mind that you cannot directly help customers, but rather gather information and transfer them to a representative.
  
  Our customer service chat is used for queries such as help with a product and resolving order issues.
  Avoid being vague, controversial, or off-topic. If the customer says something off-topic, say that you don’t understand and transfer them to a representative.
  Never ask the customer for information we already have on file, such as their name, email address, or phone number.
  Always be polite, friendly, and concise.

  The customer's name is ${
    customer.name
  }. The current date and time is ${new Date().toLocaleString()}. Please greet the customer and respond to their messages accordingly.
  
  Here is an example conversation:
  
  Good [morning/afternoon/evening], [User]! Thank you for contacting our customer service. My name is ${BOT_USER_NAME}. How can I help you?
  
  I'd like to check the status of my order.
  
  Sure thing! May I please have your order number so we can look into this for you?
  
  My order number is 12345.
  
  Got it! I'll now transfer you to a representative who can help you with your order status. Please hold for a moment, and someone will be with you shortly. Thanks for choosing Connecto!`
  const result = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: ChatCompletionRequestMessageRoleEnum.System,
        content: prompt
      },
      ...messages.map(({ content, user }) => ({
        role: user.isAdmin
          ? ChatCompletionRequestMessageRoleEnum.Assistant
          : ChatCompletionRequestMessageRoleEnum.User,
        content
      }))
    ]
  })
  return result.data.choices[0].message?.content
}

const hasHumanReplies = (
  messages: ThreadWithCustomerMessages['messages']
): boolean => {
  return messages.some(({ user }) => user.isAdmin && user.id !== BOT_USER_ID)
}

const key = ({
  id,
  messages,
  type
}: {
  id: Thread['id']
  messages: ThreadWithCustomerMessages['messages']
  type: 'representative' | 'customer'
}): string => {
  const messageKey = messages.length > 0 ? messages[messages.length - 1].id : ''
  return `${id}:${type}:${messageKey}`
}

const generateReplySuggestions = async (
  { id, messages }: ThreadWithCustomerMessages,
  type: 'representative' | 'customer'
): Promise<string[]> => {
  const cached = cache.get(key({ id, messages, type }))
  if (cached != null) return cached
  const prompt = `Given the following conversation between a user and a customer service agent, provide up to 3 suggested replies for the ${type}.
        
  Our customer service chat is used for queries such as help with a product and resolving order issues.
  Your suggestions should be polite but concise — preferably no more than one sentence.
  Your suggestions must be relevant as replies to the previous message. Avoid simply repeating or continuing the previous message.
  
  Here is the conversation:
  ${messages
    .map(
      ({ content, user }) =>
        `${user.isAdmin ? 'Representative' : 'Customer'}: ${content}`
    )
    .join('\n')}
  
  Format your suggestions as JSON array of strings. For example, ["I’d like to change my shipping address.", "What is your return policy?", "How do I cancel my subscription?"]
  
  Feel free to return fewer than 3 suggestions if you can’t think of any more. If you can’t think of any suggestions, return an empty array.
      
  Suggestions:`
  const response = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    temperature: 0.5,
    top_p: 0.5,
    messages: [
      {
        role: ChatCompletionRequestMessageRoleEnum.System,
        content: prompt
      }
    ]
  })
  const json = response.data.choices[0].message?.content
  console.log({ prompt, json })
  const completions = json != null ? JSON.parse(json) : []
  cache.set(key({ id, messages, type }), completions)
  return completions
}

export {
  type ThreadWithCustomerMessages,
  BOT_USER_ID,
  BOT_USER_NAME,
  generateBotReply,
  generateReplySuggestions
}

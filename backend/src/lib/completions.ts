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
  However, you can also answer questions that do not require access to customer data, such as basic product information and troubleshooting.
  For all other inquiries, gather the customer’s information and transfer them to a representative.
  
  Our customer service chat is used for queries such as help with a product and resolving order issues.
  Avoid being vague, controversial, or off-topic. If the customer says something off-topic, say that you don’t understand and transfer them to a representative.
  Never ask the customer for information we already have on file, such as their name, email address, or phone number.
  Always be polite, friendly, and concise.

  The customer’s name is ${customer.name}. Their email address is ${
    customer.email
  } and their phone number is ${
    customer.phone
  }.The current date and time is ${new Date().toLocaleString()}. Please greet the customer and respond to their messages accordingly.
  
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
  admin
}: {
  id: Thread['id']
  messages: ThreadWithCustomerMessages['messages']
  admin: boolean
}): string => {
  const messageKey = messages.length > 0 ? messages[messages.length - 1].id : ''
  return `${id}:${admin ? 'representative' : 'customer'}:${messageKey}`
}

const generateReplySuggestions = async (
  { id, customer, messages }: ThreadWithCustomerMessages,
  admin: boolean
): Promise<string[]> => {
  console.log('generating reply suggestions...')
  const cached = cache.get(key({ id, messages, admin }))
  if (cached != null) return cached
  let prompt = `
  The following is a conversation between a customer and a customer service representative.
  The customer’s name is ${customer.name}. Their email address is ${customer.email} and their phone number is ${customer.phone}.
  Please use the following conversation to generate suggested replies, keeping in mind the following guidelines:
  - Our customer service chat is used for queries such as help with a product and resolving order issues.
  - Your suggestions should be relevant to the customer’s query. Avoid being vague, controversial, or off-topic.
  - Your suggestion is a reply. Avoid simply repeating the previous message.
  - Your suggestions should be polite but concise — preferably no more than one sentence.
  `
  if (messages.length === 0) {
    prompt += 'The conversation has not started yet.\n\n\n'
  } else {
    prompt += 'Here is the conversation so far:\n\n\n'
    prompt +=
      messages
        .map(
          ({ content, user }) =>
            `${user.id === 0 ? 'Bot' : user.name} (${
              user.isAdmin ? 'representative' : 'customer'
            }): ${content}`
        )
        .join('\n') + '\n\n\n'
  }
  if (admin) {
    prompt += `Please suggest up to 3 replies that the representative can use.
    Your suggestions must be appropriate for a human customer support representative. Please note that representatives must be able to answer all questions and cannot transfer the customer to another representative.
    Provide your result as a JSON array of strings. For example: ["Sure thing! Please hold on while I look up your order.", "Is there anything else I can help you with?", "I'll be right back with your order status."]`
  } else {
    prompt += `Please suggest up to 3 replies that the customer can use.
    Provide your result as a JSON array of strings. For example: ["I’d like to change my shipping address.", "What is your return policy?", "How do I cancel my subscription?"]`
  }
  prompt +=
    '\nIf you are unable to generate any suggestions, please return an empty array. Your response must consist of a single JSON array of strings, with no other characters.'
  try {
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
    cache.set(key({ id, messages, admin }), completions)
    return completions
  } catch (error) {
    return []
  }
}

export {
  type ThreadWithCustomerMessages,
  BOT_USER_ID,
  BOT_USER_NAME,
  generateBotReply,
  generateReplySuggestions
}

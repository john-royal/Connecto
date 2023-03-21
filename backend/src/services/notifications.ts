import {
  SendEmailCommand,
  type SendEmailCommandOutput
} from '@aws-sdk/client-ses'
import fetch from 'isomorphic-unfetch'
import { ses } from '../lib/aws'
import getAddressFromCoordinates from '../lib/geocode'
import prisma, { type Message, type User } from '../lib/prisma'
import io from '../lib/socket'

const BOT_USER_ID = 0

export default async function onMessageSent({
  id,
  threadId
}: Message): Promise<void> {
  const message = await prisma.message.findUniqueOrThrow({
    where: { id },
    include: { user: true }
  })

  const recipients = await prisma.user.findMany({
    where: {
      AND: [
        {
          OR: [{ isAdmin: true }, { threads: { some: { id: threadId } } }]
        },
        {
          NOT: { id: message.user.id }
        }
      ]
    }
  })

  io.to(threadId.toString()).emit('message', message)

  await Promise.all(
    recipients.map(async (recipient: User) => {
      if (
        (message.user.id === BOT_USER_ID && recipient.isAdmin) ||
        recipient.id === BOT_USER_ID
      )
        return
      await forwardMessageViaSMS(recipient, message, threadId)
      await forwardMessageViaEmail(recipient, message, threadId)
    })
  )
}

async function forwardMessageViaEmail(
  recipient: User,
  message: Message & { user: User },
  threadId: number
): Promise<void> {
  const address =
    message.latitude != null && message.longitude != null
      ? await getAddressFromCoordinates({
          latitude: message.latitude,
          longitude: message.longitude
        })
      : null
  const emailBody = `From ${message.user.name}: ${message.content}`
  const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="background-color: #4CAF50; color: white; text-align: center; padding: 20px;">Connecto</h1>
        <div style="padding: 20px; background-color: white; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);">
          <h2>${message.user.name} sent a new message:</h2>
          <p>${message.content}</p>
          ${
            message.latitude != null && message.longitude != null
              ? `<p>Location: <a href="https://www.google.com/maps?q=${
                  message.latitude
                },${message.longitude}">${address as string}</a></p>`
              : ''
          }
          ${
            message.attachmentUrl
              ? `<p>Attachment: <a href="${message.attachmentUrl}">${message.attachmentUrl}</a></p>`
              : ''
          }
        </div>
        <footer style="text-align: center; padding: 20px; font-size: 0.8em; color: #999;">&copy; Connecto. All rights reserved.</footer>
      </div>
    `
  const result = await sendEmail({
    to: [recipient.email],
    replyTo: [`${threadId}@connecto.johnmroyal.com`],
    subject: `New message from ${message.user.name}`,
    body: emailBody,
    htmlBody
  })
  if (result?.MessageId == null) return
  await prisma.notification.create({
    data: {
      type: 'EMAIL',
      user: { connect: { id: recipient.id } },
      thread: { connect: { id: threadId } },
      id: result.MessageId
    }
  })
}

async function sendEmail({
  to: destination,
  replyTo,
  subject,
  body,
  htmlBody
}: {
  to: string[]
  replyTo?: string[]
  subject: string
  body: string
  htmlBody: string
}): Promise<SendEmailCommandOutput | null> {
  const command = new SendEmailCommand({
    Source: process.env.AWS_SES_SENDER,
    Destination: {
      ToAddresses: destination
    },
    ReplyToAddresses: replyTo,
    Message: {
      Subject: {
        Data: subject
      },
      Body: {
        Text: {
          Data: body
        },
        Html: {
          Data: htmlBody
        }
      }
    }
  })
  try {
    return await ses.send(command)
  } catch (error) {
    // The SES API returns an error if the email address is not verified (this is a test mode limitation).
    // This is to prevent that from crashing the application.
    console.error(error)
    return null
  }
}

async function sendSMS({
  phone,
  message,
  replyWebhookUrl
}: {
  phone: string
  message: string
  replyWebhookUrl?: string
}): Promise<{
  success: boolean
  textId: string
  quotaRemaining: number
}> {
  const response = await fetch('https://textbelt.com/text', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      phone,
      message,
      key: process.env.TEXTBELT_API_KEY,
      replyWebhookUrl: replyWebhookUrl as string
    })
  })
  return (await response.json()) as {
    success: boolean
    textId: string
    quotaRemaining: number
  }
}

async function forwardMessageViaSMS(
  recipient: User,
  message: Message & { user: User },
  threadId: number
): Promise<void> {
  const replyWebhookUrl = `https://connecto.johnmroyal.com/api/webhooks/textbelt?threadId=${threadId}&userId=${recipient.id}`

  if (
    (await prisma.notification.count({
      where: {
        user: { id: recipient.id },
        thread: { id: threadId },
        type: 'SMS'
      }
    })) === 0
  ) {
    const replyURL = recipient.isAdmin
      ? `https://connecto.johnmroyal.com/admin/${threadId}`
      : `https://connecto.johnmroyal.com/chat`
    const result = await sendSMS({
      phone: recipient.phone,
      message: `${message.user.name} sent a message with Connecto! You can reply here or at ${replyURL}.`,
      replyWebhookUrl
    })
    if (result.success) {
      await prisma.notification.create({
        data: {
          type: 'SMS',
          user: { connect: { id: recipient.id } },
          thread: { connect: { id: threadId } },
          id: result.textId
        }
      })
    }
  }
  let content = message.content

  if (message.attachmentUrl != null) {
    content += `\n\nAttachment: ${message.attachmentUrl}`
  }

  if (message.latitude != null && message.longitude != null) {
    const address = await getAddressFromCoordinates({
      latitude: message.latitude,
      longitude: message.longitude
    })
    content += `\n\nLocation: https://www.google.com/maps?q=${message.latitude},${message.longitude} (${address})`
  }

  const result = await sendSMS({
    phone: recipient.phone,
    message: content,
    replyWebhookUrl
  })
  console.log(result)
  if (result.success) {
    await prisma.notification.create({
      data: {
        type: 'SMS',
        user: { connect: { id: recipient.id } },
        thread: { connect: { id: threadId } },
        id: result.textId
      }
    })
  }
}

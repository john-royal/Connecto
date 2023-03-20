import { SendEmailCommand } from '@aws-sdk/client-ses'
import axios from 'axios'
import { ses } from '../lib/aws'
import getAddressFromCoordinates from '../lib/geocode'
import prisma, { type User, type Message } from '../lib/prisma'
import io from '../lib/socket'
import fetch from 'isomorphic-unfetch'

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
                  message.latitude as number
                },${message.longitude as number}">${address as string}</a></p>`
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
  await sendEmail({
    to: [recipient.email],
    subject: `New message from ${message.user.name}`,
    body: emailBody,
    htmlBody
  })
}

async function sendEmail({
  to: destination,
  subject,
  body,
  htmlBody
}: {
  to: string[]
  subject: string
  body: string
  htmlBody: string
}): Promise<void> {
  const emailParams = {
    Source: process.env.AWS_SES_SENDER,
    Destination: {
      ToAddresses: destination
    },
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
  }
  const command = new SendEmailCommand(emailParams)
  console.dir(emailParams, { depth: null })
  try {
    const data = await ses.send(command)
    console.dir(data)
  } catch (error) {
    // The SES API returns an error if the email address is not verified (this is a test mode limitation).
    // This is to prevent that from crashing the application.
    console.error(error)
  }
}

async function forwardMessageViaSMS(
  recipient: User,
  message: Message & { user: User },
  threadId: number
): Promise<void> {
  let content = `From ${message.user.name}: ${message.content}`

  if (message.attachmentUrl != null) {
    // content += `\nAttachment: ${message.attachmentUrl}`
    content += '\nAttachment: [link temporarily withheld]'
  }

  if (message.latitude != null && message.longitude != null) {
    const address = await getAddressFromCoordinates({
      latitude: message.latitude,
      longitude: message.longitude
    })
    content += `\nLocation: ${address}`
    // content += `\nLocation: https://www.google.com/maps?q=${message.latitude},${message.longitude} (${address})`
  }

  const response = await fetch('https://textbelt.com/text', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      phone: recipient.phone,
      message: content,
      key: process.env.TEXTBELT_API_KEY,
      replyWebhookUrl: `https://connecto.johnmroyal.com/api/webhooks/textbelt?threadId=${threadId}&userId=${recipient.id}`
    })
  })

  const data = await response.json()
  console.log(data)
}

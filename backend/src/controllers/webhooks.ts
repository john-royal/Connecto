import { GetObjectCommand } from '@aws-sdk/client-s3'
import { type RequestHandler } from 'express'
import fetch from 'isomorphic-unfetch'
import { s3 } from '../lib/aws'
import prisma from '../lib/prisma'
import io from '../lib/socket'

const getThreadId = (email: string): number | null => {
  const threadIdRegex = /(\d+)@connecto.johnmroyal\.com/
  const threadIdMatch = email.match(threadIdRegex)
  return threadIdMatch ? parseInt(threadIdMatch[1], 10) : null
}

const getSenderEmail = (email: string): string | null => {
  const senderEmailRegex = /From: .*?<(.+?)>/
  const senderEmailMatch = email.match(senderEmailRegex)
  return senderEmailMatch ? senderEmailMatch[1] : null
}

const getMessageContent = (email: string): string | null => {
  const messageContentRegex =
    /Content-Type: text\/plain;[\s\S]*?\r?\n\r?\n([\s\S]*?)(?=\r?\n\r?\n--)/

  const match = email.match(messageContentRegex)
  if (!match?.[1]) return null

  const recentReply = match[1]

  // Split the content into lines
  const lines = recentReply.split(/\r?\n/)

  // Filter out the lines that belong to the quoted text
  const filteredLines = lines.filter((line) => {
    return (
      !line.startsWith('>') &&
      !line.startsWith('On ') &&
      !line.match(/.*@.*\..*> wrote:/)
    )
  })

  // Join the filtered lines back together
  return filteredLines.join('\n')
}

export const ses: RequestHandler = async (req, res) => {
  const body = JSON.parse(req.body)

  if (body.Type === 'SubscriptionConfirmation') {
    await fetch(body.SubscribeURL)
  }

  if (body.Type === 'Notification') {
    const message = JSON.parse(body.Message)
    const { receipt } = message

    const params = {
      Bucket: receipt.action.bucketName,
      Key: receipt.action.objectKey
    }

    const data = await s3.send(new GetObjectCommand(params))
    const result = (await data.Body?.transformToString()) ?? ''

    const threadId = getThreadId(result)
    const senderEmail = getSenderEmail(result)
    const messageContent = getMessageContent(result)

    if (threadId == null || !senderEmail || !messageContent) {
      return res.status(400).send({ success: false })
    }

    // create the message
    const newMessage = await prisma.message.create({
      data: {
        content: messageContent,
        thread: { connect: { id: threadId } },
        user: { connect: { email: senderEmail } }
      },
      include: { user: true }
    })
    console.log(newMessage)
  }

  res.status(200).send({ success: true })
}

export const textbelt: RequestHandler = async (req, res) => {
  const { threadId, userId } = req.query
  const { text: content } = req.body

  const message = await prisma.message.create({
    data: {
      content,
      thread: { connect: { id: Number(threadId) } },
      user: { connect: { id: Number(userId) } }
    },
    include: { user: true }
  })
  io.to(threadId as string).emit('message', message)
  res.status(201).send({ success: true })
}

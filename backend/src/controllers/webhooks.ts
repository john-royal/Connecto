import { GetObjectCommand } from '@aws-sdk/client-s3'
import { type RequestHandler } from 'express'
import fetch from 'isomorphic-unfetch'
import { s3 } from '../lib/aws'
import { parseEmail } from '../lib/parse-email'
import prisma from '../lib/prisma'

const getThreadId = async (
  email: string
): Promise<{ id: number } | undefined> => {
  const threadIdRegex = /(\d+)@connecto.johnmroyal\.com/
  const threadIdMatch = email.match(threadIdRegex)
  if (!threadIdMatch) {
    return
  }
  return await prisma.thread.findUniqueOrThrow({
    where: { id: Number(threadIdMatch[1]) },
    select: { id: true }
  })
}

export const ses: RequestHandler = async (req, res) => {
  const body = JSON.parse(req.body)

  if (body.Type === 'SubscriptionConfirmation') {
    await fetch(body.SubscribeURL)
  }

  if (body.Type === 'Notification') {
    const { receipt } = JSON.parse(body.Message)

    const data = await s3.send(
      new GetObjectCommand({
        Bucket: receipt.action.bucketName,
        Key: receipt.action.objectKey
      })
    )
    const email = (await data.Body?.transformToString()) ?? ''
    const { sender, recipient, date, text } = await parseEmail(email)

    let thread = await getThreadId(recipient)

    if (thread == null) {
      thread = await prisma.thread.create({
        data: {
          customer: { connect: { email: sender } }
        }
      })
    }

    const newMessage = await prisma.message.create({
      data: {
        content: text,
        createdAt: date,
        thread: { connect: { id: thread.id } },
        user: { connect: { email: sender } }
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

  await prisma.message.create({
    data: {
      content,
      thread: { connect: { id: Number(threadId) } },
      user: { connect: { id: Number(userId) } }
    },
    include: { user: true }
  })
  res.status(201).send({ success: true })
}

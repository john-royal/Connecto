import { GetObjectCommand } from '@aws-sdk/client-s3'
import { type RequestHandler } from 'express'
import fetch from 'isomorphic-unfetch'
import { s3 } from '../lib/aws'
import prisma from '../lib/prisma'
import io from '../lib/socket'

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
    console.dir(data, { depth: null })

    // create message
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

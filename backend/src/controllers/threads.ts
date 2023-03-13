import type { Prisma } from '@prisma/client'
import type { RequestHandler } from 'express'
import prisma from '../lib/prisma'

export const enforceAuth: RequestHandler = (req, res, next) => {
  if (req.user == null) {
    res.status(401).send({ message: 'Unauthorized' })
  } else {
    next()
  }
}

export const findAll: RequestHandler = async (req, res) => {
  const where: Prisma.ThreadWhereInput = {}
  if (req.user!.isAdmin) {
    where.isActive = true
  } else {
    where.customer = { id: Number(req.user!.id) }
  }
  const threads = await prisma.thread.findMany({ where })
  res.status(200).send({ threads })
}

export const findOne: RequestHandler = async (req, res) => {
  const thread = await prisma.thread.findUnique({
    where: { id: Number(req.params.id) },
    include: {
      messages: { include: { user: true } },
      customer: true
    }
  })
  if (!req.user!.isAdmin || thread?.customerId !== req.user!.id) {
    res.status(401).send({ message: 'Unauthorized' })
  } else if (thread == null) {
    res.status(404).send({ message: 'Thread not found' })
  } else {
    res.status(200).send({ thread })
  }
}

export const create: RequestHandler = async (req, res) => {
  const userId = Number(req.user!.id)
  const thread = await prisma.thread.create({
    data: {
      customer: { connect: { id: userId } }
    },
    include: {
      customer: true
    }
  })
  res.status(201).send({ thread })
}

export const close: RequestHandler = async (req, res) => {
  const threadId = Number(req.params.id)
  const thread = await prisma.thread.findUnique({ where: { id: threadId } })
  if (thread == null) {
    res.status(404).send({ message: 'Thread not found' })
  } else if (thread.customerId !== req.user!.id && !req.user!.isAdmin) {
    res.status(401).send({ message: 'Unauthorized' })
  } else {
    await prisma.thread.update({
      where: { id: threadId },
      data: { isActive: false }
    })
    res.status(200).send({ success: true })
  }
}

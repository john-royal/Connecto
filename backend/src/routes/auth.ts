import type { PrismaClientKnownRequestError } from '@prisma/client/runtime'
import { verify } from 'argon2'
import { Router } from 'express'
import prisma from '../prisma'

const authRouter = Router()

const isEmailAlreadyInUseError = (error: unknown): boolean => {
  const e = error as PrismaClientKnownRequestError
  return e.code === 'P2002' && (e.meta?.target as string[])?.includes('email')
}

authRouter.post('/register', async (req, res) => {
  try {
    const user = await prisma.user.create({ data: req.body })
    await req.logIn(user)
    res.status(201).end()
  } catch (error) {
    if (isEmailAlreadyInUseError(error)) {
      res.status(400).send({ message: 'Email already in use.' })
    } else {
      throw error
    }
  }
})

authRouter.post('/login', async (req, res) => {
  const { email, password } = req.body
  const user = await prisma.user.findUnique({ where: { email } })
  if (user == null) {
    res.status(401).send({ message: 'Incorrect email.' })
    return
  }
  if (!(await verify(user.password, password))) {
    res.status(401).send({ message: 'Incorrect password.' })
    return
  }
  await req.logIn(user)
  res.status(200).end()
})

authRouter.get('/session', (req, res) => {
  if (req.user == null) {
    res.status(401).end()
  } else {
    res.status(200).send(req.user)
  }
})

authRouter.get('/logout', async (req, res) => {
  await req.logOut()
  res.status(200).end()
})

export default authRouter

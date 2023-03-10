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
    const isAdmin = (await prisma.user.count()) === 0
    const user = await prisma.user.create({
      data: Object.assign({}, req.body, { isAdmin })
    })
    await req.logIn(user)
    res.status(201).send({ success: true })
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
  res.status(200).send({ success: true })
})

authRouter.get('/session', (req, res) => {
  if (req.user == null) {
    res.status(401).send({ user: null })
  } else {
    res.status(200).send({ user: req.user })
  }
})

authRouter.get('/logout', async (req, res) => {
  await req.logOut()
  res.status(200).send({ success: true })
})

export default authRouter

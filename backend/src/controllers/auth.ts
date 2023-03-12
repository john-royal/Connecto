import type { PrismaClientKnownRequestError } from '@prisma/client/runtime'
import { verify } from 'argon2'
import type { Request, Response } from 'express'
import prisma, { type User } from '../lib/prisma'

type Handler = (req: Request, res: Response) => void | Promise<void>

const isAlreadyInUseError = (error: unknown, field: keyof User): boolean => {
  const e = error as PrismaClientKnownRequestError
  return e.code === 'P2002' && (e.meta?.target as string[])?.includes(field)
}

export const register: Handler = async (req, res) => {
  try {
    const isAdmin = (await prisma.user.count()) === 0
    const user = await prisma.user.create({
      data: Object.assign({}, req.body, { isAdmin })
    })
    await req.logIn(user)
    res.status(201).send({ success: true })
  } catch (error) {
    if (isAlreadyInUseError(error, 'email')) {
      res.status(400).send({ message: 'Email already in use.' })
    } else if (isAlreadyInUseError(error, 'phone')) {
      res.status(400).send({ message: 'Phone number already in use.' })
    } else {
      throw error
    }
  }
}

export const login: Handler = async (req, res) => {
  const { email, password } = req.body
  const user = await prisma.user.findUnique({ where: { email } })
  if (user == null) {
    res.status(401).send({ message: 'Incorrect email.' })
  } else if (!(await verify(user.password, password))) {
    res.status(401).send({ message: 'Incorrect password.' })
  } else {
    await req.logIn(user)
    res.status(200).send({ success: true })
  }
}

export const session: Handler = (req, res) => {
  if (req.user == null) {
    res.status(401).send({ user: null })
  } else {
    res.status(200).send({ user: req.user })
  }
}

export const logout: Handler = async (req, res) => {
  await req.logOut()
  res.status(200).send({ success: true })
}

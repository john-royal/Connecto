import type { RequestHandler } from 'express'
import { UserError, UserModel } from '../models/user'

export const register: RequestHandler = async (req, res) => {
  try {
    const isAdmin = req.body.email === process.env.ADMIN_EMAIL
    Object.assign(req.body, { isAdmin })
    const user = await UserModel.create(req.body)
    await req.logIn(user)
    res.status(201).send({ success: true })
  } catch (error) {
    if (error instanceof UserError) {
      res.status(400).send({ message: error.message })
    } else {
      throw error
    }
  }
}

export const login: RequestHandler = async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await UserModel.findByEmail(email)
    if (await user.verifyPassword(password)) {
      await req.logIn(user)
      res.status(200).send({ success: true })
    } else {
      res.status(401).send({ message: 'Incorrect password.' })
    }
  } catch (error) {
    if (error instanceof UserError) {
      res.status(400).send({ message: error.message })
    } else {
      throw error
    }
  }
}

export const session: RequestHandler = (req, res) => {
  if (req.user == null) {
    res.status(401).send({ user: null })
  } else {
    res.status(200).send({ user: req.user })
  }
}

export const logout: RequestHandler = async (req, res) => {
  await req.logOut()
  res.status(200).send({ success: true })
}

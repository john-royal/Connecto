import { type User, Prisma } from '@prisma/client'
import { verify } from 'argon2'
import prisma from '../lib/prisma'

export class UserError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'UserError'
  }
}

export class UserModel implements User {
  id: number
  name: string
  email: string
  password: string
  phone: string
  isAdmin: boolean

  constructor(user: User) {
    this.id = user.id
    this.name = user.name
    this.email = user.email
    this.password = user.password
    this.phone = user.phone
    this.isAdmin = user.isAdmin
  }

  async verifyPassword(password: string): Promise<boolean> {
    return await verify(this.password, password)
  }

  private static async wrap(fn: () => Promise<User>): Promise<UserModel> {
    try {
      const user = await fn()
      return new UserModel(user)
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
          case 'P2002': {
            const field = (error.meta?.target as string[])[0] ?? ''
            if (field === 'email') {
              throw new UserError('Email already in use.')
            } else if (field === 'phone') {
              throw new UserError('Phone number already in use.')
            }
            break
          }
          case 'P2025':
            throw new UserError('Invalid username/password.')
        }
      }
      throw error
    }
  }

  static async create(data: Prisma.UserCreateInput): Promise<UserModel> {
    return await UserModel.wrap(() => prisma.user.create({ data }))
  }

  static async findByEmail(email: string): Promise<UserModel> {
    return await UserModel.wrap(() =>
      prisma.user.findUniqueOrThrow({ where: { email } })
    )
  }

  static async findById(id: number): Promise<UserModel> {
    return await UserModel.wrap(() =>
      prisma.user.findUniqueOrThrow({ where: { id } })
    )
  }
}

import { PrismaClient, type User } from '@prisma/client'
import { hash } from 'argon2'

const prisma = new PrismaClient()

prisma.$use(async (params, next) => {
  if (params.model === 'User' && params.action === 'create') {
    params.args.data.password = await hash(params.args.data.password)
  }
  return await next(params)
})

export default prisma
export type { User }

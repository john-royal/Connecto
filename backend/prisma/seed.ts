import { PrismaClient } from '@prisma/client'
import { randomBytes } from 'crypto'

const prisma = new PrismaClient()

const main = async (): Promise<void> => {
  await prisma.user.create({
    data: {
      name: 'Connecto',
      email: 'connecto@connecto.connecto',
      password: randomBytes(32).toString('hex'),
      phone: '0000000000',
      isAdmin: true
    }
  })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

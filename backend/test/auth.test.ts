import { faker } from '@faker-js/faker'
import { verify } from 'argon2'
import request from 'supertest'
import app from '../src'
import prisma from '../src/lib/prisma'

describe('POST /auth/register', () => {
  const ENDPOINT = '/auth/register'

  describe('when the email is already in use', () => {
    const existingUser = {
      name: faker.name.fullName(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      password: faker.internet.password()
    }

    beforeEach(async () => {
      await prisma.user.create({
        data: Object.assign({}, existingUser)
      })
    })

    afterEach(async () => {
      await prisma.user.deleteMany({ where: { email: existingUser.email } })
    })

    it('responds with 400 status code and message', async () => {
      const user = {
        name: faker.name.fullName(),
        email: existingUser.email,
        phone: faker.phone.number(),
        password: faker.internet.password()
      }

      const response = await request(app).post(ENDPOINT).send(user)

      expect(response.status).toBe(400)
      expect(response.body).toStrictEqual({ message: 'Email already in use.' })
    })
  })

  describe('when given a valid email and password', () => {
    const user = {
      name: faker.name.fullName(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      password: faker.internet.password()
    }

    afterEach(async () => {
      await prisma.user.deleteMany({ where: { email: user.email } })
    })

    it('responds with JSON and 201 status code', async () => {
      const response = await request(app).post(ENDPOINT).send(user)

      expect(response.status).toBe(201)
      expect(response.body).toStrictEqual({ success: true })
    })

    it('creates a new user', async () => {
      await request(app).post(ENDPOINT).send(user)

      const createdUser = await prisma.user.findUniqueOrThrow({
        where: { email: user.email }
      })

      expect(createdUser.id).toBeDefined()
      expect(createdUser.name).toBe(user.name)
      expect(createdUser.email).toBe(user.email)
      expect(await verify(createdUser.password, user.password)).toBe(true)
    })

    it('creates a valid session', async () => {
      const agent = request.agent(app)

      const registerResponse = await agent.post(ENDPOINT).send(user)
      expect(registerResponse.headers['set-cookie'][0]).toMatch(/connect\.sid/)

      const sessionResponse = await agent.get('/auth/session')
      expect(sessionResponse.status).toBe(200)
    })
  })
})

describe('POST /auth/login', () => {
  const ENDPOINT = '/auth/login'

  describe('when the user is not registered', () => {
    it('responds with 400 status code and message', async () => {
      const credentials = {
        email: faker.internet.email(),
        password: faker.internet.password()
      }

      const response = await request(app).post(ENDPOINT).send(credentials)

      expect(response.status).toBe(400)
      expect(response.body).toStrictEqual({ message: 'User not found.' })
    })
  })

  describe('when the user is registered', () => {
    const existingUser = {
      name: faker.name.fullName(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      password: faker.internet.password()
    }

    beforeEach(async () => {
      await prisma.user.create({
        data: Object.assign({}, existingUser)
      })
    })

    afterEach(async () => {
      await prisma.user.deleteMany({ where: { email: existingUser.email } })
    })

    describe('when the password is incorrect', () => {
      it('responds with 401 status code and message', async () => {
        const credentials = {
          email: existingUser.email,
          password: faker.internet.password()
        }

        const response = await request(app).post(ENDPOINT).send(credentials)

        expect(response.status).toBe(401)
        expect(response.body).toStrictEqual({ message: 'Incorrect password.' })
      })
    })

    describe('when the password is correct', () => {
      it('responds with JSON and 200 status code', async () => {
        const credentials = {
          email: existingUser.email,
          password: existingUser.password
        }

        const response = await request(app).post(ENDPOINT).send(credentials)

        expect(response.body).toStrictEqual({ success: true })
        expect(response.status).toBe(200)
      })

      it('creates a valid session', async () => {
        const credentials = {
          email: existingUser.email,
          password: existingUser.password
        }
        const agent = request.agent(app)

        const loginResponse = await agent.post(ENDPOINT).send(credentials)

        expect(loginResponse.headers['set-cookie'][0]).toMatch(/connect\.sid/)

        const sessionResponse = await agent.get('/auth/session')

        expect(sessionResponse.status).toBe(200)
      })
    })
  })
})

describe('GET /auth/session', () => {
  const ENDPOINT = '/auth/session'

  describe('when the user is not logged in', () => {
    it('responds with 401 status code and message', async () => {
      const response = await request(app).get(ENDPOINT)

      expect(response.status).toBe(401)
      expect(response.body).toStrictEqual({ user: null })
    })
  })

  describe('when the user is logged in', () => {
    const existingUser = {
      name: faker.name.fullName(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      password: faker.internet.password()
    }

    beforeEach(async () => {
      await prisma.user.create({
        data: Object.assign({}, existingUser)
      })
    })

    afterEach(async () => {
      await prisma.user.deleteMany({ where: { email: existingUser.email } })
    })

    it('responds with JSON and 200 status code', async () => {
      const user = await prisma.user.findUnique({
        where: { email: existingUser.email }
      })

      const agent = request.agent(app)
      await agent.post('/auth/login').send({
        email: existingUser.email,
        password: existingUser.password
      })

      const response = await agent.get(ENDPOINT)

      expect(response.status).toBe(200)
      expect(response.body).toStrictEqual({ user })
    })
  })
})

describe('GET /auth/logout', () => {
  const ENDPOINT = '/auth/logout'

  describe('when the user is logged in', () => {
    const existingUser = {
      name: faker.name.fullName(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      password: faker.internet.password()
    }
    const agent = request.agent(app)

    beforeEach(async () => {
      await prisma.user.create({
        data: Object.assign({}, existingUser)
      })
      await agent.post('/auth/login').send({
        email: existingUser.email,
        password: existingUser.password
      })
    })

    afterEach(async () => {
      await prisma.user.deleteMany({ where: { email: existingUser.email } })
    })

    it('responds with JSON and 200 status code', async () => {
      const response = await agent.get(ENDPOINT)

      expect(response.status).toBe(200)
      expect(response.body).toStrictEqual({ success: true })
    })

    it('destroys the session', async () => {
      await agent.get(ENDPOINT)

      const sessionResponse = await agent.get('/auth/session')

      expect(sessionResponse.status).toBe(401)
      expect(sessionResponse.body).toStrictEqual({ user: null })
    })
  })
})

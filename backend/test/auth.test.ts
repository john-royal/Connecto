import request from 'supertest'
import app from '../src'
import prisma from '../src/prisma'

const name = 'Jane Doe'
const email = 'janedoe@example.com'
const password = 'password'

describe('POST /auth/register', () => {
  const agent = request.agent(app)

  afterEach(async () => {
    // Sign out and delete user
    const logOut = await agent.get('/auth/logout')
    const session = await agent.get('/auth/session')
    expect(logOut.status).toBe(200)
    expect(session.status).toBe(401)
    await prisma.user.deleteMany()
  })

  describe('when the email is already in use', () => {
    beforeEach(async () => {
      // Register a user
      await prisma.user.create({ data: { name, email, password } })
    })

    it('responds with 400 status code and message', async () => {
      const response = await agent
        .post('/auth/register')
        .send({ name, email, password })
      expect(response.status).toBe(400)
      expect(response.body).toStrictEqual({ message: 'Email already in use.' })
    })
  })

  describe('when given a valid email and password', () => {
    it('responds with JSON and 201 status code', async () => {
      const response = await agent
        .post('/auth/register')
        .send({ name, email, password })
      expect(response.status).toBe(201)
      expect(response.body).toStrictEqual({ success: true })
    })

    it('creates a new user', async () => {
      await agent.post('/auth/register').send({ name, email, password })
      const user = await prisma.user.findUniqueOrThrow({
        where: { email }
      })
      expect(user.id).toBeDefined()
      expect(user.name).toBe(name)
      expect(user.email).toBe(email)
      expect(user.password).toMatch(/^\$argon2id/)
    })

    it('creates a valid session', async () => {
      const register = await agent
        .post('/auth/register')
        .send({ name, email, password })
      expect(register.headers['set-cookie'][0]).toMatch(/connect\.sid/)

      const session = await agent.get('/auth/session')
      expect(session.status).toBe(200)
    })
  })
})

describe('POST /auth/login', () => {
  const agent = request.agent(app)

  beforeEach(async () => {
    // Ensure the user is registered, but not signed in
    await prisma.user.create({ data: { name, email, password } })
    const session = await agent.get('/auth/session')
    expect(session.status).toBe(401)
  })

  afterEach(async () => {
    // Sign out and delete user
    const logOut = await agent.get('/auth/logout')
    const session = await agent.get('/auth/session')
    expect(logOut.status).toBe(200)
    expect(session.status).toBe(401)
    await prisma.user.deleteMany()
  })

  describe('when the user is not registered', () => {
    it('responds with 401 status code and message', async () => {
      const response = await agent
        .post('/auth/login')
        .send({ email: 'another@example.com', password })
      expect(response.status).toBe(401)
      expect(response.body).toStrictEqual({ message: 'Incorrect email.' })
    })
  })

  describe('when the password is incorrect', () => {
    it('responds with 401 status code and message', async () => {
      const response = await agent
        .post('/auth/login')
        .send({ email, password: 'incorrect' })
      expect(response.status).toBe(401)
      expect(response.body).toStrictEqual({ message: 'Incorrect password.' })
    })
  })

  describe('when the user is registered and the password is correct', () => {
    it('responds with JSON and 200 status code', async () => {
      const response = await agent.post('/auth/login').send({ email, password })
      expect(response.status).toBe(200)
      expect(response.body).toStrictEqual({ success: true })
    })

    it('creates a valid session', async () => {
      const login = await agent.post('/auth/login').send({ email, password })
      expect(login.headers['set-cookie'][0]).toMatch(/connect\.sid/)

      const session = await agent.get('/auth/session')
      expect(session.status).toBe(200)
    })
  })
})

describe('GET /auth/session', () => {
  const agent = request.agent(app)

  afterEach(async () => {
    // Sign out and delete user
    const logOut = await agent.get('/auth/logout')
    const session = await agent.get('/auth/session')
    expect(logOut.status).toBe(200)
    expect(session.status).toBe(401)
    await prisma.user.deleteMany()
  })

  describe('when not signed in', () => {
    it('responds with null user and 401 status code', async () => {
      const response = await agent.get('/auth/session')
      expect(response.status).toBe(401)
      expect(response.body).toStrictEqual({ user: null })
    })
  })

  describe('when signed in', () => {
    it('responds with user and 200 status code', async () => {
      await agent.post('/auth/register').send({ name, email, password })
      const user = await prisma.user.findUnique({ where: { email } })
      const response = await agent.get('/auth/session')
      expect(response.status).toBe(200)
      expect(response.body).toStrictEqual({ user })
    })
  })
})

describe('GET /auth/logout', () => {
  const agent = request.agent(app)

  beforeEach(async () => {
    // Ensure the user is registered and signed in
    const register = await agent
      .post('/auth/register')
      .send({ name, email, password })
    const session = await agent.get('/auth/session')
    expect(register.status).toBe(201)
    expect(session.status).toBe(200)
  })

  afterEach(async () => {
    // Delete user
    await prisma.user.deleteMany()
  })

  it('responds with JSON and 200 status code', async () => {
    const response = await agent.get('/auth/logout')
    expect(response.status).toBe(200)
    expect(response.body).toStrictEqual({ success: true })
  })

  it('destroys the session', async () => {
    await agent.get('/auth/logout')

    const response = await agent.get('/auth/session')
    expect(response.status).toBe(401)
  })
})

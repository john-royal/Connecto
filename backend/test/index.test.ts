import request from 'supertest'
import app from '../src'

describe('GET /', () => {
  it('returns "Hello, world!"', async () => {
    const response = await request(app).get('/')
    expect(response.status).toBe(200)
    expect(response.text).toBe('Hello, world!')
  })
})

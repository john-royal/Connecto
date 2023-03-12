import { Server } from 'socket.io'
import type { Message } from './prisma'

const io = new Server()

io.on('connection', (socket) => {
  console.log('Client connected')

  socket.on('message', (message: Message) => {
    console.log(`Message received:`, message)
    io.emit('message', message) // broadcast to all clients
  })

  socket.on('disconnect', () => {
    console.log('Client disconnected')
  })
})

export default io

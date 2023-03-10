import CloseIcon from '@mui/icons-material/Close'
import Box from '@mui/joy/Box'
import Card from '@mui/joy/Card'
import CardContent from '@mui/joy/CardContent'
import Typography from '@mui/joy/Typography'
import type React from 'react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { io, type Socket } from 'socket.io-client'
import { v4 as uuidv4 } from 'uuid'
import DashboardLayout from '../layouts/DashboardLayout'
import { useAuth, type User } from '../lib/auth'

interface Message {
  id: string
  user: User
  content: string
  createdAt: Date
}

function ChatView() {
  const { user } = useAuth()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')

  useEffect(() => {
    const newSocket = io()

    newSocket.on('connect', () => {
      console.log('[socket.io] Connected to server')
    })

    newSocket.on('disconnect', () => {
      console.log('[socket.io] Disconnected from server')
    })

    newSocket.on('connect_error', (error) => {
      console.error('[socket.io]', error)
    })

    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
    }
  }, [])

  useEffect(() => {
    if (socket == null) return

    socket.on('message', (newMessage: Message) => {
      setMessages((messages) => [...messages, newMessage])
    })

    return () => {
      socket.off('message')
    }
  }, [socket])

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (socket == null || user == null)
      throw new Error('Missing user or socket')
    if (!inputValue) return

    socket.emit('message', {
      id: uuidv4(),
      user,
      content: inputValue,
      createdAt: new Date()
    })
    setInputValue('')
  }

  return (
    <DashboardLayout sidebarItems={<LeaveChatButton />}>
      <div>
        <ul>
          {messages.map(({ id, user, content }) => (
            <li key={id}>
              {user.name}: {content}
            </li>
          ))}
        </ul>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={inputValue}
            onChange={(event) => {
              setInputValue(event.target.value)
            }}
          />
          <button type="submit">Send</button>
        </form>
      </div>
    </DashboardLayout>
  )
}

function LeaveChatButton() {
  const card = (
    <Card>
      <CardContent>
        <Typography level="h4" component="div">
          Leave Chat
        </Typography>
        <CloseIcon sx={{ fontSize: 75, color: '#5e8b8f' }} />
      </CardContent>
    </Card>
  )

  return (
    <div className="LeaveChat">
      <Box
        sx={{
          minWidth: 100,
          minHeight: 100,
          border: 3,
          borderColor: '#59606D'
        }}
      >
        <Link to="/">{card}</Link>
      </Box>
    </div>
  )
}

export default ChatView

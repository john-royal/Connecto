import CloseIcon from '@mui/icons-material/Close'
import SendIcon from '@mui/icons-material/Send'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import Button from '@mui/material/Button'
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
      <div className="chatContainer">
        <div className="chatMessages">
          <ul>
            {messages.map(({ id, user, content }) => (
              <>
                <div className="messageName">{user.name}</div>
                <div className="messageBubble">
                  <li key={id}>{content}</li>
                </div>
              </>
            ))}
          </ul>
        </div>
        <div className="chatInputs">
          <form onSubmit={handleSubmit}>
            <div className="attachFileButton">
              <button type="submit">
                <AttachFileIcon sx={{ fontSize: 30 }} />
                <input hidden accept="image/*" multiple type="file" />
              </button>
            </div>
            <input
              type="text"
              value={inputValue}
              onChange={(event) => {
                setInputValue(event.target.value)
              }}
            />
            <div className="sendButton">
              <button type="submit">
                <SendIcon sx={{ fontSize: 45 }} />
              </button>
            </div>
          </form>
        </div>
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
        <div className="centerIcon">
          <CloseIcon sx={{ fontSize: 75, color: '#5e8b8f' }} />
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="LeaveChat">
      <Box
        sx={{
          minWidth: 100,
          minHeight: 100
        }}
      >
        <Link to="/" style={{ textDecoration: 'none' }}>
          {card}
        </Link>
      </Box>
    </div>
  )
}

export default ChatView

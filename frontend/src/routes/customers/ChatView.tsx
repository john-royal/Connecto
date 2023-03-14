import AttachFileIcon from '@mui/icons-material/AttachFile'
import CloseIcon from '@mui/icons-material/Close'
import SendIcon from '@mui/icons-material/Send'
import Box from '@mui/joy/Box'
import Card from '@mui/joy/Card'
import CardContent from '@mui/joy/CardContent'
import Typography from '@mui/joy/Typography'
import type React from 'react'
import { Fragment, useState } from 'react'
import { Link, useLoaderData } from 'react-router-dom'
import DashboardLayout from '../../layouts/DashboardLayout'
import { useChat } from '../../lib/chat'

function ChatView() {
  const { thread } = useLoaderData() as { thread: { id: number } }
  const { messages, sendMessage } = useChat(thread.id)
  const [inputValue, setInputValue] = useState('')

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    sendMessage(inputValue)
      .then(() => {
        setInputValue('')
      })
      .catch((error) => {
        console.error(error)
      })
  }

  return (
    <DashboardLayout sidebarItems={<LeaveChatButton />}>
      <div className="chatContainer">
        <div className="chatMessages">
          <ul>
            {messages.map(({ id, user, content }) => (
              <Fragment key={id}>
                <div className="messageName">{user.name}</div>
                <div className="messageBubble">
                  <li>{content}</li>
                </div>
              </Fragment>
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

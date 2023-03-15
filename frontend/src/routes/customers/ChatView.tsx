import '../../App.css'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import Button from '@mui/joy/Button'
import CloseIcon from '@mui/icons-material/Close'
import SendIcon from '@mui/icons-material/Send'
import Box from '@mui/joy/Box'
import Card from '@mui/joy/Card'
import CardContent from '@mui/joy/CardContent'
import IconButton from '@mui/joy/IconButton'
import Typography from '@mui/joy/Typography'
import Person from '@mui/icons-material/Person'
import Menu from '@mui/joy/Menu'
import MenuItem from '@mui/joy/MenuItem'
import type React from 'react'
import { Fragment, useState, useRef } from 'react'
import { Link, useLoaderData } from 'react-router-dom'
import DashboardLayout from '../../layouts/DashboardLayout'
import { useChat } from '../../lib/chat'
import { useAuth } from '../../lib/auth'
import Logo from '../../assets/logo.png'

function ChatView() {
  const { thread } = useLoaderData() as { thread: { id: number } }
  const { messages, sendMessage } = useChat(thread.id)
  const [inputValue, setInputValue] = useState('')
  const { user } = useAuth()

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

  const logo = (
    <Link
      to="/admin"
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        textDecoration: 'none'
      }}
    >
      <Typography component="h1" fontWeight="xl">
        <img src={Logo} alt="Logo" width="123" height="53" />
      </Typography>
    </Link>
  )

  function HeaderMenu() {
    const { user } = useAuth()
    const anchor = useRef<HTMLAnchorElement | null>(null)
    const [open, setOpen] = useState(false)

    const handleClose = () => {
      setOpen(false)
    }

    return (
      <>
        <IconButton
          id="basic-demo-button"
          onClick={() => {
            return
          }}
          size="sm"
          variant="outlined"
          sx={[
            {
              color: '#70ACB1',
              borderColor: '#70ACB1',
              p: 1,
              ml: 150,
              '&:hover': {
                backgroundColor: '#C6F1E7'
              },
              '&:active': {
                color: 'white',
                backgroundColor: '#70ACB1'
              }
            }
          ]}
        >
          <Link to="/" style={{ textDecoration: 'none', color: '#70ACB1' }}>
            Leave Chat
          </Link>
        </IconButton>
        <IconButton
          id="basic-demo-button"
          aria-controls={open ? 'basic-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          onClick={() => {
            setOpen(true)
          }}
          size="sm"
          variant="outlined"
          sx={[
            {
              color: '#70ACB1',
              borderColor: '#70ACB1',
              '&:hover': {
                backgroundColor: '#C6F1E7'
              },
              '&:active': {
                color: 'white',
                backgroundColor: '#70ACB1'
              }
            }
          ]}
          aria-label="Me"
          ref={anchor}
        >
          <Person />
        </IconButton>
        <Menu
          id="basic-menu"
          placement="bottom-end"
          anchorEl={anchor.current}
          open={open}
          onClose={handleClose}
          aria-labelledby="basic-demo-button"
          sx={{ minWidth: 120, zIndex: 1500 }}
        >
          <MenuItem>Hi, {user?.name ?? 'User'}</MenuItem>
          <MenuItem component={Link} to="/sign-out">
            Sign Out
          </MenuItem>
        </Menu>
      </>
    )
  }

  return (
    <>
      <Box
        component="header"
        className="Header"
        sx={{
          p: 2,
          gap: 2,
          bgcolor: 'background.surface',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          gridColumn: '1 / -1',
          borderBottom: '2px solid',
          borderColor: 'divider',
          position: 'sticky',
          top: 0,
          zIndex: 1000
        }}
      >
        {logo}
        <HeaderMenu />
      </Box>
      <DashboardLayout>
        <div className="chatContainer">
          <div className="chatMessages">
            <ul>
              {messages
                .map((message) => ({
                  message,
                  isMe: message.user.id === user?.id
                }))
                .map(({ message, isMe }) =>
                  isMe ? (
                    <Fragment key={message.id}>
                      <div className="rightMessageName">
                        {message.user.name}
                      </div>
                      <div className="rightMessageBubble">
                        <li>{message.content}</li>
                      </div>
                    </Fragment>
                  ) : (
                    <Fragment key={message.id}>
                      <div className="leftMessageName">{message.user.name}</div>
                      <div className="leftMessageBubble">
                        <li>{message.content}</li>
                      </div>
                    </Fragment>
                  )
                )}
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
    </>
  )
}

function LeaveChatButton() {
  const card = (
    <IconButton
      id="basic-demo-button"
      onClick={() => {
        return
      }}
      size="sm"
      variant="outlined"
      sx={[
        {
          color: '#70ACB1',
          borderColor: '#70ACB1',
          '&:hover': {
            backgroundColor: '#C6F1E7'
          },
          '&:active': {
            color: 'white',
            backgroundColor: '#70ACB1'
          }
        }
      ]}
      aria-label="Me"
    >
      Leave chat
    </IconButton>
  )

  return (
    <div className="LeaveChat">
      <Box>
        <Link to="/" style={{ textDecoration: 'none' }}>
          {card}
        </Link>
      </Box>
    </div>
  )
}

export default ChatView

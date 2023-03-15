import '../../App.css'
import SendIcon from '@mui/icons-material/Send'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import Box from '@mui/joy/Box'
import CircularProgress from '@mui/joy/CircularProgress'
import FormControl from '@mui/joy/FormControl'
import FormHelperText from '@mui/joy/FormHelperText'
import IconButton from '@mui/joy/IconButton'
import Input from '@mui/joy/Input'
import {
  Fragment,
  forwardRef,
  useEffect,
  useRef,
  useState,
  type FormEventHandler,
  type Ref
} from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../../lib/auth'
import { useChat, type Message } from '../../lib/chat'
import DashboardLayout from '../../layouts/DashboardLayout'

function MessageContainer(thread) {
  const { messages, sendMessage } = useChat(Number(thread))
  const { user } = useAuth()
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
    <>
      <DashboardLayout>
        <div className="adminChatContainer">
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
                  <AttachFileIcon
                    sx={{
                      height: 0.8,
                      width: 0.9,
                      minHeight: 20,
                      minWidth: 20
                    }}
                  />
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
                  <SendIcon
                    sx={{
                      height: 0.8,
                      width: 0.9,
                      minHeight: 20,
                      minWidth: 20
                    }}
                  />
                </button>
              </div>
            </form>
          </div>
        </div>
      </DashboardLayout>
    </>
  )
}

function MessageForm(
  { onSubmit }: { onSubmit: (message: string) => Promise<void> },
  ref?: Ref<HTMLFormElement>
) {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit: FormEventHandler = (e) => {
    e.preventDefault()
    setLoading(true)
    onSubmit(message)
      .then(() => {
        setMessage('')
      })
      .catch((error) => {
        setError(error.message)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  return (
    <form onSubmit={handleSubmit} ref={ref}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 1.5,
          mt: 2,
          overflowAnchor: 'auto'
        }}
      >
        <FormControl sx={{ flex: 1 }}>
          <Input
            sx={{ flex: 1 }}
            name="message"
            placeholder="Type your message"
            value={message}
            onChange={(e) => {
              setMessage(e.target.value)
            }}
            disabled={loading}
            error={error.length > 0}
            endDecorator={
              <IconButton
                variant="soft"
                color="primary"
                title="Send"
                disabled={loading || message.length === 0}
              >
                {loading ? <CircularProgress /> : <SendIcon />}
              </IconButton>
            }
          />
          {error && (
            <FormHelperText sx={{ color: 'danger.500' }}>
              {error}
            </FormHelperText>
          )}
        </FormControl>
      </Box>
    </form>
  )
}

const MessageFormWithRef = forwardRef(MessageForm)

function AdminChatView() {
  const formRef = useRef<HTMLFormElement>(null)
  const { threadId } = useParams<{ threadId: string }>()
  const chat = useChat(Number(threadId))

  // Scroll to the bottom of the chat when new messages arrive
  useEffect(() => {
    formRef.current?.scrollIntoView({ behavior: 'auto' })
  }, [chat.messages])

  return (
    <>
      <MessageContainer thread={threadId} />
    </>
  )
}

export default AdminChatView

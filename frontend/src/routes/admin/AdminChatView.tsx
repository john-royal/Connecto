import SendIcon from '@mui/icons-material/Send'
import Box from '@mui/joy/Box'
import Card from '@mui/joy/Card'
import CircularProgress from '@mui/joy/CircularProgress'
import FormControl from '@mui/joy/FormControl'
import FormHelperText from '@mui/joy/FormHelperText'
import IconButton from '@mui/joy/IconButton'
import Input from '@mui/joy/Input'
import Typography from '@mui/joy/Typography'
import {
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

function MessageList({ messages }: { messages: Message[] }) {
  const { user } = useAuth()

  return (
    <Box sx={{ flex: 1 }}>
      {messages
        .map((message) => ({ message, isMe: message.user.id === user?.id }))
        .map(({ message, isMe }) => (
          <Box
            key={message.id}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: isMe ? 'flex-end' : 'flex-start',
              mb: 2
            }}
          >
            <Card
              variant="outlined"
              sx={{
                maxWidth: '75%',
                textAlign: isMe ? 'right' : 'left',
                boxShadow: 'none'
              }}
            >
              <Typography fontSize="sm" color="neutral">
                {message.user.name}
              </Typography>
              <Typography>{message.content}</Typography>
            </Card>
          </Box>
        ))}
    </Box>
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
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        overflowAnchor: 'none',
        p: 2
      }}
    >
      <MessageList messages={chat.messages} />
      <MessageFormWithRef onSubmit={chat.sendMessage} ref={formRef} />
    </Box>
  )
}

export default AdminChatView

import Avatar from '@mui/joy/Avatar'
import Box from '@mui/joy/Box'
import List from '@mui/joy/List'
import ListItem from '@mui/joy/ListItem'
import ListItemButton from '@mui/joy/ListItemButton'
import ListItemDecorator from '@mui/joy/ListItemDecorator'
import { type SxProps } from '@mui/joy/styles/types'
import Typography from '@mui/joy/Typography'
import format from 'date-fns/format'
import isToday from 'date-fns/isToday'
import { useEffect } from 'react'
import { Link, Outlet, useParams } from 'react-router-dom'
import useSWR, { useSWRConfig } from 'swr'
import Header from '../components/Header'
import { RequireAuth } from '../lib/auth'
import { type Message } from '../lib/chat'

interface ThreadPreview {
  id: number
  customer: { id: number; name: string }
  messages: Message[]
}

function AdminLayout() {
  const { threadId } = useParams<{ threadId: string }>()

  return (
    <RequireAuth isAdmin={true}>
      <Header
        leaveChatThreadId={threadId != null ? Number(threadId) : undefined}
      />
      <Box sx={{ display: 'flex', flexDirection: 'row', maxWidth: '100vw' }}>
        <ThreadsList />
        <Box
          component="main"
          className="Main"
          sx={{
            p: 2,
            flexGrow: 1,
            height: 'calc(100vh - 93.5px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-around',
            backgroundColor: 'background.level1'
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </RequireAuth>
  )
}

function ThreadsList() {
  const { data: threads } = useSWR<ThreadPreview[]>(
    '/api/threads',
    async (url) => {
      return await fetch(url)
        .then(async (res) => await res.json())
        .then(({ threads }) => threads)
    }
  )
  const { mutate } = useSWRConfig()

  useEffect(() => {
    if (threads == null) return
    void Promise.all(
      threads.map(
        async (thread) => await mutate(`/api/threads/${thread.id}`, thread)
      )
    )
  }, [threads])

  return (
    <Box
      sx={{
        bgcolor: '#ecfbf8',
        borderRight: '1px solid',
        borderColor: 'divider',
        width: '300px',
        flexShrink: 0
      }}
    >
      <List>
        {(threads ?? []).map((item, index) => (
          <ThreadListRow
            {...item}
            key={item.id}
            sx={index === 0 ? { borderTop: '1px solid' } : {}}
          />
        ))}
      </List>
    </Box>
  )
}

function ThreadListRow({ id, sx }: ThreadPreview & { sx?: SxProps }) {
  const params = useParams()
  const { data: thread } = useSWR<ThreadPreview>(
    `/api/threads/${id}`,
    async (url) => {
      return await fetch(url)
        .then(async (res) => await res.json())
        .then(({ thread }) => thread)
    }
  )
  const customer = thread?.customer
  const isSelected = id === Number(params.threadId)

  const messages = thread?.messages ?? []
  const { createdAt, content } =
    messages.length > 0
      ? messages[messages.length - 1]
      : { createdAt: new Date(), content: 'No messages' }
  const date = new Date(createdAt)
  const timestamp = isToday(date)
    ? format(date, 'h:mm a')
    : format(date, 'MM/dd/yyyy')
  const preview = content.length > 25 ? `${content.slice(0, 25)}...` : content

  return (
    <ListItem
      sx={{
        ...sx,
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}
    >
      <ListItemButton
        color={isSelected ? 'primary' : 'neutral'}
        variant={isSelected ? 'solid' : 'plain'}
        sx={{ p: 2 }}
        component={Link}
        to={`/admin/${id}`}
      >
        <ListItemDecorator sx={{ alignSelf: 'flex-start' }}>
          <Avatar
            sx={{ borderRadius: 'md' }}
            alt={customer.name}
            src={`/api/avatar/${customer?.id}`}
          >
            {customer.name
              .split(/\s+/)
              .map((word) => word[0])
              .join('')}
          </Avatar>
        </ListItemDecorator>
        <Box sx={{ pl: 2, width: '100%' }}>
          <Box>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start'
              }}
            >
              <Typography level="body1" fontWeight="bold">
                {customer?.name}
              </Typography>
              <Typography level="body3" color="neutral">
                {timestamp}
              </Typography>
            </Box>
            <Typography level="body2">{preview}</Typography>
          </Box>
        </Box>
      </ListItemButton>
    </ListItem>
  )
}

export default AdminLayout

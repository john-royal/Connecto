import Avatar from '@mui/joy/Avatar'
import Box from '@mui/joy/Box'
import List from '@mui/joy/List'
import ListDivider from '@mui/joy/ListDivider'
import ListItem from '@mui/joy/ListItem'
import ListItemButton from '@mui/joy/ListItemButton'
import ListItemDecorator from '@mui/joy/ListItemDecorator'
import Typography from '@mui/joy/Typography'
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
        {(threads ?? []).map((item) => (
          <ThreadListRow {...item} key={item.id} />
        ))}
      </List>
    </Box>
  )
}

function ThreadListRow({ id }: ThreadPreview) {
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
  const messages = thread?.messages ?? []
  const selected = id === Number(params.threadId)

  return (
    <>
      <ListItem>
        <ListItemButton
          color={selected ? 'primary' : 'neutral'}
          variant={selected ? 'solid' : 'plain'}
          sx={{ p: 2 }}
          component={Link}
          to={`/admin/${id}`}
        >
          <ListItemDecorator sx={{ alignSelf: 'flex-start' }}>
            <Avatar sx={{ borderRadius: 'md' }}>
              {customer?.name
                .split(/\s+/)
                .map((word) => word[0])
                .join('')}
            </Avatar>
          </ListItemDecorator>
          <Box sx={{ pl: 2, width: '100%' }}>
            <Box>
              <Typography sx={{ mb: 0.5 }}>{customer?.name}</Typography>
              <Typography level="body2">
                {messages.length === 0
                  ? 'No messages'
                  : messages[messages.length - 1].content.slice(0, 50)}
              </Typography>
            </Box>
          </Box>
        </ListItemButton>
      </ListItem>
      <ListDivider sx={{ m: 0 }} />
    </>
  )
}

export default AdminLayout

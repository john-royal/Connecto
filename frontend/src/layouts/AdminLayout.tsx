import Avatar from '@mui/joy/Avatar'
import Box from '@mui/joy/Box'
import List from '@mui/joy/List'
import ListDivider from '@mui/joy/ListDivider'
import ListItem from '@mui/joy/ListItem'
import ListItemButton from '@mui/joy/ListItemButton'
import ListItemDecorator from '@mui/joy/ListItemDecorator'
import Typography from '@mui/joy/Typography'
import { useEffect } from 'react'
import {
  Link,
  Outlet,
  useLoaderData,
  useNavigate,
  useParams
} from 'react-router-dom'
import useSWR, { useSWRConfig } from 'swr'
import LoadingView from '../components/LoadingView'
import { useAuth } from '../lib/auth'
import { type Message } from '../lib/chat'
import Header from '../components/Header'

interface ThreadPreview {
  id: number
  customer: { id: number; name: string }
  messages: Message[]
}

function AdminLayout() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { threads } = useLoaderData() as { threads: ThreadPreview[] }
  const { mutate } = useSWRConfig()

  useEffect(() => {
    if (user === null) {
      navigate('/sign-in')
    }
  }, [user, navigate])

  if (user === undefined) {
    return <LoadingView />
  }

  threads.forEach((thread) => {
    void mutate(`/api/threads/${thread.id}`, thread.messages)
  })

  return (
    <>
      {window.location.pathname === '/admin' ? (
        <Header leaveChat={false} />
      ) : (
        <Header leaveChat={true} />
      )}
      <Box sx={{ display: 'flex', flexDirection: 'row', maxWidth: '100vw' }}>
        <ThreadsList threads={threads} />
        <Box
          component="main"
          className="Main"
          sx={{
            p: 2,
            overflow: 'scroll',
            flexGrow: 1,
            height: 'calc(100vh - 65px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            backgroundColor: 'background.level1'
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </>
  )
}

function ThreadsList({ threads }: { threads: ThreadPreview[] }) {
  return (
    <Box
      className="Inbox"
      sx={{
        bgcolor: '#ecfbf8',
        borderRight: '1px solid',
        borderColor: 'divider',
        position: 'relative',
        width: '300px'
      }}
    >
      <List>
        {threads.map((item) => (
          <ThreadListRow {...item} key={item.id} />
        ))}
      </List>
    </Box>
  )
}

function ThreadListRow({
  id,
  customer,
  messages: initialMessages
}: ThreadPreview) {
  const params = useParams()
  const { data } = useSWR<Message[]>(`/api/threads/${id}`, async (url) => {
    return await fetch(url)
      .then(async (res) => await res.json())
      .then(({ thread }) => thread.messages)
  })
  const messages = data ?? initialMessages
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
              {customer.name
                .split(/\s+/)
                .map((word) => word[0])
                .join('')}
            </Avatar>
          </ListItemDecorator>
          <Box sx={{ pl: 2, width: '100%' }}>
            <Box>
              <Typography sx={{ mb: 0.5 }}>{customer.name}</Typography>
              <Typography level="body2">
                {messages.length === 0
                  ? 'No messages'
                  : messages[messages.length - 1].content}
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

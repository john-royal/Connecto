import ConnectWithoutContactIcon from '@mui/icons-material/ConnectWithoutContact'
import Person from '@mui/icons-material/Person'
import Avatar from '@mui/joy/Avatar'
import Box from '@mui/joy/Box'
import IconButton from '@mui/joy/IconButton'
import List from '@mui/joy/List'
import ListDivider from '@mui/joy/ListDivider'
import ListItem from '@mui/joy/ListItem'
import ListItemButton from '@mui/joy/ListItemButton'
import ListItemDecorator from '@mui/joy/ListItemDecorator'
import Menu from '@mui/joy/Menu'
import MenuItem from '@mui/joy/MenuItem'
import Typography from '@mui/joy/Typography'
import { useEffect, useRef, useState } from 'react'
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
import Logo from '../assets/logo.png'

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
      <Header />
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

function Header() {
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

  return (
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
  )
}

function HeaderMenu() {
  const { user } = useAuth()
  const anchor = useRef<HTMLAnchorElement | null>(null)
  const [open, setOpen] = useState(false)

  const handleClose = () => {
    setOpen(false)
  }

  return (
    <>
      <div>
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
              p: 2,
              mr: 3,
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
      </div>
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

function ThreadsList({ threads }: { threads: ThreadPreview[] }) {
  return (
    <Box
      className="Inbox"
      sx={{
        bgcolor: 'background.surface',
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
          variant={selected ? 'soft' : 'plain'}
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

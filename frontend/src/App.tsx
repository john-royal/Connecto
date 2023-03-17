import CssBaseline from '@mui/joy/CssBaseline'
import {
  CssVarsProvider,
  StyledEngineProvider,
  extendTheme
} from '@mui/joy/styles'
import { type PropsWithChildren } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import LoadingView from './components/LoadingView'
import AdminLayout from './layouts/AdminLayout'
import { AuthProvider } from './lib/auth'
import AdminChatView from './routes/admin/AdminChatView'
import AdminNoChatView from './routes/admin/AdminNoChatView'
import CreateAccount from './routes/auth/CreateAccount'
import SignIn from './routes/auth/SignIn'
import SignOut from './routes/auth/SignOut'
import ChatView from './routes/customers/ChatView'
import StartView from './routes/customers/StartView'

const theme = extendTheme({
  colorSchemes: {
    light: {
      palette: {
        primary: {
          50: '#fdf2f8',
          100: '#70ACB1',
          200: '#C6F1E7', // selected color
          300: '#aed6cd', // hover when selected
          400: '#70ACB1',
          500: '#70ACB1',
          600: '#70ACB1',
          700: '#70ACB1',
          800: '#70ACB1',
          900: '#70ACB1',
          solidBg: 'var(--joy-palette-primary-200)',
          solidHoverBg: 'var(--joy-palette-primary-300)'
          // solidHoverBg: 'var(--joy-palette-primary-200)',
          // plainActiveBg: 'var(--joy-palette-primary-200)',
          // outlinedBorder: 'var(--joy-palette-secondary-500)',
          // outlinedColor: 'var(--joy-palette-secondary-700)',
          // outlinedActiveBg: 'var(--joy-palette-secondary-100)',
          // softColor: 'var(--joy-palette-secondary-800)',
          // softBg: 'var(--joy-palette-primary-200)',
          // softActiveBg: 'var(--joy-palette-secondary-300)',
          // plainColor: 'var(--joy-palette-secondary-700)',
        }
      }
    }
  }
})

const router = createBrowserRouter([
  {
    path: '/',
    element: <StartView />
  },
  {
    path: '/chat',
    loader: async () => {
      const existingThreads = await (await fetch('/api/threads')).json()
      if (existingThreads.threads.length === 0) {
        const response = await fetch('/api/threads', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: '{}'
        })
        return await response.json()
      } else {
        return { thread: existingThreads.threads[0] }
      }
    },
    element: <ChatView />
  },
  {
    element: <AdminLayout />,
    loader: async () => await (await fetch('/api/threads')).json(),
    children: [
      {
        path: '/admin',
        element: <AdminNoChatView />
      },
      {
        path: '/admin/:threadId',
        element: <AdminChatView />
      }
    ]
  },
  {
    path: '/sign-in',
    element: <SignIn />
  },
  {
    path: '/create-account',
    element: <CreateAccount />
  },
  {
    path: '/sign-out',
    element: <SignOut />
  }
])

export default function App() {
  return (
    <StylingProvider>
      <AuthProvider>
        <RouterProvider router={router} fallbackElement={<LoadingView />} />
      </AuthProvider>
    </StylingProvider>
  )
}

function StylingProvider({ children }: PropsWithChildren) {
  return (
    <StyledEngineProvider injectFirst>
      <CssVarsProvider theme={theme}>
        <CssBaseline />
        {children}
      </CssVarsProvider>
    </StyledEngineProvider>
  )
}

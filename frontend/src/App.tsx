import CssBaseline from '@mui/joy/CssBaseline'
import { CssVarsProvider, StyledEngineProvider } from '@mui/joy/styles'
import { type PropsWithChildren } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import LoadingView from './components/LoadingView'
import AdminLayout from './layouts/AdminLayout'
import { AuthProvider } from './lib/auth'
import AdminChatView from './routes/admin/AdminChatView'
import CreateAccount from './routes/auth/CreateAccount'
import SignIn from './routes/auth/SignIn'
import SignOut from './routes/auth/SignOut'
import ChatView from './routes/customers/ChatView'
import StartView from './routes/customers/StartView'

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
        element: <p>Choose a thread.</p>
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
      <CssVarsProvider>
        <CssBaseline />
        {children}
      </CssVarsProvider>
    </StyledEngineProvider>
  )
}

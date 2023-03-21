import CssBaseline from '@mui/joy/CssBaseline'
import {
  CssVarsProvider,
  extendTheme,
  StyledEngineProvider
} from '@mui/joy/styles'
import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom'

import AdminLayout from './layouts/AdminLayout'
import DashboardLayout from './layouts/DashboardLayout'
import { AuthProvider } from './lib/auth'
import AdminChatView from './routes/admin/AdminChatView'
import AdminStartView from './routes/admin/AdminStartView'
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
          solidHoverBg: 'var(--joy-palette-primary-300)',
          // solidHoverBg: 'var(--joy-palette-primary-200)',
          // plainActiveBg: 'var(--joy-palette-primary-200)',
          // outlinedBorder: 'var(--joy-palette-secondary-500)',
          // outlinedColor: 'var(--joy-palette-secondary-700)',
          // outlinedActiveBg: 'var(--joy-palette-secondary-100)',
          softColor: 'var(--joy-palette-primary-300)'
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
    element: <Providers />,
    children: [
      {
        path: '/',
        element: <DashboardLayout />,
        children: [
          {
            path: '/',
            element: <StartView />
          },
          {
            path: '/chat',
            element: <ChatView />
          }
        ]
      },
      {
        element: <AdminLayout />,
        children: [
          {
            path: '/admin',
            element: <AdminStartView />
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
    ]
  }
])

export default function App() {
  return <RouterProvider router={router} />
}

function Providers() {
  return (
    <StyledEngineProvider injectFirst>
      <CssVarsProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <Outlet />
        </AuthProvider>
      </CssVarsProvider>
    </StyledEngineProvider>
  )
}

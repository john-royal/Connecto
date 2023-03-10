import CssBaseline from '@mui/joy/CssBaseline';
import { CssVarsProvider, StyledEngineProvider } from '@mui/joy/styles';
import { PropsWithChildren } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import LoadingView from './components/LoadingView';
import { AuthProvider } from './lib/auth';
import CreateAccount from './routes/auth/CreateAccount';
import SignIn from './routes/auth/SignIn';
import SignOut from './routes/auth/SignOut';
import ChatView from './routes/ChatView';
import StartView from './routes/StartView';

const router = createBrowserRouter([
  {
    path: '/',
    element: <StartView />,
  },
  {
    path: '/chat',
    element: <ChatView />,
  },
  {
    path: '/sign-in',
    element: <SignIn />,
  },
  {
    path: '/create-account',
    element: <CreateAccount />,
  },
  {
    path: '/sign-out',
    element: <SignOut />,
  },
]);

export default function App() {
  return (
    <StylingProvider>
      <AuthProvider>
        <RouterProvider router={router} fallbackElement={<LoadingView />} />
      </AuthProvider>
    </StylingProvider>
  );
}

function StylingProvider({ children }: PropsWithChildren) {
  return (
    <StyledEngineProvider injectFirst>
      <CssVarsProvider>
        <CssBaseline />
        {children}
      </CssVarsProvider>
    </StyledEngineProvider>
  );
}

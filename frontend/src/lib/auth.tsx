import { createContext, useContext, type PropsWithChildren } from 'react'
import useSWR from 'swr'

export interface User {
  id: number
  name: string
  email: string
  isAdmin: boolean
}

export interface Auth {
  user?: User | null
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  createAccount: (user: {
    name: string
    email: string
    phone: string
    password: string
  }) => Promise<void>
}

const DEFAULT_AUTH_CONTEXT = {} as Auth // eslint-disable-line @typescript-eslint/consistent-type-assertions

const AuthContext = createContext(DEFAULT_AUTH_CONTEXT)

// Exported with underscores because this is a private context, exported for testing only.
// The public API consists of the AuthProvider and useAuth hook.
export { AuthContext as TestAuthContext }

export function AuthProvider({ children }: PropsWithChildren) {
  const { data: user, mutate } = useSWR<User | null>(
    '/api/auth/session',
    async (url) => {
      const response = await fetch(url)
      if (response.ok) {
        const body = await response.json()
        return body.user as User
      } else {
        return null
      }
    }
  )

  const signIn = async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })

    const json = await response.json()
    if (json.success as boolean) {
      await mutate()
    } else {
      throw new Error(json.message)
    }
  }

  const signOut = async () => {
    await fetch('/api/auth/logout', { method: 'GET' })
    await mutate()
  }

  const createAccount = async (user: {
    name: string
    email: string
    password: string
  }) => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    })

    const json = await response.json()
    if (json.success as boolean) {
      await mutate()
    } else {
      throw new Error(json.message)
    }
  }

  const state = {
    user,
    signIn,
    signOut,
    createAccount
  }

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>
}

export function useAuth(): Auth {
  return useContext(AuthContext)
}

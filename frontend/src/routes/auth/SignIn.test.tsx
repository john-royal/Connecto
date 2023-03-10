import '@testing-library/jest-dom/extend-expect'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, useNavigate } from 'react-router-dom'
import { type Mock } from 'vitest'
import { TestAuthContext, type Auth } from '../../lib/auth'
import SignIn from './SignIn'

vi.mock('react-router-dom', async (importOriginal) => {
  const original: object = await importOriginal()
  return {
    ...original,
    useNavigate: vi.fn()
  }
})

interface AuthMock extends Auth {
  createAccount: Mock
  signIn: Mock
  signOut: Mock
}

describe('SignIn', () => {
  let auth: AuthMock

  beforeEach(() => {
    auth = {
      user: null,
      createAccount: vi.fn().mockResolvedValue(null),
      signIn: vi.fn().mockResolvedValue(null),
      signOut: vi.fn().mockResolvedValue(null)
    }
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('renders correctly', () => {
    render(
      <MemoryRouter initialEntries={['/sign-in']}>
        <TestAuthContext.Provider value={auth}>
          <SignIn />
        </TestAuthContext.Provider>
      </MemoryRouter>
    )

    expect(screen.getByRole('heading')).toHaveTextContent('Sign In')
    expect(screen.getByTestId('email')).toBeInTheDocument()
    expect(screen.getByTestId('password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument()
  })

  it('calls sign in function and redirects when form is submitted', async () => {
    const mockNavigate = vi.fn()
    ;(useNavigate as Mock).mockReturnValue(mockNavigate)

    render(
      <MemoryRouter initialEntries={['/sign-in']}>
        <TestAuthContext.Provider value={auth}>
          <SignIn />
        </TestAuthContext.Provider>
      </MemoryRouter>
    )

    await act(async () => {
      fireEvent.change(screen.getByTestId('email'), {
        target: { value: 'john.doe@email.com' }
      })
      fireEvent.change(screen.getByTestId('password'), {
        target: { value: 'password' }
      })
      fireEvent.click(screen.getByRole('button', { name: 'Sign In' }))
    })

    await waitFor(() => {
      expect(auth.signIn).toHaveBeenCalledTimes(1)
    })
    expect(auth.signIn).toHaveBeenCalledWith('john.doe@email.com', 'password')
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledTimes(1)
    })
    expect(mockNavigate).toHaveBeenCalledWith('/')
  })
})

import '@testing-library/jest-dom/extend-expect'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, useNavigate } from 'react-router-dom'
import { type Mock } from 'vitest'
import { TestAuthContext, type Auth } from '../../lib/auth'
import CreateAccount from './CreateAccount'

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

describe('CreateAccount', () => {
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
      <MemoryRouter initialEntries={['/create-account']}>
        <TestAuthContext.Provider value={auth}>
          <CreateAccount />
        </TestAuthContext.Provider>
      </MemoryRouter>
    )

    expect(screen.getByRole('heading')).toHaveTextContent('Create Account')
    expect(screen.getByTestId('name')).toBeInTheDocument()
    expect(screen.getByTestId('email')).toBeInTheDocument()
    expect(screen.getByTestId('phone')).toBeInTheDocument()
    expect(screen.getByTestId('password')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Create Account' })
    ).toBeInTheDocument()
  })

  it('calls create account function when form is submitted', async () => {
    const mockNavigate = vi.fn()
    ;(useNavigate as Mock).mockReturnValue(mockNavigate)

    render(
      <MemoryRouter initialEntries={['/create-account']}>
        <TestAuthContext.Provider value={auth}>
          <CreateAccount />
        </TestAuthContext.Provider>
      </MemoryRouter>
    )

    await act(async () => {
      fireEvent.change(screen.getByTestId('name'), {
        target: { value: 'John Doe' }
      })
      fireEvent.change(screen.getByTestId('email'), {
        target: { value: 'john.doe@email.com' }
      })
      fireEvent.change(screen.getByTestId('phone'), {
        target: { value: '8773934448' }
      })
      fireEvent.change(screen.getByTestId('password'), {
        target: { value: 'password' }
      })
      fireEvent.click(screen.getByRole('button', { name: 'Create Account' }))
    })

    await waitFor(() => {
      expect(auth.createAccount).toHaveBeenCalledTimes(1)
    })
    expect(auth.createAccount).toHaveBeenCalledWith({
      name: 'John Doe',
      email: 'john.doe@email.com',
      phone: '8773934448',
      password: 'password'
    })
  })

  it('displays error message when create account fails', async () => {
    auth.createAccount.mockRejectedValue(new Error('Error creating account'))

    render(
      <MemoryRouter initialEntries={['/create-account']}>
        <TestAuthContext.Provider value={auth}>
          <CreateAccount />
        </TestAuthContext.Provider>
      </MemoryRouter>
    )

    await act(async () => {
      fireEvent.change(screen.getByTestId('name'), {
        target: { value: 'John Doe' }
      })
      fireEvent.change(screen.getByTestId('email'), {
        target: { value: 'john.doe@email.com' }
      })
      fireEvent.change(screen.getByTestId('phone'), {
        target: { value: '8773934448' }
      })
      fireEvent.change(screen.getByTestId('password'), {
        target: { value: 'password' }
      })
      fireEvent.click(screen.getByRole('button', { name: 'Create Account' }))
    })

    await waitFor(() => {
      expect(auth.createAccount).toHaveBeenCalledTimes(1)
    })
    await waitFor(() => {
      expect(screen.getByText('Error creating account')).toBeInTheDocument()
    })
  })
})

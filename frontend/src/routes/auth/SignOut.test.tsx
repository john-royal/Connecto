import '@testing-library/jest-dom/extend-expect'
import { render } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import { useNavigate } from 'react-router-dom'
import { type Mock } from 'vitest'
import { useAuth } from '../../lib/auth'
import SignOut from './SignOut'

// Mock useNavigate hook
vi.mock('react-router-dom', async (importOriginal) => {
  const original: object = await importOriginal()
  return {
    ...original,
    useNavigate: vi.fn()
  }
})

// Mock useAuth hook
vi.mock('../../lib/auth', async (importOriginal) => {
  const original: object = await importOriginal()
  return {
    ...original,
    useAuth: vi.fn()
  }
})

describe('SignOut', () => {
  let signOutMock: Mock
  let navigateMock: Mock

  beforeEach(() => {
    // Reset the mocks before each test
    vi.resetAllMocks()

    signOutMock = vi.fn(async () => {
      await Promise.resolve()
    })
    navigateMock = vi.fn()
    ;(useAuth as Mock).mockReturnValue({ signOut: signOutMock })
    ;(useNavigate as Mock).mockReturnValue(navigateMock)
  })

  it('calls the signOut function on mount', async () => {
    await act(async () => {
      render(<SignOut />)
    })
    expect(signOutMock).toHaveBeenCalled()
  })

  it('navigates to /sign-in after sign out', async () => {
    await act(async () => {
      render(<SignOut />)
    })
    expect(navigateMock).toHaveBeenCalledWith('/sign-in')
  })

  it('displays a loading view while signing out', async () => {
    const { getByTestId } = render(<SignOut />)
    expect(getByTestId('loading-view')).toBeInTheDocument()
  })
})

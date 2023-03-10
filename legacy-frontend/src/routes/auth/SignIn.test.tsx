import '@testing-library/jest-dom/extend-expect';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { Auth, TestAuthContext } from '../../lib/auth';
import SignIn from './SignIn';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

interface AuthMock extends Auth {
  createAccount: jest.Mock;
  signIn: jest.Mock;
  signOut: jest.Mock;
}

describe('SignIn', () => {
  let auth: AuthMock;

  beforeEach(() => {
    auth = {
      user: null,
      createAccount: jest.fn().mockResolvedValue(null),
      signIn: jest.fn().mockResolvedValue(null),
      signOut: jest.fn().mockResolvedValue(null),
    };
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('renders correctly', () => {
    render(
      <MemoryRouter initialEntries={['/sign-in']}>
        <TestAuthContext.Provider value={auth}>
          <SignIn />
        </TestAuthContext.Provider>
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading')).toHaveTextContent('Sign In');
    expect(screen.getByTestId('email')).toBeInTheDocument();
    expect(screen.getByTestId('password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
  });

  it('calls sign in function and redirects when form is submitted', async () => {
    const mockNavigate = jest.fn();
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);

    render(
      <MemoryRouter initialEntries={['/sign-in']}>
        <TestAuthContext.Provider value={auth}>
          <SignIn />
        </TestAuthContext.Provider>
      </MemoryRouter>,
    );

    await act(async () => {
      fireEvent.change(screen.getByTestId('email'), { target: { value: 'john.doe@email.com' } });
      fireEvent.change(screen.getByTestId('password'), { target: { value: 'password' } });
      fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));
    });

    await waitFor(() => expect(auth.signIn).toHaveBeenCalledTimes(1));
    expect(auth.signIn).toHaveBeenCalledWith('john.doe@email.com', 'password');
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledTimes(1));
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});

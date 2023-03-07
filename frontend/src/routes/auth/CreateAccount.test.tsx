import '@testing-library/jest-dom/extend-expect';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { Auth, TestAuthContext } from '../../lib/auth';
import CreateAccount from './CreateAccount';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

interface AuthMock extends Auth {
  createAccount: jest.Mock;
  signIn: jest.Mock;
  signOut: jest.Mock;
}

describe('CreateAccount', () => {
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
      <MemoryRouter initialEntries={['/create-account']}>
        <TestAuthContext.Provider value={auth}>
          <CreateAccount />
        </TestAuthContext.Provider>
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading')).toHaveTextContent('Create Account');
    expect(screen.getByTestId('name')).toBeInTheDocument();
    expect(screen.getByTestId('email')).toBeInTheDocument();
    expect(screen.getByTestId('password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create Account' })).toBeInTheDocument();
  });

  it('calls create account function and redirects when form is submitted', async () => {
    const mockNavigate = jest.fn();
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);

    render(
      <MemoryRouter initialEntries={['/create-account']}>
        <TestAuthContext.Provider value={auth}>
          <CreateAccount />
        </TestAuthContext.Provider>
      </MemoryRouter>,
    );

    await act(async () => {
      fireEvent.change(screen.getByTestId('name'), { target: { value: 'John Doe' } });
      fireEvent.change(screen.getByTestId('email'), { target: { value: 'john.doe@email.com' } });
      fireEvent.change(screen.getByTestId('password'), { target: { value: 'password' } });
      fireEvent.click(screen.getByRole('button', { name: 'Create Account' }));
    });

    await waitFor(() => expect(auth.createAccount).toHaveBeenCalledTimes(1));
    expect(auth.createAccount).toHaveBeenCalledWith({
      name: 'John Doe',
      email: 'john.doe@email.com',
      password: 'password',
    });
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledTimes(1));
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('displays error message when create account fails', async () => {
    auth.createAccount.mockRejectedValue(new Error('Error creating account'));

    render(
      <MemoryRouter initialEntries={['/create-account']}>
        <TestAuthContext.Provider value={auth}>
          <CreateAccount />
        </TestAuthContext.Provider>
      </MemoryRouter>,
    );

    await act(async () => {
      fireEvent.change(screen.getByTestId('name'), { target: { value: 'John Doe' } });
      fireEvent.change(screen.getByTestId('email'), { target: { value: 'john.doe@email.com' } });
      fireEvent.change(screen.getByTestId('password'), { target: { value: 'password' } });
      fireEvent.click(screen.getByRole('button', { name: 'Create Account' }));
    });

    await waitFor(() => expect(auth.createAccount).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(screen.getByText('Error creating account')).toBeInTheDocument());
  });
});

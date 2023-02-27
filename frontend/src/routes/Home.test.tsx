import '@testing-library/jest-dom/extend-expect';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '../lib/auth';
import Home from './Home';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

jest.mock('../lib/auth', () => ({
  ...jest.requireActual('../lib/auth'),
  useAuth: jest.fn(),
}));

describe('Home', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('redirects to sign-in page if user is null', () => {
    const mockNavigate = jest.fn();
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    const mockSignOut = jest.fn();
    (useAuth as jest.Mock).mockReturnValue({ user: null, signOut: mockSignOut });

    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/']}>
          <Home />
        </MemoryRouter>
      </AuthProvider>,
    );

    expect(mockNavigate).toHaveBeenCalledWith('/sign-in');
  });

  it('displays user name and sign out button if user is not null', () => {
    const mockSignOut = jest.fn();
    const mockUser = { id: 1, name: 'John Doe', email: 'john.doe@example.com' };
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser, signOut: mockSignOut });

    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/']}>
          <Home />
        </MemoryRouter>
      </AuthProvider>,
    );

    expect(screen.getByText(`Welcome, ${mockUser.name}!`)).toBeInTheDocument();
    const signOutButton = screen.getByRole('button', { name: 'Sign Out' });
    expect(signOutButton).toBeInTheDocument();
    fireEvent.click(signOutButton);
    expect(mockSignOut).toHaveBeenCalled();
  });
});

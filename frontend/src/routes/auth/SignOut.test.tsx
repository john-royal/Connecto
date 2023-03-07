import '@testing-library/jest-dom/extend-expect';
import { render } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/auth';
import SignOut from './SignOut';

// Mock useNavigate hook
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn().mockReturnValue(jest.fn()),
}));

// Mock useAuth hook
jest.mock('../../lib/auth', () => ({
  useAuth: jest.fn(),
}));

describe('SignOut', () => {
  let signOutMock: jest.Mock;
  let navigateMock: jest.Mock;

  beforeEach(() => {
    // Reset the mocks before each test
    jest.resetAllMocks();

    signOutMock = jest.fn(() => Promise.resolve());
    navigateMock = jest.fn();
    (useAuth as jest.Mock).mockReturnValue({ signOut: signOutMock });
    (useNavigate as jest.Mock).mockReturnValue(navigateMock);
  });

  it('calls the signOut function on mount', async () => {
    await act(async () => {
      render(<SignOut />);
    });
    expect(signOutMock).toHaveBeenCalled();
  });

  it('navigates to /sign-in after sign out', async () => {
    await act(async () => {
      render(<SignOut />);
    });
    expect(navigateMock).toHaveBeenCalledWith('/sign-in');
  });

  it('displays a loading view while signing out', async () => {
    const { getByTestId } = render(<SignOut />);
    expect(getByTestId('loading-view')).toBeInTheDocument();
  });
});

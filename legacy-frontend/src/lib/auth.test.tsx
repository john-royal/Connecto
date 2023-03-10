import '@testing-library/jest-dom/extend-expect';
import { render, renderHook } from '@testing-library/react';
import { PropsWithChildren } from 'react';
import { AuthProvider, TestAuthContext, useAuth } from './auth';

describe('useAuth', () => {
  it('retrieves the auth context', () => {
    const auth = { user: null, signIn: jest.fn(), signOut: jest.fn(), createAccount: jest.fn() };
    const wrapper = ({ children }: PropsWithChildren) => (
      <TestAuthContext.Provider value={auth}>{children}</TestAuthContext.Provider>
    );
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current).toStrictEqual(auth);
  });
});

describe('AuthProvider', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders children', () => {
    const { getByText } = render(
      <AuthProvider>
        <div>Test</div>
      </AuthProvider>,
    );
    expect(getByText('Test')).toBeInTheDocument();
  });

  // TODO: add tests for user session state, sign in, create account, and sign out
});

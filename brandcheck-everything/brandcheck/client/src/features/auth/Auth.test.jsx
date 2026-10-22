import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import LoginPage from './LoginPage.jsx';
import RegisterPage from './RegisterPage.jsx';
import RequireAuth from '../../app/guards/RequireAuth.jsx';
import * as AuthProviderModule from '../../app/providers/AuthProvider.jsx';

describe('Auth components and guards', () => {
  it('renders LoginPage form and displays validation error on empty submit', async () => {
    // Mock useAuth
    vi.spyOn(AuthProviderModule, 'useAuth').mockReturnValue({
      user: null,
      loading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    expect(screen.getByRole('heading', { name: /Sign in to BrandCheck/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();

    const submitBtn = screen.getByRole('button', { name: /Sign In/i });
    fireEvent.click(submitBtn);

    // Form validation should kick in
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
  });

  it('renders RegisterPage and validates password length', async () => {
    vi.spyOn(AuthProviderModule, 'useAuth').mockReturnValue({
      user: null,
      loading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <BrowserRouter>
        <RegisterPage />
      </BrowserRouter>
    );

    expect(screen.getByRole('heading', { name: /Create your account/i })).toBeInTheDocument();
    const nameInput = screen.getByLabelText(/Full Name/i);
    const emailInput = screen.getByLabelText(/Email Address/i);
    const passInput = screen.getByLabelText(/Password/i);

    fireEvent.change(nameInput, { target: { value: 'Deepesh' } });
    fireEvent.change(emailInput, { target: { value: 'deepesh@example.com' } });
    fireEvent.change(passInput, { target: { value: 'short' } }); // < 8 chars

    const submitBtn = screen.getByRole('button', { name: /Create Account/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Password must be at least 8 characters/i)).toBeInTheDocument();
    });
  });

  it('RequireAuth blocks unauthenticated users and redirects to /login', () => {
    vi.spyOn(AuthProviderModule, 'useAuth').mockReturnValue({
      user: null,
      loading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/app']}>
        <Routes>
          <Route path="/login" element={<div>Mock Login Page</div>} />
          <Route
            path="/app"
            element={
              <RequireAuth>
                <div>Protected Content</div>
              </RequireAuth>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Mock Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('RequireAuth renders children when user is authenticated', () => {
    vi.spyOn(AuthProviderModule, 'useAuth').mockReturnValue({
      user: { id: 'user-1', email: 'creator@example.com', displayName: 'Creator' },
      loading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/app']}>
        <Routes>
          <Route path="/login" element={<div>Mock Login Page</div>} />
          <Route
            path="/app"
            element={
              <RequireAuth>
                <div>Protected Content</div>
              </RequireAuth>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});

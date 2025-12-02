import React from 'react';
import { render, screen } from '@testing-library/react';
import Login from '@/app/components/login';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
}));

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('Login Component', () => {
  it('renders the login form', () => {
    render(<Login />);

    // Check if key elements are present
    expect(screen.getByText('Corruption Tracker')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Don't have an account\? Register/i })).toBeInTheDocument();
    expect(screen.getByText(/Forgot password\?/i)).toBeInTheDocument();
  });
});


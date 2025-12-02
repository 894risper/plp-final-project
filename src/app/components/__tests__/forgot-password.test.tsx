import React from 'react';
import { render, screen } from '@testing-library/react';
import ForgotPassword from '@/app/components/forgot-password';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('ForgotPassword Component', () => {
  it('renders the forgot password form', () => {
    render(<ForgotPassword />);

    // Check if key elements are present
    expect(screen.getByText('Forgot Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Send Reset Link/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Remember your password\? Login/i })).toBeInTheDocument();
  });
});
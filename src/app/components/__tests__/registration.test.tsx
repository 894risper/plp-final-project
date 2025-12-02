import React from 'react';
import { render, screen } from '@testing-library/react';
import Register from '@/app/components/registration';

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

// Mock JournalistRegistration component
jest.mock('@/app/components/JournalistRegistration', () => {
  return function DummyJournalistRegistration() {
    return <div data-testid="journalist-registration"></div>;
  };
});

describe('Register Component', () => {
  it('renders the public user registration form', () => {
    render(<Register />);

    // Check if key elements are present
    expect(screen.getByText('Corruption Tracker')).toBeInTheDocument();
    expect(screen.getByLabelText('First Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Last Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Phone')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Register as Public User/i })).toBeInTheDocument();
    expect(screen.getByText(/Are you a journalist\?/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Register as journalist for enhanced access/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Already have an account\? Login/i })).toBeInTheDocument();
  });
});
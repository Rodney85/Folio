import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import ProfileSetupForm from '../ProfileSetupForm';
import { useMutation, useQuery } from 'convex/react';

// Mock the necessary dependencies
vi.mock('convex/react', () => ({
  useMutation: vi.fn(),
  useQuery: vi.fn(),
}));

vi.mock('@clerk/clerk-react', () => ({
  useUser: () => ({
    user: {
      id: 'test-user-id',
      imageUrl: 'https://example.com/image.jpg',
    },
  }),
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

describe('ProfileSetupForm', () => {
  const mockUpdateProfile = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    (useMutation as jest.Mock).mockReturnValue(mockUpdateProfile);
  });

  test('renders the form with correct fields', () => {
    render(<ProfileSetupForm />);
    
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/bio/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/instagram/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/tiktok/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/youtube/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
  });

  test('displays onboarding title when in onboarding mode', () => {
    render(<ProfileSetupForm isOnboarding={true} />);
    expect(screen.getByText(/complete your profile/i)).toBeInTheDocument();
  });

  test('displays edit profile title when not in onboarding mode', () => {
    render(<ProfileSetupForm isOnboarding={false} />);
    expect(screen.getByText(/edit your profile/i)).toBeInTheDocument();
  });

  test('submits form with correct values', async () => {
    render(<ProfileSetupForm />);
    
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/bio/i), { target: { value: 'Test bio' } });
    fireEvent.change(screen.getByLabelText(/instagram/i), { target: { value: 'testinsta' } });
    
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    
    await waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalledWith({
        username: 'testuser',
        bio: 'Test bio',
        instagram: 'testinsta',
        tiktok: '',
        youtube: ''
      });
    });
  });

  test('calls onComplete when provided and form is submitted', async () => {
    const mockOnComplete = vi.fn();
    render(<ProfileSetupForm onComplete={mockOnComplete} />);
    
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    
    await waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalled();
      expect(mockOnComplete).toHaveBeenCalled();
    });
  });
});

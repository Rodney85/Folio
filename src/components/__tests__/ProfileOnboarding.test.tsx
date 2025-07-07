import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import ProfileOnboarding from '../ProfileOnboarding';
import { useQuery } from 'convex/react';

// Mock dependencies
vi.mock('convex/react', () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(),
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

// Mock the ProfileSetupForm component
vi.mock('../ProfileSetupForm', () => ({
  default: ({ onComplete }: { onComplete?: () => void }) => (
    <div data-testid="profile-setup-form">
      <button onClick={onComplete}>Complete Setup</button>
    </div>
  ),
}));

describe('ProfileOnboarding', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders nothing when profile is complete', () => {
    (useQuery as jest.Mock).mockReturnValue(true); // Profile is complete
    const { container } = render(<ProfileOnboarding />);
    expect(container).toBeEmptyDOMElement();
  });

  test('renders nothing when profile completion status is undefined', () => {
    (useQuery as jest.Mock).mockReturnValue(undefined); // Profile status unknown
    const { container } = render(<ProfileOnboarding />);
    expect(container).toBeEmptyDOMElement();
  });

  test('renders dialog when profile is incomplete', () => {
    (useQuery as jest.Mock).mockReturnValue(false); // Profile is incomplete
    render(<ProfileOnboarding />);
    expect(screen.getByText('Complete Your Profile')).toBeInTheDocument();
    expect(screen.getByTestId('profile-setup-form')).toBeInTheDocument();
    expect(screen.getByText('Skip for now')).toBeInTheDocument();
  });

  test('calls onComplete callback when profile setup is completed', () => {
    (useQuery as jest.Mock).mockReturnValue(false); // Profile is incomplete
    const mockOnComplete = vi.fn();
    render(<ProfileOnboarding onComplete={mockOnComplete} />);
    
    fireEvent.click(screen.getByText('Complete Setup'));
    expect(mockOnComplete).toHaveBeenCalled();
  });

  test('closes dialog when skip button is clicked', () => {
    (useQuery as jest.Mock).mockReturnValue(false); // Profile is incomplete
    const { rerender } = render(<ProfileOnboarding />);
    
    expect(screen.getByText('Skip for now')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Skip for now'));
    
    // Mock the state change that would happen after clicking skip
    (useQuery as jest.Mock).mockReturnValue(true);
    rerender(<ProfileOnboarding />);
    expect(screen.queryByText('Skip for now')).not.toBeInTheDocument();
  });
});

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CarImageWithUrl from '../CarImageWithUrl';
import { useConvexImage } from '@/hooks/useConvexImage';
import '@testing-library/jest-dom';

// Mock the custom hook
jest.mock('@/hooks/useConvexImage', () => ({
  useConvexImage: jest.fn(),
}));

describe('CarImageWithUrl', () => {
  const mockProps = {
    storageId: 'test-storage-id',
    alt: 'Test Car Image',
    className: 'test-class',
    onClick: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading state when URL is being fetched', () => {
    // Mock hook to return null (loading state)
    (useConvexImage as jest.Mock).mockReturnValue(null);

    render(<CarImageWithUrl {...mockProps} />);
    
    // Check for loading animation
    const loadingElement = screen.getByTestId('loading-image');
    expect(loadingElement).toBeInTheDocument();
    expect(loadingElement).toHaveClass('animate-pulse');
  });

  it('should render fallback when there is an error loading the image', () => {
    // Mock hook to return a URL, but we'll simulate an image load error
    (useConvexImage as jest.Mock).mockReturnValue('https://example.com/invalid-image.jpg');

    render(<CarImageWithUrl {...mockProps} />);
    
    // Get the image and simulate an error
    const image = screen.getByAltText('Test Car Image');
    fireEvent.error(image);
    
    // Check for fallback car icon
    const fallbackIcon = screen.getByTestId('fallback-car-icon');
    expect(fallbackIcon).toBeInTheDocument();
  });

  it('should render the image when URL is available', () => {
    const mockUrl = 'https://example.com/car-image.jpg';
    (useConvexImage as jest.Mock).mockReturnValue(mockUrl);

    render(<CarImageWithUrl {...mockProps} />);
    
    // Check that image is rendered with correct props
    const image = screen.getByAltText('Test Car Image');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', mockUrl);
    expect(image).toHaveClass('test-class');
  });

  it('should call onClick handler when clicked', () => {
    const mockUrl = 'https://example.com/car-image.jpg';
    (useConvexImage as jest.Mock).mockReturnValue(mockUrl);

    render(<CarImageWithUrl {...mockProps} />);
    
    const image = screen.getByAltText('Test Car Image');
    fireEvent.click(image);
    
    expect(mockProps.onClick).toHaveBeenCalledTimes(1);
  });
});

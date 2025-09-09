import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CustomPlayer from './CustomPlayer';

// Mock HLS.js since it's not available in test environment
jest.mock('hls.js', () => {
  return jest.fn().mockImplementation(() => ({
    loadSource: jest.fn(),
    attachMedia: jest.fn(),
    on: jest.fn(),
    destroy: jest.fn(),
    levels: [],
    currentLevel: -1
  }));
});

// Mock fetch to simulate API failure
global.fetch = jest.fn(() =>
  Promise.reject(new Error('API is down'))
);

describe('CustomPlayer', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test('renders demo mode when API fails', async () => {
    render(<CustomPlayer username="testuser" />);
    
    // Wait for demo mode to appear after API failure
    await waitFor(() => {
      expect(screen.getByText('Custom Video Player Demo')).toBeInTheDocument();
    });
    
    expect(screen.getByText(/This is a demo of the custom video player interface/)).toBeInTheDocument();
  });

  test('shows basic player controls in demo mode', async () => {
    render(<CustomPlayer username="testuser" />);
    
    // Wait for demo mode to load
    await waitFor(() => {
      expect(screen.getByText('Custom Video Player Demo')).toBeInTheDocument();
    });
    
    // Should show basic control buttons
    expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /mute/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /fullscreen/i })).toBeInTheDocument();
  });

  test('play/pause button toggles correctly', async () => {
    render(<CustomPlayer username="testuser" />);
    
    // Wait for demo mode
    await waitFor(() => {
      expect(screen.getByText('Custom Video Player Demo')).toBeInTheDocument();
    });
    
    const playButton = screen.getByRole('button', { name: /play/i });
    expect(playButton).toBeInTheDocument();
    
    // Click to pause
    fireEvent.click(playButton);
    expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();
  });
});
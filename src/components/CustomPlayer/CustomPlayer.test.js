import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CustomPlayer from './CustomPlayer';
import { AuthProvider } from '../../contexts/AuthContext';

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

// Mock hiveAuth service
jest.mock('../../services/hiveAuth', () => {
  return {
    __esModule: true,
    default: {
      initializeAuth: jest.fn(() => Promise.resolve({ success: false })),
      getAuthHeaders: jest.fn(() => ({})),
      stopTokenVerification: jest.fn(),
      startTokenVerification: jest.fn(),
      isAuthenticated: false,
      currentUser: null,
      authToken: null
    }
  };
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
    render(
      <AuthProvider>
        <CustomPlayer username="testuser" />
      </AuthProvider>
    );
    
    // Wait for demo mode to appear after API failure
    await waitFor(() => {
      expect(screen.getByText('Custom Video Player Demo')).toBeInTheDocument();
    });
    
    expect(screen.getByText(/This is a demo of the custom video player interface/)).toBeInTheDocument();
  });

  test('shows basic player controls in demo mode', async () => {
    render(
      <AuthProvider>
        <CustomPlayer username="testuser" />
      </AuthProvider>
    );
    
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
    render(
      <AuthProvider>
        <CustomPlayer username="testuser" />
      </AuthProvider>
    );
    
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

  test('handles authentication errors (401) correctly', async () => {
    // Mock fetch to return 401
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ error: 'Unauthorized' })
      })
    );

    render(
      <AuthProvider>
        <CustomPlayer username="testuser" />
      </AuthProvider>
    );
    
    // Wait for error message to appear
    await waitFor(() => {
      expect(screen.getByText(/Authentication required/i)).toBeInTheDocument();
    });
  });

  test('includes auth headers when fetching stream URL', async () => {
    const mockAuthHeaders = { Authorization: 'Bearer test-token' };
    const hiveAuthService = require('../../services/hiveAuth').default;
    hiveAuthService.getAuthHeaders.mockReturnValue(mockAuthHeaders);
    
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ streamId: 'test123' })
      })
    );

    render(
      <AuthProvider>
        <CustomPlayer username="testuser" />
      </AuthProvider>
    );
    
    // Wait for fetch to be called
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: mockAuthHeaders
        })
      );
    });
  });
});
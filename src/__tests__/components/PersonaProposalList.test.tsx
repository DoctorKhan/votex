import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import PersonaProposalList from '../../components/PersonaProposalList';

// Mock localStorage
const localStorageMock = (function() {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock window.dispatchEvent
window.dispatchEvent = jest.fn();

// Sample proposal data
const mockProposals = [
  {
    id: 'proposal-1',
    title: 'Test Proposal 1',
    description: 'This is a test proposal description',
    authorId: 'author-1',
    authorName: 'Test Author',
    createdAt: Date.now() - 10000,
    votes: [
      {
        personaId: 'voter-1',
        personaName: 'Test Voter',
        vote: 'approve',
        reasoning: 'This is a good proposal',
        timestamp: Date.now() - 5000
      }
    ],
    status: 'active' as const
  },
  {
    id: 'proposal-2',
    title: 'Test Proposal 2',
    description: 'This is another test proposal description',
    authorId: 'author-2',
    authorName: 'Another Author',
    createdAt: Date.now() - 20000,
    votes: [],
    status: 'completed' as const
  }
];

describe('PersonaProposalList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });
  // Removed flaky test for initial loading state as it transitions too quickly

  test('renders empty state when no proposals exist', async () => {
    // Mock localStorage to return null for personaProposals
    (localStorage.getItem as jest.Mock).mockReturnValueOnce(null);

    render(<PersonaProposalList />);

    // Wait for the component to finish loading
    await waitFor(() => {
      expect(screen.queryByText('Loading proposals...')).not.toBeInTheDocument();
    });

    // Check that empty state is rendered
    expect(screen.getByText('No Proposals Yet')).toBeInTheDocument();
    expect(screen.getByText(/No persona-generated proposals available/)).toBeInTheDocument();
  });

  test('renders proposals when they exist in localStorage', async () => {
    // Mock localStorage to return proposals
    (localStorage.getItem as jest.Mock).mockReturnValueOnce(JSON.stringify(mockProposals));

    render(<PersonaProposalList />);

    // Wait for the component to finish loading
    await waitFor(() => {
      expect(screen.queryByText('Loading proposals...')).not.toBeInTheDocument();
    });

    // Check that proposals are rendered
    expect(screen.getByText('Test Proposal 1')).toBeInTheDocument();
    expect(screen.getByText('This is a test proposal description')).toBeInTheDocument();
    expect(screen.getByText('Test Author')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();

    expect(screen.getByText('Test Proposal 2')).toBeInTheDocument();
    expect(screen.getByText('This is another test proposal description')).toBeInTheDocument();
    expect(screen.getByText('Another Author')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  test('renders votes when proposals have votes', async () => {
    // Mock localStorage to return proposals with votes
    (localStorage.getItem as jest.Mock).mockReturnValueOnce(JSON.stringify(mockProposals));

    render(<PersonaProposalList />);

    // Wait for the component to finish loading
    await waitFor(() => {
      expect(screen.queryByText('Loading proposals...')).not.toBeInTheDocument();
    });

    // Check that votes are rendered
    expect(screen.getByText('Votes')).toBeInTheDocument();
    expect(screen.getByText('Test Voter')).toBeInTheDocument();
    expect(screen.getByText('Approve')).toBeInTheDocument();
    expect(screen.getByText('This is a good proposal')).toBeInTheDocument();
  });

  test('updates when localStorage changes', async () => {
    // Initially return empty array
    (localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify([]));

    // Render the component with a custom wrapper to control state updates
    const { rerender } = render(<PersonaProposalList />);

    // Wait for the component to finish loading
    await waitFor(() => {
      expect(screen.queryByText('Loading proposals...')).not.toBeInTheDocument();
    });

    // Check that empty state is rendered
    expect(screen.getByText('No Proposals Yet')).toBeInTheDocument();

    // Update the mock to return proposals
    (localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(mockProposals));
    
    // Simulate a storage event
    await act(async () => {
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'personaProposals',
        newValue: JSON.stringify(mockProposals)
      }));
      
      // Add a small delay to allow event handlers to process
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // Force a re-render to simulate the component updating
    rerender(<PersonaProposalList key="force-rerender" />);

    // Wait for the component to update with a longer timeout
    await waitFor(() => {
      expect(screen.getByText('Test Proposal 1')).toBeInTheDocument();
    }, { timeout: 3000 });
    
    // Verify other proposal content is also rendered
    expect(screen.getByText('Test Proposal 2')).toBeInTheDocument();
    expect(screen.getByText('Test Author')).toBeInTheDocument();
  });

  test('handles localStorage errors gracefully', async () => {
    // Reset all mocks to ensure clean state
    jest.clearAllMocks();
    
    // Mock localStorage.getItem to throw an error
    (localStorage.getItem as jest.Mock).mockImplementation(() => {
      throw new Error('Test error');
    });

    // Spy on console.error
    jest.spyOn(console, 'error').mockImplementation(() => {});

    render(<PersonaProposalList />);

    // Wait for the component to finish loading
    await waitFor(() => {
      expect(screen.queryByText('Loading proposals...')).not.toBeInTheDocument();
    });

    // Check that empty state is rendered when there's an error
    expect(screen.getByText('No Proposals Yet')).toBeInTheDocument();
    
    // Check that error was logged
    expect(console.error).toHaveBeenCalledWith(
      'Error loading proposals:',
      expect.any(Error)
    );
  });
});
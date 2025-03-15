import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import PersonaController from '../../components/PersonaController';
import * as personaImplementation from '../../../personas/persona-implementation';

// Enable fake timers for this test file
jest.useFakeTimers();

// Mock the dynamic import
jest.mock('../../../personas/persona-implementation', () => ({
  getAllPersonas: jest.fn(),
  schedulePersonaActivity: jest.fn(),
  generateProposal: jest.fn(),
  simulateVote: jest.fn(),
  generateForumComment: jest.fn(),
}));

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

const mockPersonas = [
  { id: 'alex-chen', name: 'Dr. Alex Chen', displayName: 'AlexC' },
  { id: 'sophia-rodriguez', name: 'Sophia Rodriguez', displayName: 'Sophia_R' },
  { id: 'thomas-williams', name: 'Thomas Williams', displayName: 'ThomasW' }
];

// Mock window.dispatchEvent
window.dispatchEvent = jest.fn();

describe('PersonaController', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    localStorageMock.clear();
    
    // Setup default mock implementations
    (personaImplementation.getAllPersonas as jest.Mock).mockReturnValue(mockPersonas);
    (personaImplementation.schedulePersonaActivity as jest.Mock).mockImplementation(() => {});
    (personaImplementation.generateProposal as jest.Mock).mockResolvedValue({
      title: 'Test Proposal',
      content: 'Test content',
      category: 'test',
      tags: ['test']
    });
    (personaImplementation.simulateVote as jest.Mock).mockResolvedValue({
      vote: 'approve',
      reasoning: 'Test reasoning'
    });
    (personaImplementation.generateForumComment as jest.Mock).mockResolvedValue({
      content: 'Test comment'
    });
  });
  
  test('renders the persona manager', async () => {
    // Render the component
    render(<PersonaController />);
    
    // Wait for the component to finish loading and the dynamic import to complete
    await act(async () => {
      // Advance timers to allow useEffect hooks to complete
      jest.advanceTimersByTime(100);
      await Promise.resolve(); // Flush promises
    });
    
    // Wait for the component to finish loading
    await waitFor(() => {
      expect(screen.getByText('Persona Manager')).toBeInTheDocument();
    });
    
    // Check that all personas are rendered
    await waitFor(() => {
      expect(screen.getByText('Dr. Alex Chen')).toBeInTheDocument();
      expect(screen.getByText('Sophia Rodriguez')).toBeInTheDocument();
      expect(screen.getByText('Thomas Williams')).toBeInTheDocument();
    });
    
    // Check for activate buttons
    const activateButtons = screen.getAllByText('Activate');
    expect(activateButtons.length).toBe(3);
  });
  
  test('activates a persona when button is clicked', async () => {
    render(<PersonaController />);
    
    // Wait for the component to finish loading and the dynamic import to complete
    await act(async () => {
      jest.advanceTimersByTime(100);
      await Promise.resolve();
    });
    
    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('Dr. Alex Chen')).toBeInTheDocument();
    });
    
    // Click the activate button for the first persona
    const activateButtons = screen.getAllByText('Activate');
    await act(async () => {
      fireEvent.click(activateButtons[0]);
    });
    
    // Check that schedulePersonaActivity was called
    expect(personaImplementation.schedulePersonaActivity).toHaveBeenCalledWith(
      ['alex-chen'],
      'medium'
    );
    
    // Check that status changes to active
    await waitFor(() => {
      expect(screen.getByText('Active')).toBeInTheDocument();
    });
  });
  
  test('generates a proposal when button is clicked', async () => {
    render(<PersonaController />);
    
    // Wait for the component to finish loading and the dynamic import to complete
    await act(async () => {
      jest.advanceTimersByTime(100);
      await Promise.resolve();
    });
    
    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('Dr. Alex Chen')).toBeInTheDocument();
    });
    
    // Click the proposal button for the first persona
    const proposalButtons = screen.getAllByText('Proposal');
    await act(async () => {
      fireEvent.click(proposalButtons[0]);
      // Allow the async operation to complete
      await Promise.resolve();
    });
    
    // Check that generateProposal was called with the correct ID
    expect(personaImplementation.generateProposal).toHaveBeenCalledWith(
      'alex-chen',
      expect.any(Object)
    );
    
    // Check that status update is shown - the component shows a status message
    // but we can't predict the exact text since it depends on the mock implementation
    // So we'll just check that the status message is shown
    await waitFor(() => {
      // Look for any status message that might be shown
      expect(screen.getByText(/Test Proposal/)).toBeInTheDocument();
    }, { timeout: 3000 });
  });
  
  test('handles errors gracefully', async () => {
    // Make getAllPersonas throw an error
    (personaImplementation.getAllPersonas as jest.Mock).mockImplementation(() => {
      throw new Error('Test error');
    });
    
    render(<PersonaController />);
    
    // Wait for the component to finish loading and the dynamic import to complete
    await act(async () => {
      jest.advanceTimersByTime(100);
      await Promise.resolve();
    });
    
    // Check that error message is shown
    await waitFor(() => {
      expect(screen.getByText('Could not load personas. Please refresh the page.')).toBeInTheDocument();
    });
  });
  
  test('activates all personas when button is clicked', async () => {
    render(<PersonaController />);
    
    // Wait for the component to finish loading and the dynamic import to complete
    await act(async () => {
      jest.advanceTimersByTime(100);
      await Promise.resolve();
    });
    
    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('Activate All Personas')).toBeInTheDocument();
    });
    
    // Click the activate all button
    await act(async () => {
      fireEvent.click(screen.getByText('Activate All Personas'));
    });
    
    // Check that schedulePersonaActivity was called with all IDs
    expect(personaImplementation.schedulePersonaActivity).toHaveBeenCalledWith(
      ['alex-chen', 'sophia-rodriguez', 'thomas-williams'],
      'medium'
    );
    
    // Check that all personas are now active
    await waitFor(() => {
      const activeStatuses = screen.getAllByText('Active');
      expect(activeStatuses.length).toBe(3);
    });
  });
});
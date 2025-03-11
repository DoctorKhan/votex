import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PersonaController from '../../components/PersonaController';
import * as personaImplementation from '../../../personas/persona-implementation';

// Mock the persona implementation module
jest.mock('../../../personas/persona-implementation', () => ({
  getAllPersonas: jest.fn(),
  schedulePersonaActivity: jest.fn(),
  generateProposal: jest.fn(),
  simulateVote: jest.fn(),
  generateForumComment: jest.fn(),
}));

const mockPersonas = [
  { id: 'alex-chen', name: 'Dr. Alex Chen', displayName: 'AlexC' },
  { id: 'sophia-rodriguez', name: 'Sophia Rodriguez', displayName: 'Sophia_R' },
  { id: 'thomas-williams', name: 'Thomas Williams', displayName: 'ThomasW' }
];

describe('PersonaController', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
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
    render(<PersonaController />);
    
    // Wait for the component to finish loading
    await waitFor(() => {
      expect(screen.getByText('Persona Manager')).toBeInTheDocument();
    });
    
    // Check that all personas are rendered
    expect(screen.getByText('Dr. Alex Chen')).toBeInTheDocument();
    expect(screen.getByText('Sophia Rodriguez')).toBeInTheDocument();
    expect(screen.getByText('Thomas Williams')).toBeInTheDocument();
    
    // Check for activate buttons
    const activateButtons = screen.getAllByText('Activate');
    expect(activateButtons.length).toBe(3);
  });
  
  test('activates a persona when button is clicked', async () => {
    render(<PersonaController />);
    
    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('Dr. Alex Chen')).toBeInTheDocument();
    });
    
    // Click the activate button for the first persona
    const activateButtons = screen.getAllByText('Activate');
    fireEvent.click(activateButtons[0]);
    
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
    
    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('Dr. Alex Chen')).toBeInTheDocument();
    });
    
    // Click the proposal button for the first persona
    const proposalButtons = screen.getAllByText('Proposal');
    fireEvent.click(proposalButtons[0]);
    
    // Check that generateProposal was called with the correct ID
    expect(personaImplementation.generateProposal).toHaveBeenCalledWith(
      'alex-chen',
      expect.any(Object)
    );
    
    // Check that status update is shown
    await waitFor(() => {
      expect(screen.getByText(/created a proposal/i)).toBeInTheDocument();
    });
  });
  
  test('handles errors gracefully', async () => {
    // Make getAllPersonas throw an error
    (personaImplementation.getAllPersonas as jest.Mock).mockImplementation(() => {
      throw new Error('Test error');
    });
    
    render(<PersonaController />);
    
    // Check that error message is shown
    await waitFor(() => {
      expect(screen.getByText('Could not load personas. Please refresh the page.')).toBeInTheDocument();
    });
  });
  
  test('activates all personas when button is clicked', async () => {
    render(<PersonaController />);
    
    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('Activate All Personas')).toBeInTheDocument();
    });
    
    // Click the activate all button
    fireEvent.click(screen.getByText('Activate All Personas'));
    
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
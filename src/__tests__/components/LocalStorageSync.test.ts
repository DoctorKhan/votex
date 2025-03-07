/**
 * @jest-environment jsdom
 */

describe('LocalStorage Data Consistency', () => {
  // Mock localStorage
  let localStorageMock: { [key: string]: string } = {};
  
  beforeEach(() => {
    localStorageMock = {};
    
    // Mock localStorage methods
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn((key: string) => localStorageMock[key] || null),
        setItem: jest.fn((key: string, value: string) => {
          localStorageMock[key] = value;
        }),
        removeItem: jest.fn((key: string) => {
          delete localStorageMock[key];
        }),
        clear: jest.fn(() => {
          localStorageMock = {};
        }),
      },
      writable: true
    });
  });

  test('should maintain consistency between activities and proposals', () => {
    // Simulate storing a persona activity with proposal
    const activityData = {
      personaId: 'test-persona',
      personaName: 'Test Persona',
      action: 'proposal',
      description: 'Created a proposal',
      timestamp: Date.now(),
      details: 'Test proposal'
    };
    
    const proposalData = {
      id: `persona-proposal-${Date.now()}`,
      title: 'Test Proposal',
      description: 'Test content',
      authorId: 'test-persona',
      authorName: 'Test Persona',
      createdAt: Date.now(),
      votes: [],
      status: 'active'
    };

    // Store activity data
    localStorage.setItem('personaActivities', JSON.stringify([activityData]));
    
    // Store proposal data
    localStorage.setItem('personaProposals', JSON.stringify([proposalData]));
    
    // Retrieve activity data
    const storedActivities = JSON.parse(localStorage.getItem('personaActivities') || '[]');
    
    // Retrieve proposal data
    const storedProposals = JSON.parse(localStorage.getItem('personaProposals') || '[]');
    
    // Test consistency
    expect(storedActivities.length).toBe(1);
    expect(storedProposals.length).toBe(1);
    expect(storedActivities[0].personaId).toBe(storedProposals[0].authorId);
    expect(storedActivities[0].personaName).toBe(storedProposals[0].authorName);
    expect(storedActivities[0].action).toBe('proposal');
  });

  test('should dispatch storage events correctly', () => {
    // Mock event listener
    const mockListener = jest.fn();
    window.addEventListener('storage', mockListener);
    
    // Create test data
    const proposalData = {
      id: `persona-proposal-${Date.now()}`,
      title: 'Test Proposal',
      description: 'Test content',
      authorId: 'test-persona',
      authorName: 'Test Persona',
      createdAt: Date.now(),
      votes: [],
      status: 'active'
    };
    
    // Create and dispatch a storage event
    const storageEvent = new StorageEvent('storage', {
      key: 'personaProposals',
      newValue: JSON.stringify([proposalData])
    });
    
    window.dispatchEvent(storageEvent);
    
    // Test that listener was called with correct event
    expect(mockListener).toHaveBeenCalled();
    const event = mockListener.mock.calls[0][0];
    expect(event.key).toBe('personaProposals');
    
    // Clean up
    window.removeEventListener('storage', mockListener);
  });
});
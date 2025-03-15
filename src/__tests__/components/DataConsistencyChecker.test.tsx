import { render } from '@testing-library/react';
import DataConsistencyChecker from '../../components/DataConsistencyChecker';
import * as personaDataUtils from '../../utils/personaDataUtils';

// Mock the personaDataUtils module
jest.mock('../../utils/personaDataUtils', () => ({
  generateSamplePersonaData: jest.fn(),
  checkDataConsistency: jest.fn().mockReturnValue({ consistent: true, issues: [] })
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

describe('DataConsistencyChecker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    
    // Reset console mocks
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  test('renders nothing visible', () => {
    const { container } = render(<DataConsistencyChecker />);
    expect(container.firstChild).toBeNull();
  });

  test('checks data consistency on mount', () => {
    render(<DataConsistencyChecker />);
    expect(personaDataUtils.checkDataConsistency).toHaveBeenCalledTimes(1);
  });

  test('does not generate sample data by default', () => {
    render(<DataConsistencyChecker />);
    expect(personaDataUtils.generateSamplePersonaData).not.toHaveBeenCalled();
  });

  test('generates sample data when generateSampleData prop is true', () => {
    render(<DataConsistencyChecker generateSampleData={true} />);
    expect(personaDataUtils.generateSamplePersonaData).toHaveBeenCalledTimes(1);
  });

  test('generates sample data when no proposals but activities exist', () => {
    // Mock localStorage to have activities but no proposals
    (localStorage.getItem as jest.Mock)
      .mockReturnValueOnce(null) // personaProposals
      .mockReturnValueOnce('[]'); // personaActivities
    
    render(<DataConsistencyChecker />);
    expect(personaDataUtils.generateSamplePersonaData).toHaveBeenCalledTimes(1);
  });

  test('logs warnings when inconsistencies are found', () => {
    // Mock checkDataConsistency to return inconsistencies
    (personaDataUtils.checkDataConsistency as jest.Mock).mockReturnValueOnce({
      consistent: false,
      issues: ['Test issue 1', 'Test issue 2']
    });

    render(<DataConsistencyChecker />);
    expect(console.warn).toHaveBeenCalledWith(
      'Found data inconsistencies:',
      ['Test issue 1', 'Test issue 2']
    );
  });

  test('logs debug information when debug prop is true', () => {
    // Mock checkDataConsistency to return consistent data
    (personaDataUtils.checkDataConsistency as jest.Mock).mockReturnValueOnce({
      consistent: true,
      issues: []
    });

    render(<DataConsistencyChecker debug={true} />);
    expect(console.log).toHaveBeenCalledWith('Data consistency check passed');
  });

  test('handles errors gracefully', () => {
    // Mock checkDataConsistency to throw an error
    (personaDataUtils.checkDataConsistency as jest.Mock).mockImplementationOnce(() => {
      throw new Error('Test error');
    });

    render(<DataConsistencyChecker />);
    expect(console.error).toHaveBeenCalledWith(
      'Error in data consistency check:',
      expect.any(Error)
    );
  });
});
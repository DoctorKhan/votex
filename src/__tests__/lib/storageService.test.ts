import { saveToLocalStorage, loadFromLocalStorage, removeFromLocalStorage } from '../../lib/storageService';

describe('Storage Service', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('saveToLocalStorage', () => {
    test('should save data to localStorage', () => {
      // Arrange
      const key = 'testKey';
      const data = { id: 1, name: 'Test' };
      
      // Act
      saveToLocalStorage(key, data);
      
      // Assert
      expect(localStorage.setItem).toHaveBeenCalledWith(key, JSON.stringify(data));
    });

    test('should handle errors when saving to localStorage', () => {
      // Arrange
      const key = 'testKey';
      const data = { id: 1, name: 'Test' };
      const mockError = new Error('localStorage error');
      
      // Mock localStorage.setItem to throw an error
      (localStorage.setItem as jest.Mock).mockImplementation(() => {
        throw mockError;
      });
      
      // Spy on console.error
      const consoleSpy = jest.spyOn(console, 'error');
      
      // Act
      saveToLocalStorage(key, data);
      
      // Assert
      expect(consoleSpy).toHaveBeenCalledWith(
        `Error saving to localStorage (key: ${key}):`, 
        mockError
      );
    });
  });

  describe('loadFromLocalStorage', () => {
    test('should load data from localStorage', () => {
      // Arrange
      const key = 'testKey';
      const data = { id: 1, name: 'Test' };
      (localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(data));
      
      // Act
      const result = loadFromLocalStorage(key);
      
      // Assert
      expect(localStorage.getItem).toHaveBeenCalledWith(key);
      expect(result).toEqual(data);
    });

    test('should return null if data is not found', () => {
      // Arrange
      const key = 'nonExistentKey';
      (localStorage.getItem as jest.Mock).mockReturnValue(null);
      
      // Act
      const result = loadFromLocalStorage(key);
      
      // Assert
      expect(localStorage.getItem).toHaveBeenCalledWith(key);
      expect(result).toBeNull();
    });

    test('should handle JSON parsing errors', () => {
      // Arrange
      const key = 'invalidJsonKey';
      (localStorage.getItem as jest.Mock).mockReturnValue('invalid json');
      
      // Spy on console.error
      const consoleSpy = jest.spyOn(console, 'error');
      
      // Act
      const result = loadFromLocalStorage(key);
      
      // Assert
      expect(localStorage.getItem).toHaveBeenCalledWith(key);
      expect(consoleSpy).toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('removeFromLocalStorage', () => {
    test('should remove data from localStorage', () => {
      // Arrange
      const key = 'testKey';
      
      // Act
      removeFromLocalStorage(key);
      
      // Assert
      expect(localStorage.removeItem).toHaveBeenCalledWith(key);
    });

    test('should handle errors when removing from localStorage', () => {
      // Arrange
      const key = 'testKey';
      const mockError = new Error('localStorage error');
      
      // Mock localStorage.removeItem to throw an error
      (localStorage.removeItem as jest.Mock).mockImplementation(() => {
        throw mockError;
      });
      
      // Spy on console.error
      const consoleSpy = jest.spyOn(console, 'error');
      
      // Act
      removeFromLocalStorage(key);
      
      // Assert
      expect(consoleSpy).toHaveBeenCalledWith(
        `Error removing from localStorage (key: ${key}):`, 
        mockError
      );
    });
  });
});
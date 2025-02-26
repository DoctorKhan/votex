/**
 * Saves data to localStorage
 * @param key The key to store the data under
 * @param data The data to store
 */
export function saveToLocalStorage<T>(key: string, data: T): void {
  try {
    const serializedData = JSON.stringify(data);
    localStorage.setItem(key, serializedData);
  } catch (error) {
    console.error(`Error saving to localStorage (key: ${key}):`, error);
  }
}

/**
 * Loads data from localStorage
 * @param key The key to retrieve data from
 * @returns The stored data or null if not found
 */
export function loadFromLocalStorage<T>(key: string): T | null {
  try {
    const serializedData = localStorage.getItem(key);
    if (serializedData === null) {
      return null;
    }
    return JSON.parse(serializedData) as T;
  } catch (error) {
    console.error(`Error loading from localStorage (key: ${key}):`, error);
    return null;
  }
}

/**
 * Removes data from localStorage
 * @param key The key to remove
 */
export function removeFromLocalStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing from localStorage (key: ${key}):`, error);
  }
}
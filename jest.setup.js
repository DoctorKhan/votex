// Import jest-dom for custom matchers like toBeInTheDocument
import '@testing-library/jest-dom';

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
  writable: true,
});

// Mock IndexedDB
const IDBObjectStoreMock = {
  put: jest.fn().mockImplementation(() => ({
    onsuccess: null,
    onerror: null,
  })),
  get: jest.fn().mockImplementation(() => ({
    onsuccess: null,
    onerror: null,
  })),
  getAll: jest.fn().mockImplementation(() => ({
    onsuccess: null,
    onerror: null,
  })),
  delete: jest.fn().mockImplementation(() => ({
    onsuccess: null,
    onerror: null,
  })),
  clear: jest.fn().mockImplementation(() => ({
    onsuccess: null,
    onerror: null,
  })),
  index: jest.fn().mockReturnValue({
    getAll: jest.fn().mockImplementation(() => ({
      onsuccess: null,
      onerror: null,
    })),
  }),
  createIndex: jest.fn(),
};

const IDBTransactionMock = {
  objectStore: jest.fn().mockReturnValue(IDBObjectStoreMock),
};

const IDBDatabaseMock = {
  transaction: jest.fn().mockReturnValue(IDBTransactionMock),
  createObjectStore: jest.fn().mockReturnValue(IDBObjectStoreMock),
  objectStoreNames: {
    contains: jest.fn().mockReturnValue(false),
  },
};

const IDBOpenDBRequestMock = {
  result: IDBDatabaseMock,
  error: null,
  onupgradeneeded: null,
  onsuccess: null,
  onerror: null,
};

const indexedDBMock = {
  open: jest.fn().mockReturnValue(IDBOpenDBRequestMock),
  deleteDatabase: jest.fn(),
};

// Mock the global indexedDB object
global.indexedDB = indexedDBMock;

// Mock the db.ts module
jest.mock('./src/lib/db', () => ({
  initDB: jest.fn().mockResolvedValue(undefined),
  generateId: jest.fn().mockReturnValue('mock-id'),
  addOrUpdateItem: jest.fn().mockResolvedValue('mock-id'),
  getItem: jest.fn().mockResolvedValue(null),
  getAllItems: jest.fn().mockResolvedValue([]),
  deleteItem: jest.fn().mockResolvedValue(undefined),
  clearStore: jest.fn().mockResolvedValue(undefined),
  getItemsByIndex: jest.fn().mockResolvedValue([]),
  getUserId: jest.fn().mockReturnValue('mock-user-id'),
  useQuery: jest.fn(),
  transact: jest.fn(),
  tx: {
    logs: {
      'mock-log-id': {
        update: jest.fn()
      }
    }
  }
}));
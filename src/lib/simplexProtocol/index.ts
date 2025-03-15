/**
 * SimpleX Protocol Module
 * Entry point for the SimpleX protocol implementation
 */

// Export types
export * from './types';

// Export cryptographic utilities
export * from './crypto';

// Export queue management
export * from './queue';

// Export the adapter
export * from './adapter';

// Default export is the adapter for convenience
import { SimpleXAdapter, getDefaultServerUrl } from './adapter';
export default SimpleXAdapter;

/**
 * Create a new SimpleX adapter with default settings
 * @returns A new SimpleX adapter configured with default settings
 */
export function createDefaultAdapter(): SimpleXAdapter {
  return new SimpleXAdapter(getDefaultServerUrl());
}
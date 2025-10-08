/**
 * Jest Test Setup
 *
 * This file runs before all tests to set up the testing environment.
 */

// Mock environment variables for testing
process.env.NODE_ENV = 'test';

// Suppress console output during tests (optional)
global.console = {
  ...console,
  // Uncomment to suppress logs during tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Set test timeout
jest.setTimeout(10000);

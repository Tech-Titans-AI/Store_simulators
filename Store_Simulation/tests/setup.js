// Test setup file for Jest
console.log('Setting up test environment...');

// Suppress console.log during tests unless VERBOSE is set
if (!process.env.VERBOSE) {
  global.console = {
    ...console,
    log: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: console.error, // Keep error logs
  };
}

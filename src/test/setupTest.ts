import '@testing-library/jest-dom';
// Ensure `alert` is implemented in the jsdom test environment to avoid noisy stderr messages
// Provide a noop implementation so tests can spy on it when needed.
(globalThis as any).alert = (message?: any) => {};
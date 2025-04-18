// jest-dom adds custom jest matchers for asserting on DOM nodes.
import '@testing-library/jest-dom';

// Mock para Recharts
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Keep tests isolated: unmount React trees and reset jsdom between cases.
afterEach(() => {
  cleanup();
});

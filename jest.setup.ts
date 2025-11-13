require('dotenv').config({ path: './.env.test' });
import '@testing-library/jest-dom';

jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({
    get: jest.fn(),
    set: jest.fn(),
    getAll: jest.fn(() => []),
  })),
}));

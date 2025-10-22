/** Jest config for the frontend tests used during local runs */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  moduleNameMapper: {
    '^components/(.*)$': '<rootDir>/src/components/$1',
    '^generated/(.*)$': '<rootDir>/src/generated/$1',
  },
  testMatch: ['**/?(*.)+(spec|test).[tj]s?(x)'],
  testPathIgnorePatterns: ['/node_modules/', '/apps/backend/'],
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
};

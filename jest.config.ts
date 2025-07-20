import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/anchor/tests'],
  testMatch: ['**/*.spec.ts', '**/*.test.ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  collectCoverageFrom: [
    'anchor/programs/**/*.rs',
    '!anchor/programs/**/target/**',
  ],
  setupFilesAfterEnv: [],
  testTimeout: 60000,
};

export default config; 
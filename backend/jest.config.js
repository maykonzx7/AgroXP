export default {
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  transform: {},
  moduleFileExtensions: ['js', 'json'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
    '!src/server-prisma.ts',
    '!src/**/*.config.js',
    '!src/**/associations.js'
  ],
  coverageDirectory: 'coverage',
  verbose: true
};
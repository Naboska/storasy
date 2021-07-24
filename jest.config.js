module.exports = {
  roots: ['<rootDir>/src'],
  moduleDirectories: ['node_modules', '<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/*.test.ts'],
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
};

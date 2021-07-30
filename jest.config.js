module.exports = {
  collectCoverageFrom: ['**/src/**/*.{ts,tsx}', '!**/src/**/index.{ts,tsx}', '!**/src/**/types.{ts,tsx}'],
  coverageDirectory: '<rootDir>/test-reports',
  coveragePathIgnorePatterns: ['/node_modules/'],
  moduleDirectories: ['node_modules', 'src'],
  modulePaths: ['src'],
  preset: 'ts-jest',
  coverageReporters: ['cobertura', 'html', 'json', 'text'],
};

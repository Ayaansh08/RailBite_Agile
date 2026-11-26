module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',           // entrypoint: not testable in unit suite
  ],
  coverageDirectory: 'coverage',
  clearMocks: true,
};

const { createJestRunner } = require('create-jest-runner');

const runner = createJestRunner(require.resolve('./lambda-runner'), {
  getExtraOptions: () => ({}),
});

module.exports = runner;
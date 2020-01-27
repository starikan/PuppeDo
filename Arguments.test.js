const { Arguments } = require('./Arguments');

test('Arguments init Errors', () => {
  expect(() => new Arguments()).toThrowError({ message: 'There is no tests to run. Pass any test in PPD_TESTS argument' });
  expect(() => new Arguments({})).toThrowError({ message: 'There is no tests to run. Pass any test in PPD_TESTS argument' });
});

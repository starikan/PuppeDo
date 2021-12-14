const testsE2E = {
  main: require('./runners/main'),
  // mainENV: require('./runners/mainENV'),
  dataCheck: require('./runners/dataCheck'),
  screencast: require('./runners/screencast'),
};

module.exports = testsE2E
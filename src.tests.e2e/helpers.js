const ppd = require('../index');

const logClean = (text) => {
  let newText = text;
  newText =  newText.replace(/🕝: \d+\.\d+ s./g, '')
  newText =  newText.replace(/start on '[\d\-_\.]+?'/g, '')
  newText =  newText.replace(/screenshot: \[.+?\]/g, 'screenshot: []')
  return newText;
}

const runTest = async (runner) => {
  if (!runner) {
    return [];
  }
  await runner.runBeforeTest();
  await ppd.run(runner.params);
  await runner.runAfterTest();
};

module.exports = { runTest, logClean };


const logClean = (text) => {
  let newText = text;
  newText = newText.replace(/🕝: \d+\.\d+ s./g, '');
  newText = newText.replace(/start on '[\d\-_\.]+?'/g, '');
  newText = newText.replace(/screenshot: \[.+?\]/g, 'screenshot: []');
  return newText;
};

module.exports = { logClean };

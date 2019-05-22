const crypto = require('crypto');

const _ = require('lodash');
const { yaml2json } = require('./yaml2json');

let fullDescription = '';

const getFullDepthJSON = function({ envs, filePath, testBody, testsFolder, levelIndent = 0, textView = false }) {
  if (filePath && !_.isString(filePath)) {
    throw { message: `yaml2json: Incorrect FILE NAME YAML/JSON/JS - ${filePath}` };
  }

  if (testBody && !_.isObject(testBody)) {
    throw { message: `yaml2json: Incorrect TEST BODY YAML/JSON/JS - ${testBody}` };
  }

  if (!testsFolder && envs) {
    testsFolder = envs.get('args.testsFolder');
  }

  let full = filePath ? yaml2json(filePath, testsFolder).json : {};
  if (!full) {
    throw { message: `Невозможно запустить в папке ${testsFolder} пустой тест ${filePath}` };
  }
  if (!['atom', 'test'].includes(_.get(full, 'type'))) {
    throw { message: `Файл ${filePath} в папке ${testsFolder} не является тестом` };
  }

  full = testBody ? Object.assign(full, testBody) : full;
  full.breadcrumbs = _.get(full, 'breadcrumbs', [filePath]);
  full.levelIndent = levelIndent;
  const runnerBlockNames = ['beforeTest', 'runTest', 'afterTest', 'errorTest'];

  // Generate text view for test
  if (textView) {
    fullDescription = '';
  }
  let description = _.get(full, 'description');
  let name = _.get(full, 'name');
  let todo = _.get(full, 'todo');
  let fullString = '';
  fullString += '    '.repeat(levelIndent);
  fullString += todo ? 'TODO: ' + todo + '== ' : '';
  fullString += description ? `${description} ` : '';
  fullString += name ? `(${name})` : '';
  fullString += '\n';

  levelIndent += 1;

  if (name === 'log') fullString = null;

  if (fullString) {
    fullDescription += fullString;
  }

  full.stepId = crypto.randomBytes(16).toString('hex');

  for (const runnerBlock of runnerBlockNames) {
    let runnerBlockValue = _.get(full, [runnerBlock]);
    if (_.isArray(runnerBlockValue)) {
      for (let runnerNum in runnerBlockValue) {
        let newRunner = {};
        let name;
        let runner = _.get(runnerBlockValue, [runnerNum], {});

        let keys = Object.keys(runner);
        if (keys && keys.length == 1) {
          name = keys[0];
          newRunner = _.clone(runner[name]) || newRunner;
          newRunner.name = name;
        }

        name = _.get(newRunner, 'name', null);

        if (name) {
          let breadcrumbs = _.clone(full.breadcrumbs);
          breadcrumbs.push(`${runnerBlock}[${runnerNum}].${name}`);
          newRunner.breadcrumbs = breadcrumbs;

          newRunner.type = name == 'log' ? 'log' : 'test';

          full[runnerBlock][runnerNum] = getFullDepthJSON({
            filePath: name,
            testBody: newRunner,
            testsFolder: testsFolder,
            levelIndent,
          });
        }
      }
    }
  }

  full.name = _.get(full, 'name', filePath);

  return full;
};

const getDescriptions = function() {
  return fullDescription;
};

module.exports = { getFullDepthJSON, getDescriptions };

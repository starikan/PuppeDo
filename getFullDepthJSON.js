const crypto = require('crypto');

const _ = require('lodash');
const { getAllYamls } = require('./yaml2json');

const RUNNER_BLOCK_NAMES = ['beforeTest', 'runTest', 'afterTest', 'errorTest'];
let fullDescription = '';
let allTests;

const getFullDepthJSON = function({ envs, filePath, testBody, testsFolder, levelIndent = 0, textView = false }) {
  testsFolder = testsFolder || (envs && envs.get('args.testsFolder'));
  if (!allTests) {
    allTests = getAllYamls({ testsFolder });
  }

  // Generate text view for test
  if (textView) {
    fullDescription = '';
  }

  let full = allTests.allContent.find(v => v.name === filePath && ['atom', 'test'].includes(v.type));
  if (!full) {
    throw { message: `Test with name '${filePath}' not found in folder '${testsFolder}'` };
  }

  full = testBody ? Object.assign(full, testBody) : full;
  full.breadcrumbs = _.get(full, 'breadcrumbs', [filePath]);
  full.levelIndent = levelIndent;
  full.stepId = crypto.randomBytes(16).toString('hex');

  const { description, name, todo } = full;
  let fullString = [
    '   '.repeat(levelIndent),
    todo ? 'TODO: ' + todo + '== ' : '',
    description ? `${description} ` : '',
    name ? `(${name})` : '',
    '\n',
  ].join('');

  if (fullString) {
    fullDescription += fullString;
  }

  for (const runnerBlock of RUNNER_BLOCK_NAMES) {
    let runnerBlockValue = _.get(full, [runnerBlock]);
    if (_.isArray(runnerBlockValue)) {
      for (let runnerNum in runnerBlockValue) {
        let newRunner = {};
        let name;
        let runner = _.get(runnerBlockValue, [runnerNum], {});

        let keys = Object.keys(runner);
        if (keys.length == 1) {
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
            levelIndent: levelIndent + 1,
          });
        }
      }
    } else if (!_.isString(runnerBlockValue) && !_.isArray(runnerBlockValue) && !_.isUndefined(runnerBlockValue)){
      throw {
        message: `Running block '${runnerBlock}' in test '${full.name}' in file '${full.filePath}' must be array of tests`,
      };
    }
  }

  full.name = _.get(full, 'name', filePath);

  return full;
};

const getDescriptions = function() {
  return fullDescription;
};

module.exports = { getFullDepthJSON, getDescriptions };

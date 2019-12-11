const crypto = require('crypto');

const _ = require('lodash');
const { getAllYamls } = require('./yaml2json');

const RUNNER_BLOCK_NAMES = ['beforeTest', 'runTest', 'afterTest', 'errorTest'];

const generateDescriptionStep = fullJSON => {
  const { description, name, todo, levelIndent } = fullJSON;

  const descriptionString = [
    '   '.repeat(levelIndent),
    todo ? 'TODO: ' + todo + '== ' : '',
    description ? `${description} ` : '',
    name ? `(${name})` : '',
    '\n',
  ].join('');

  return descriptionString;
};

const getFullDepthJSON = function({ testName, testsFolder, testBody = {}, levelIndent = 0, allTests = false }) {
  allTests = allTests || getAllYamls({ testsFolder });

  let fullJSON = allTests.allContent.find(v => v.name === testName && ['atom', 'test'].includes(v.type));
  if (!fullJSON) {
    throw { message: `Test with name '${testName}' not found in folder '${testsFolder}'` };
  }

  fullJSON = Object.assign({}, fullJSON, testBody);
  fullJSON.breadcrumbs = _.get(fullJSON, 'breadcrumbs', [testName]);
  fullJSON.levelIndent = levelIndent;
  fullJSON.stepId = crypto.randomBytes(16).toString('hex');

  let textDescription = generateDescriptionStep(fullJSON);

  for (const runnerBlock of RUNNER_BLOCK_NAMES) {
    let runnerBlockValue = _.get(fullJSON, [runnerBlock]);
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
          newRunner.breadcrumbs = [...fullJSON.breadcrumbs, `${runnerBlock}[${runnerNum}].${name}`];
          const { fullJSON: fullJSONResponse, textDescription: textDescriptionResponse } = getFullDepthJSON({
            testName: name,
            testsFolder,
            testBody: newRunner,
            levelIndent: levelIndent + 1,
            allTests,
          });

          fullJSON[runnerBlock][runnerNum] = fullJSONResponse;
          textDescription += textDescriptionResponse;
        }
      }
    } else if (!_.isString(runnerBlockValue) && !_.isArray(runnerBlockValue) && !_.isUndefined(runnerBlockValue)) {
      throw {
        message: `Running block '${runnerBlock}' in test '${fullJSON.name}' in file '${fullJSON.filePath}' must be array of tests`,
      };
    }
  }

  fullJSON.name = _.get(fullJSON, 'name', testName);

  return { fullJSON, textDescription };
};

module.exports = { getFullDepthJSON };

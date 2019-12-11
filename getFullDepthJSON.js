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

const getFullDepthJSON = function({ envs, filePath, testBody = {}, testsFolder, levelIndent = 0, allTests = false }) {
  testsFolder = testsFolder || (envs && envs.get('args.testsFolder'));
  allTests = allTests || getAllYamls({ testsFolder });

  let fullJSON = allTests.allContent.find(v => v.name === filePath && ['atom', 'test'].includes(v.type));
  if (!fullJSON) {
    throw { message: `Test with name '${filePath}' not found in folder '${testsFolder}'` };
  }

  fullJSON = Object.assign({}, fullJSON, testBody);
  fullJSON.breadcrumbs = _.get(fullJSON, 'breadcrumbs', [filePath]);
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
            filePath: name,
            testBody: newRunner,
            testsFolder,
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

  fullJSON.name = _.get(fullJSON, 'name', filePath);

  return { fullJSON, textDescription };
};

module.exports = { getFullDepthJSON };

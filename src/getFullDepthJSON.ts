import crypto from 'crypto';

import _ from 'lodash';

import TestsContent from './TestContent';
import Environment from './Environment';

const RUNNER_BLOCK_NAMES = ['beforeTest', 'runTest', 'afterTest', 'errorTest'];

const generateDescriptionStep = (fullJSON) => {
  const { description, name, todo, levelIndent } = fullJSON;

  const descriptionString = [
    '   '.repeat(levelIndent),
    todo ? `TODO: ${todo}== ` : '',
    description ? `${description} ` : '',
    name ? `(${name})` : '',
    '\n',
  ].join('');

  return descriptionString;
};

const getFullDepthJSON = ({ testName = null, testBody = {}, levelIndent = 0, envsId = null } = {}) => {
  const testNameResolved = testName || Environment(envsId).envs.get('current.test');
  const allTests = new TestsContent().allData;

  const testJSON = _.cloneDeep(
    allTests.allContent.find((v) => v.name === testNameResolved && ['atom', 'test'].includes(v.type)),
  );
  if (!testJSON) {
    throw new Error(`Test with name '${testNameResolved}' not found in root folder and additional folders`);
  }

  const fullJSON = _.cloneDeep({ ...testJSON, ...testBody });
  fullJSON.breadcrumbs = fullJSON.breadcrumbs || [testNameResolved];
  fullJSON.levelIndent = levelIndent;
  fullJSON.stepId = crypto.randomBytes(16).toString('hex');

  let textDescription = generateDescriptionStep(fullJSON);

  RUNNER_BLOCK_NAMES.forEach((runnerBlock) => {
    const runnerBlockValue = _.get(fullJSON, [runnerBlock]);
    if (_.isArray(runnerBlockValue)) {
      runnerBlockValue.forEach((v, runnerNum) => {
        const runner = Object.entries(_.get(runnerBlockValue, [runnerNum], {}));

        let [name, newRunner] = runner.length ? runner[0] : [null, {}];
        // It`s important. Subtest may named but no body.
        name = name || null;
        newRunner = newRunner || {};

        if (name) {
          newRunner.name = name;
          newRunner.breadcrumbs = [...fullJSON.breadcrumbs, `${runnerBlock}[${runnerNum}].${name}`];
          const { fullJSON: fullJSONResponse, textDescription: textDescriptionResponse } = getFullDepthJSON({
            testName: name,
            testBody: newRunner,
            levelIndent: levelIndent + 1,
          });

          fullJSON[runnerBlock][runnerNum] = fullJSONResponse;
          textDescription += textDescriptionResponse;
        }
      });
    } else if (!_.isString(runnerBlockValue) && !_.isArray(runnerBlockValue) && !_.isUndefined(runnerBlockValue)) {
      throw new Error(
        `Running block '${runnerBlock}' in test '${fullJSON.name}' in file '${fullJSON.testFile}' \
        must be array of tests`,
      );
    }
  });

  fullJSON.name = _.get(fullJSON, 'name', testNameResolved);

  return { fullJSON, textDescription };
};

export default getFullDepthJSON;

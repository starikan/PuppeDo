import crypto from 'crypto';

import cloneDeep from 'lodash/cloneDeep';
import isString from 'lodash/isString';
import isUndefined from 'lodash/isUndefined';
import get from 'lodash/get';

import TestsContent from './TestContent';
import Environment from './Environment';

type FyllJsonType = {
  description: string;
  name: string;
  todo: string;
  levelIndent: number;
};

const RUNNER_BLOCK_NAMES = ['beforeTest', 'runTest', 'afterTest', 'errorTest'];

const generateDescriptionStep = (fullJSON: FyllJsonType): string => {
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

  const testJSON = cloneDeep(
    allTests.allContent.find((v) => v.name === testNameResolved && ['atom', 'test'].includes(v.type)),
  );
  if (!testJSON) {
    throw new Error(`Test with name '${testNameResolved}' not found in root folder and additional folders`);
  }

  const fullJSON = cloneDeep({ ...testJSON, ...testBody });
  fullJSON.breadcrumbs = fullJSON.breadcrumbs || [testNameResolved];
  fullJSON.levelIndent = levelIndent;
  fullJSON.stepId = crypto.randomBytes(16).toString('hex');

  let textDescription = generateDescriptionStep(fullJSON);

  RUNNER_BLOCK_NAMES.forEach((runnerBlock) => {
    const runnerBlockValue = get(fullJSON, [runnerBlock]);
    if (Array.isArray(runnerBlockValue)) {
      runnerBlockValue.forEach((v, runnerNum) => {
        const runner: [string, { name?: string; breadcrumbs?: any[] }][] = Object.entries(
          get(runnerBlockValue, [runnerNum], {}),
        );

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
    } else if (!isString(runnerBlockValue) && !Array.isArray(runnerBlockValue) && !isUndefined(runnerBlockValue)) {
      throw new Error(
        `Running block '${runnerBlock}' in test '${fullJSON.name}' in file '${fullJSON.testFile}' \
        must be array of tests`,
      );
    }
  });

  fullJSON.name = get(fullJSON, 'name', testNameResolved);

  return { fullJSON, textDescription };
};

export default getFullDepthJSON;

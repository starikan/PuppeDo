import crypto from 'crypto';

import cloneDeep from 'lodash/cloneDeep';
import isString from 'lodash/isString';
import isUndefined from 'lodash/isUndefined';
import get from 'lodash/get';

import TestsContent from './TestContent';
import Environment from './Environment';

type FullJsonType = {
  description: string;
  name: string;
  todo: string;
  levelIndent: number;
};

const RUNNER_BLOCK_NAMES = ['beforeTest', 'runTest', 'afterTest', 'errorTest'];

const generateDescriptionStep = (fullJSON: FullJsonType): string => {
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

const getFullDepthJSONRecurce = (testName: string, testBody = {}, levelIndent: number = 0) => {
  const allTests = new TestsContent().allData;
  const testJSON = cloneDeep(allTests.allContent.find((v) => v.name === testName && ['atom', 'test'].includes(v.type)));
  if (!testJSON) {
    throw new Error(`Test with name '${testName}' not found in root folder and additional folders`);
  }

  const fullJSON = cloneDeep({ ...testJSON, ...testBody });
  fullJSON.breadcrumbs = fullJSON.breadcrumbs || [testName];
  fullJSON.levelIndent = levelIndent;
  fullJSON.stepId = crypto.randomBytes(16).toString('hex');

  let textDescription = generateDescriptionStep(fullJSON);

  RUNNER_BLOCK_NAMES.forEach((runnerBlock) => {
    const runnerBlockValue = get(fullJSON, [runnerBlock]);
    if (Array.isArray(runnerBlockValue)) {
      runnerBlockValue.forEach((v, runnerNum) => {
        const runner: [string, { name?: string; breadcrumbs?: any[] }][] = Object.entries(
          runnerBlockValue[runnerNum] || {},
        );

        let [name, newRunner] = runner.length ? runner[0] : [null, {}];
        // It`s important. Subtest may named but no body.
        name = name || null;
        newRunner = newRunner || {};

        if (name) {
          newRunner.name = name;
          newRunner.breadcrumbs = [...fullJSON.breadcrumbs, `${runnerBlock}[${runnerNum}].${name}`];
          const { fullJSON: fullJSONResponse, textDescription: textDescriptionResponse } = getFullDepthJSONRecurce(
            name,
            newRunner,
            levelIndent + 1,
          );

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

  fullJSON.name = fullJSON.name || testName;

  return { fullJSON, textDescription };
};

const getFullDepthJSON = (envsId: string) => {
  const testName = Environment(envsId).envs.current.test;
  return getFullDepthJSONRecurce(testName);
};

export default getFullDepthJSON;

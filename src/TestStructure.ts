import crypto from 'crypto';

// import get from 'lodash/get';

import TestsContent from './TestContent';
import Environment from './Environment';

type FullJsonType = {
  description?: string;
  name: string;
  todo?: string;
  levelIndent?: number;
  breadcrumbs?: string[];
  stepId: string;
  testFile: string;
};

interface TestStructureType {
  fullJSON: FullJsonType;
  textDescription: string;
}

export default class TestStructure implements TestStructureType {
  fullJSON: FullJsonType;
  textDescription: string;

  constructor(envsId: string) {
    const testNameStart = Environment(envsId)?.envsPool?.current?.test || '';
    const { fullJSON, textDescription } = this.getFullDepthJSONRecurce(testNameStart);
    this.fullJSON = fullJSON;
    this.textDescription = textDescription;
  }

  static generateDescriptionStep(fullJSON: FullJsonType): string {
    const { description, name, todo, levelIndent = 0 } = fullJSON;

    const descriptionString = [
      '   '.repeat(levelIndent),
      todo ? `TODO: ${todo}== ` : '',
      description ? `${description} ` : '',
      name ? `(${name})` : '',
      '\n',
    ].join('');

    return descriptionString;
  }

  static getTestRaw(name: string): any {
    const allTests = new TestsContent().allData;
    const testJSON = JSON.parse(
      JSON.stringify(allTests.allContent.find((v) => v.name === name && ['atom', 'test'].includes(v.type))),
    );
    if (!testJSON) {
      throw new Error(`Test with name '${name}' not found in root folder and additional folders`);
    }
    return testJSON;
  }

  resolveRunner(
    runnerValue,
    runnerNum: number,
    fullJSONIncome: FullJsonType,
    runnerBlock: string,
    levelIndent: number,
  ): TestStructureType {
    const runner: [string, { name?: string; breadcrumbs?: string[] }][] = Object.entries(runnerValue);
    let [name, newRunner] = runner.length ? runner[0] : [null, {}];
    // It`s important. Subtest may named but no body.
    name = name || null;
    newRunner = newRunner || {};

    if (name) {
      newRunner.name = name;
      newRunner.breadcrumbs = [...fullJSONIncome.breadcrumbs, `${runnerBlock}[${runnerNum}].${name}`];
      const { fullJSON, textDescription } = this.getFullDepthJSONRecurce(name, newRunner, levelIndent + 1);
      return { fullJSON, textDescription };
    }
    return { fullJSON: null, textDescription: null };
  }

  getFullDepthJSONRecurce(testName: string, testBody = {}, levelIndent: number = 0): TestStructureType {
    const fullJSON = JSON.parse(JSON.stringify({ ...TestStructure.getTestRaw(testName), ...testBody }));
    fullJSON.breadcrumbs = fullJSON.breadcrumbs || [testName];
    fullJSON.levelIndent = levelIndent;
    fullJSON.stepId = crypto.randomBytes(16).toString('hex');

    let textDescription = TestStructure.generateDescriptionStep(fullJSON);

    const RUNNER_BLOCK_NAMES = ['beforeTest', 'runTest', 'afterTest'];
    RUNNER_BLOCK_NAMES.forEach((runnerBlock) => {
      const runnerBlockValue = fullJSON[runnerBlock];
      // const runnerBlockValue = get(fullJSON, [runnerBlock]);
      if (Array.isArray(runnerBlockValue)) {
        runnerBlockValue.forEach((runnerValue, runnerNum) => {
          const { fullJSON: fullJSONResponce, textDescription: textDescriptionResponse } = this.resolveRunner(
            runnerValue,
            runnerNum,
            fullJSON,
            runnerBlock,
            levelIndent,
          );
          if (fullJSONResponce) fullJSON[runnerBlock][runnerNum] = fullJSONResponce;
          if (textDescriptionResponse) textDescription += textDescriptionResponse;
        });
      } else if (
        typeof runnerBlockValue !== 'string' &&
        !Array.isArray(runnerBlockValue) &&
        runnerBlockValue !== undefined
      ) {
        throw new Error(
          `Running block '${runnerBlock}' in test '${fullJSON.name}' in file '${fullJSON.testFile}' \
          must be array of tests`,
        );
      }
    });

    fullJSON.name = fullJSON.name || testName;

    return { fullJSON, textDescription };
  }
}

import crypto from 'crypto';

import TestsContent from './TestContent';
import Environment from './Environment';
import { merge } from './Helpers';

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

  constructor(envsId: string, testName: string) {
    // TODO: 2020-10-16 S.Starodubov непонятно почему валится запуск если убрать
    Environment(envsId);
    const { fullJSON, textDescription } = this.getFullDepthJSONRecurce(testName);
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

    const testSource = allTests.allContent.find((v) => v.name === name && ['atom', 'test'].includes(v.type));
    if (!testSource) {
      throw new Error(`Test with name '${name}' not found in root folder and additional folders`);
    }
    const testJSON = JSON.parse(JSON.stringify(testSource));
    return testJSON;
  }

  resolveRunner(
    runnerValue: Record<string, { name?: string; breadcrumbs?: string[] }>,
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

  getFullDepthJSONRecurce(testName: string, testBody = {}, levelIndent = 0): TestStructureType {
    const fullJSON = merge(TestStructure.getTestRaw(testName), testBody) as FullJsonType;
    fullJSON.breadcrumbs = fullJSON.breadcrumbs || [testName];
    fullJSON.levelIndent = levelIndent;
    fullJSON.stepId = crypto.randomBytes(16).toString('hex');

    let textDescription = TestStructure.generateDescriptionStep(fullJSON);

    const RUNNER_BLOCK_NAMES = ['beforeTest', 'runTest', 'afterTest'];
    RUNNER_BLOCK_NAMES.forEach((runnerBlock) => {
      const runnerBlockValue = fullJSON[runnerBlock] || [];
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
        const errorString = `Running block '${runnerBlock}' in test '${fullJSON.name}' in file '${fullJSON.testFile}'
        must be array of tests`;
        throw new Error(errorString);
      }
    });

    fullJSON.name = fullJSON.name || testName;

    return { fullJSON, textDescription };
  }
}

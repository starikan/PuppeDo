import crypto from 'crypto';

import TestsContent from './TestContent';

import { TestType } from './global.d';
import { RUNNER_BLOCK_NAMES } from './Helpers';

type TestExtendType = TestType & {
  levelIndent?: number;
  breadcrumbs?: string[];
  stepId?: string;
};

export default class TestStructure {
  fullJSON: TestExtendType;
  textDescription: string;

  constructor(testName: string) {
    const { fullJSON, textDescription } = this.getFullDepthJSONRecurce(testName);
    this.fullJSON = JSON.parse(JSON.stringify(fullJSON));
    this.textDescription = JSON.parse(JSON.stringify(textDescription));
  }

  static generateDescriptionStep(fullJSON: TestExtendType): string {
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

  static getTestRaw(name: string): TestType {
    const { tests, atoms } = new TestsContent().allData;
    const testSource = [...tests, ...atoms].find((v) => v.name === name);

    if (!testSource) {
      throw new Error(`Test with name '${name}' not found in root folder and additional folders`);
    }

    return JSON.parse(JSON.stringify(testSource));
  }

  resolveRunner(
    runnerValue: Record<string, { name?: string; breadcrumbs?: string[] }>,
    runnerNum: number,
    fullJSONIncome: TestExtendType,
    runnerBlock: string,
    levelIndent: number,
  ): {
    fullJSON: TestExtendType;
    textDescription: string;
  } {
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

  getFullDepthJSONRecurce(
    testName: string,
    testBody = {},
    levelIndent = 0,
  ): {
    fullJSON: TestExtendType;
    textDescription: string;
  } {
    const fullJSON: TestExtendType = { ...TestStructure.getTestRaw(testName), ...testBody };

    fullJSON.breadcrumbs = fullJSON.breadcrumbs || [testName];
    fullJSON.levelIndent = levelIndent;
    fullJSON.stepId = crypto.randomBytes(16).toString('hex');

    let textDescription = TestStructure.generateDescriptionStep(fullJSON);

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
          if (fullJSONResponce) fullJSON[runnerBlock][runnerNum] = JSON.parse(JSON.stringify(fullJSONResponce));
          // TODO: 2020-11-20 S.Starodubov сделать генерацию ескрипшена из полной JSON а не во время
          if (textDescriptionResponse) textDescription += textDescriptionResponse;
        });
      } else {
        const errorString = `Running block '${runnerBlock}' in test '${fullJSON.name}' in file '${fullJSON.testFile}'
        must be array of tests`;
        throw new Error(errorString);
      }
    });

    return { fullJSON, textDescription };
  }
}

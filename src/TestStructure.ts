import TestsContent, { BLANK_TEST } from './TestContent';

import { TestExtendType, TestType } from './global.d';
import { RUNNER_BLOCK_NAMES, generateId, deepMergeField } from './Helpers';

export default class TestStructure {
  static filteredFullJSON(fullJSON: TestExtendType): TestExtendType {
    const keys = Object.keys(BLANK_TEST);
    const fullJSONFiltered: Partial<TestExtendType> = {};
    keys.forEach((v) => {
      const value = fullJSON[v];

      if (['string', 'boolean', 'number'].includes(typeof value) && value !== null && value !== BLANK_TEST[v]) {
        fullJSONFiltered[v] = fullJSON[v];
      }
      if (
        ['object'].includes(typeof value) &&
        value !== null &&
        ((Array.isArray(value) && !value.length) || !Object.keys(value).length)
      ) {
        fullJSONFiltered[v] = value;
      }
    });

    if (fullJSONFiltered.runTest && fullJSONFiltered.runTest.length) {
      fullJSONFiltered.runTest = (fullJSONFiltered.runTest as TestExtendType[]).map((v: TestExtendType) => {
        const result = TestStructure.filteredFullJSON(v);
        return result;
      });
    }

    return fullJSONFiltered as TestExtendType;
  }

  static generateDescription(fullJSON: TestExtendType, indentLength = 3): string {
    const { description, name, todo, levelIndent = 0 } = fullJSON;

    const descriptionString = [
      ' '.repeat(levelIndent * indentLength),
      todo ? `TODO: ${todo}== ` : '',
      description ? `${description} ` : '',
      name ? `(${name})` : '',
    ].join('');

    const blocks = RUNNER_BLOCK_NAMES.map((v) => fullJSON[v] || [])
      .flat()
      .filter((v) => typeof v !== 'function')
      .map((v) => TestStructure.generateDescription(v as TestExtendType))
      .join('');
    const result = `${descriptionString}\n${blocks}`;

    return result;
  }

  static getTestRaw(name: string): TestType {
    const { tests, atoms } = new TestsContent().allData;
    const testSource = [...tests, ...atoms].find((v) => v.name === name);

    if (!testSource) {
      throw new Error(`Test with name '${name}' not found in root folder and additional folders`);
    }

    return JSON.parse(JSON.stringify(testSource));
  }

  static resolveRunner(
    runnerValue: Record<string, { name?: string; breadcrumbs?: string[]; breadcrumbsDescriptions?: string[] }>,
    runnerNum: number,
    fullJSONIncome: TestExtendType,
    runnerBlock: string,
    levelIndent: number,
  ): TestExtendType {
    const runner: [string, { name?: string; breadcrumbs?: string[]; breadcrumbsDescriptions?: string[] }][] =
      Object.entries(runnerValue);
    let [name, newRunner] = runner.length ? runner[0] : [null, {}];
    // It`s important. Subtest may named but no body.
    name = name || null;
    newRunner = newRunner || {};

    if (name) {
      newRunner.name = name;
      newRunner.breadcrumbs = [...fullJSONIncome.breadcrumbs, `${runnerBlock}[${runnerNum}].${name}`];
      newRunner.breadcrumbsDescriptions = [...fullJSONIncome.breadcrumbsDescriptions, fullJSONIncome.description];
      const fullJSON = TestStructure.getFullDepthJSON(name, newRunner, levelIndent + 1);
      return fullJSON;
    }
    return null;
  }

  static getFullDepthJSON(testName: string, testBody: Partial<TestExtendType> = {}, levelIndent = 0): TestExtendType {
    const rawTest = TestStructure.getTestRaw(testName);
    const fullJSON: TestExtendType = deepMergeField<TestExtendType, string>(rawTest, testBody, [
      'logOptions',
    ]) as TestExtendType;

    fullJSON.breadcrumbs = fullJSON.breadcrumbs || [testName];
    fullJSON.breadcrumbsDescriptions = fullJSON.breadcrumbsDescriptions || [];
    fullJSON.levelIndent = levelIndent;
    fullJSON.stepId = generateId();
    fullJSON.source = JSON.stringify(fullJSON, null, 2);

    RUNNER_BLOCK_NAMES.forEach((runnerBlock) => {
      const runnerBlockValue = fullJSON[runnerBlock] || [];
      if (!Array.isArray(runnerBlockValue)) {
        const errorString = `Running block '${runnerBlock}' in test '${fullJSON.name}' in file '${fullJSON.testFile}'
        must be array of tests`;
        throw new Error(errorString);
      }
      runnerBlockValue.forEach((runnerValue, runnerNum: number) => {
        const fullJSONResponce = TestStructure.resolveRunner(
          runnerValue,
          runnerNum,
          fullJSON,
          runnerBlock,
          levelIndent,
        );
        if (fullJSONResponce) {
          fullJSON[runnerBlock][runnerNum] = fullJSONResponce;
        }
      });
    });

    return fullJSON;
  }
}

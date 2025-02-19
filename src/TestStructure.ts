import TestsContent, { BLANK_TEST } from './TestContent';

import { TestExtendType, TestType } from './global.d';
import { generateId, deepMergeField } from './Helpers';
import { Arguments } from './Arguments';

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
    const { PPD_LIFE_CYCLE_FUNCTIONS } = new Arguments().args;
    const { description, name, todo, levelIndent = 0 } = fullJSON;

    const descriptionString = [
      ' '.repeat(levelIndent * indentLength),
      todo ? `TODO: ${todo}== ` : '',
      description ? `${description} ` : '',
      name ? `(${name})` : '',
    ].join('');

    const blocks = PPD_LIFE_CYCLE_FUNCTIONS.map((v) => fullJSON[v] || [])
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

  static getFullDepthJSON(testName: string, testBody: Partial<TestExtendType> = {}, levelIndent = 0): TestExtendType {
    const { PPD_LIFE_CYCLE_FUNCTIONS } = new Arguments().args;
    const rawTest = TestStructure.getTestRaw(testName);
    const fullJSON: TestExtendType = deepMergeField<TestExtendType>(rawTest, testBody, ['logOptions']);

    fullJSON.breadcrumbs = fullJSON.breadcrumbs || [testName];
    fullJSON.breadcrumbsDescriptions = fullJSON.breadcrumbsDescriptions || [];
    fullJSON.levelIndent = levelIndent;
    fullJSON.stepId = generateId();
    fullJSON.source = JSON.stringify(fullJSON, null, 2);

    PPD_LIFE_CYCLE_FUNCTIONS.forEach((runnerBlockName) => {
      const runnerBlockValue = (fullJSON[runnerBlockName] || []) as { string: TestExtendType }[];
      if (!Array.isArray(runnerBlockValue)) {
        const errorString = `Running block '${runnerBlockName}' in test '${fullJSON.name}' in file '${fullJSON.testFile}'
        must be array of tests`;
        throw new Error(errorString);
      }
      runnerBlockValue.forEach((runnerValue: { string: TestExtendType }, runnerNum: number) => {
        const runner: [string, TestExtendType] = Object.entries(runnerValue)[0];
        const name = runner[0];
        const newRunner = runner[1] ?? ({ name } as TestExtendType);

        newRunner.name = name;
        newRunner.breadcrumbs = [...(fullJSON.breadcrumbs ?? []), `${runnerBlockName}[${runnerNum}].${name}`];
        newRunner.breadcrumbsDescriptions = [...(fullJSON.breadcrumbsDescriptions ?? []), fullJSON.description];

        const fullJSONResponce = TestStructure.getFullDepthJSON(name, newRunner, levelIndent + 1);
        fullJSON[runnerBlockName][runnerNum] = fullJSONResponce;
      });
    });

    return fullJSON;
  }
}

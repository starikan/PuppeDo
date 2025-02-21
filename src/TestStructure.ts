import TestsContent, { BLANK_TEST, resolveTest } from './TestContent';

import { LifeCycleFunction, TestExtendType, TestTypeYaml } from './global.d';
import { generateId, deepMergeField } from './Helpers';
import { Arguments } from './Arguments';

export default class TestStructure {
  static filteredFullJSON(fullJSON: TestExtendType): TestExtendType {
    const { PPD_LIFE_CYCLE_FUNCTIONS } = new Arguments().args;
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

    for (const lifeCycleFunction of PPD_LIFE_CYCLE_FUNCTIONS) {
      if ((fullJSONFiltered[lifeCycleFunction] as LifeCycleFunction[])?.length) {
        fullJSONFiltered[lifeCycleFunction] = (fullJSONFiltered[lifeCycleFunction] as TestExtendType[]).map(
          (v: TestExtendType) => {
            const result = TestStructure.filteredFullJSON(v);
            return result;
          },
        );
      }
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

  static getTestRaw(name: string): Required<TestTypeYaml> {
    const { tests, atoms } = new TestsContent().allData;
    const testSource = [...tests, ...atoms].find((v) => v.name === name);

    if (!testSource) {
      throw new Error(`Test with name '${name}' not found in root folder and additional folders`);
    }

    return JSON.parse(JSON.stringify(testSource));
  }

  static getFullDepthJSON(testName: string, testBody: TestTypeYaml | null = null, levelIndent = 0): TestExtendType {
    const rawTest = TestStructure.getTestRaw(testName);
    const fullJSON: TestExtendType = deepMergeField<TestExtendType>(rawTest, testBody ?? {}, ['logOptions']);

    fullJSON.breadcrumbs = fullJSON.breadcrumbs || [testName];
    fullJSON.breadcrumbsDescriptions = fullJSON.breadcrumbsDescriptions || [];
    fullJSON.levelIndent = levelIndent;
    fullJSON.stepId = generateId();
    fullJSON.source = JSON.stringify(fullJSON, null, 2);

    const { PPD_LIFE_CYCLE_FUNCTIONS } = new Arguments().args;
    PPD_LIFE_CYCLE_FUNCTIONS.forEach((lifeCycleFunctionName) => {
      const lifeCycleFunctionValue = (fullJSON[lifeCycleFunctionName] || []) as LifeCycleFunction[];

      if (!Array.isArray(lifeCycleFunctionValue)) {
        const errorString = `Block '${lifeCycleFunctionName}' in agent '${fullJSON.name}' in file '${fullJSON.testFile}' must be array of agents`;
        throw new Error(errorString);
      }

      lifeCycleFunctionValue.forEach((runnerValue: LifeCycleFunction, runnerNum: number) => {
        if (Object.keys(runnerValue).length !== 1) {
          const errorString = `Block '${lifeCycleFunctionName}' in agent '${fullJSON.name}' in file '${fullJSON.testFile}' must be array of agents with one key each`;
          throw new Error(errorString);
        }

        const name = Object.keys(runnerValue)[0];
        const runner = Object.values(runnerValue)[0] ?? resolveTest({ name });

        runner.name = name;
        runner.breadcrumbs = [...(fullJSON.breadcrumbs ?? []), `${lifeCycleFunctionName}[${runnerNum}].${name}`];
        runner.breadcrumbsDescriptions = [...(fullJSON.breadcrumbsDescriptions ?? []), fullJSON.description];

        const fullJSONResponce = TestStructure.getFullDepthJSON(name, runner, levelIndent + 1);
        fullJSON[lifeCycleFunctionName][runnerNum] = fullJSONResponce;
      });
    });

    return fullJSON;
  }
}

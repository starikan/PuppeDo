import { Arguments } from './Arguments';
import { deepMergeField, generateId } from './Helpers';
import type { LifeCycleFunction, TestExtendType, TestTypeYaml } from './model';
import AgentContent, { resolveTest } from './TestContent';

export default class FlowStructure {
  static generateFlowDescription(flowJSON: TestExtendType, indentLength = 3): string {
    const { PPD_LIFE_CYCLE_FUNCTIONS } = new Arguments().args;
    const { description, name, todo, levelIndent = 0 } = flowJSON;

    const descriptionString = [
      ' '.repeat(levelIndent * indentLength),
      todo ? `TODO: ${todo}== ` : '',
      description ? `${description} ` : '',
      name ? `(${name})` : '',
    ].join('');

    const blocks = PPD_LIFE_CYCLE_FUNCTIONS.flatMap((v) => flowJSON[v] || [])
      .filter((v) => typeof v !== 'function')
      .map((v) => FlowStructure.generateFlowDescription(v as TestExtendType))
      .join('');
    const result = `${descriptionString}\n${blocks}`;

    return result;
  }

  static getFlowRaw(name: string): Required<TestTypeYaml> {
    const { agents } = new AgentContent().allData;
    const agentSource = agents.find((v) => v.name === name);

    if (!agentSource) {
      return resolveTest({ name: String(name) });
    }

    return JSON.parse(JSON.stringify(agentSource));
  }

  static getFlowFullJSON(
    flowName: string,
    flowBody: TestTypeYaml | null = null,
    levelIndent = 0,
    resolved = true,
  ): TestExtendType {
    const rawTest = FlowStructure.getFlowRaw(flowName);

    // TODO: 2025-03-11 S.Starodubov logOptions
    const fullJSON: TestExtendType = resolved
      ? deepMergeField<TestExtendType>(rawTest, flowBody ?? {}, ['logOptions'])
      : JSON.parse(JSON.stringify({ ...flowBody, ...rawTest }));

    fullJSON.breadcrumbs = fullJSON.breadcrumbs || [flowName];
    fullJSON.breadcrumbsDescriptions = fullJSON.breadcrumbsDescriptions || [];
    fullJSON.levelIndent = levelIndent;
    fullJSON.stepId = fullJSON.stepId ?? generateId();
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
        runner.breadcrumbs = [...fullJSON.breadcrumbs, `${lifeCycleFunctionName}[${runnerNum}].${name}`];
        runner.breadcrumbsDescriptions = [...fullJSON.breadcrumbsDescriptions, fullJSON.description];

        const fullJSONResponce = FlowStructure.getFlowFullJSON(
          name,
          runner,
          levelIndent + 1,
          Boolean(Object.values(runnerValue)[0]),
        );
        fullJSON[lifeCycleFunctionName][runnerNum] = fullJSONResponce;
      });
    });

    return fullJSON;
  }
}

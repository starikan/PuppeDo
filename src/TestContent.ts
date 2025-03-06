/* eslint-disable consistent-return */
import path from 'path';
import fs from 'fs';

import yaml from 'js-yaml';
import { walkSync } from '@puppedo/walk-sync';

import Singleton from './Singleton';
import { Arguments } from './Arguments';
import { mergeObjects } from './Helpers';

import { TestType, RunnerType, DataType, TestTypeYaml, TestExtendType, AllDataType } from './global.d';
import { BLANK_AGENT } from './Defaults';

export const resolveTest = (test: TestTypeYaml): Required<TestTypeYaml> => {
  const { PPD_LIFE_CYCLE_FUNCTIONS } = new Arguments().args;

  // todo: e2e test
  const duplicateKeys = PPD_LIFE_CYCLE_FUNCTIONS.filter((key) => Object.keys(BLANK_AGENT).includes(key));
  if (duplicateKeys.length) {
    throw new Error(
      `PPD_LIFE_CYCLE_FUNCTIONS contains keys that duplicate BLANK_AGENT keys: ${duplicateKeys.join(', ')}`,
    );
  }

  const result = {
    ...BLANK_AGENT,
    ...PPD_LIFE_CYCLE_FUNCTIONS.reduce((s, v) => ({ ...s, [v]: [] as TestExtendType[] }), {}),
    ...test,
  };
  return result;
};

export default class AgentContent extends Singleton {
  // TODO: Сделать геттер а это поле приватным
  public allData!: AllDataType;

  constructor(reInit = false) {
    super();

    if (reInit || !this.allData) {
      this.allData = this.getAllData();
    }
  }

  static getPaths(): string[] {
    const { PPD_ROOT, PPD_ROOT_ADDITIONAL, PPD_ROOT_IGNORE, PPD_FILES_IGNORE, PPD_FILES_EXTENSIONS_AVAILABLE } =
      new Arguments().args;

    const rootFolder = path.normalize(PPD_ROOT);
    const additionalFolders = PPD_ROOT_ADDITIONAL.map((v: string) => path.normalize(v));
    const ignoreFolders = PPD_ROOT_IGNORE.map((v: string) => path.normalize(v));
    const ignoreFiles = PPD_FILES_IGNORE.map((v: string) => path.join(rootFolder, path.normalize(v)));

    const folders = [rootFolder, ...additionalFolders].map((v) => path.normalize(v));

    const paths = folders
      .map((folder) => {
        if (fs.existsSync(folder)) {
          return walkSync(folder, { ignoreFolders, ignoreFiles, includeExtensions: PPD_FILES_EXTENSIONS_AVAILABLE });
        }
        return [];
      })
      .flat();

    return paths;
  }

  /**
   * Checks array of agents for duplicates and empty names
   *
   * @param agents Array of agents to check
   * @returns Original array of agents if no duplicates found
   * @throws {Error} If empty names or duplicates are found
   */
  static checkDuplicates<T extends TestExtendType | RunnerType | DataType>(agents: Array<T>): Array<T> {
    const blankNames = agents.filter((v) => !v.name);
    if (blankNames.length) {
      throw new Error(`There is blank 'name' value in files:\n${blankNames.map((v) => v.testFile).join('\n')}`);
    }

    const dubs: Record<string, string[]> = {};
    agents.forEach((test) => {
      if (test.testFile) {
        (dubs[test.name] = dubs[test.name] || []).push(test.testFile);
      }
    });

    if (Object.values(dubs).some((v) => v.length > 1)) {
      const key = agents[0].type;
      const files = Object.entries(dubs)
        .filter(([, valueDub]) => valueDub.length > 1)
        .map(([keyDub, valueDub]) => `- Name: '${keyDub}'.\n${valueDub.map((v) => `    * '${v}'\n`).join('')}`)
        .join('\n');
      const message = `There is duplicates of '${key}':\n${files}`;
      throw new Error(message);
    }

    return agents;
  }

  /**
   * Reads the file and returns its content as an array of partially typed agents.
   *
   * @param filePath - The path to the file.
   * @returns An array of partially typed agents.
   */
  static readFile = (filePath: string): Partial<TestTypeYaml>[] => {
    let agentData: Partial<TestTypeYaml>[] = [];

    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      if (filePath.endsWith('.json')) {
        agentData = JSON.parse(fileContent);
      } else {
        agentData = yaml.loadAll(fileContent) as Partial<TestTypeYaml>[];
      }
    } catch {
      const errorType = filePath.endsWith('.json') ? 'JSON' : 'YAML';
      const errorLink = filePath.endsWith('.json') ? 'https://jsonlint.com/' : 'https://yamlchecker.com/';
      console.log(
        `\u001B[41mError ${errorType} read. File: '${filePath}'. Try to check it on ${errorLink}
          or add this file into PPD_FILES_IGNORE of folder into PPD_ROOT_IGNORE`,
      );
    }

    if (!Array.isArray(agentData)) {
      return [agentData];
    }

    return agentData;
  };

  /**
   * Resolving the agent file, checking for the presence of a name and test type.
   *
   * @param agentContent - Partial YAML agent type.
   * @param filePath - Path to the agent file.
   * @returns Returns the full YAML agent type, Runner type, or Data type.
   */
  static fileResolver = (
    agentContent: Partial<TestTypeYaml>,
    filePath: string,
  ): Required<TestTypeYaml> | RunnerType | DataType => {
    const { PPD_IGNORE_AGENTS_WITHOUT_NAME } = new Arguments().args;

    const { name } = agentContent;

    if (!name && !PPD_IGNORE_AGENTS_WITHOUT_NAME) {
      throw new Error('Every test need name');
    }

    if (!name) {
      return;
    }

    const collect = {
      ...{ name },
      ...agentContent,
      ...{ testFile: filePath },
    };

    if (!(collect.testFile || collect.inlineJS)) {
      return resolveTest(collect as TestTypeYaml);
    }

    return collect as RunnerType | DataType;
  };

  /**
   * Retrieves all data, including files, content, agents, runners, data, and selectors.
   * If force is true, the data will be retrieved anew; otherwise, it will be returned from the cache.
   *
   * @param force - A flag indicating whether to retrieve the data anew.
   * @returns An object containing all retrieved data.
   */
  getAllData(force = false): AllDataType {
    if (force || !this.allData) {
      const allFiles = AgentContent.getPaths();

      const allContent: Array<TestType | RunnerType | DataType> = allFiles
        .map((filePath) => AgentContent.readFile(filePath).map((v) => AgentContent.fileResolver(v, filePath)))
        .flat();

      const agents: Array<TestType> = AgentContent.checkDuplicates(
        allContent.filter((v): v is TestType => !['data', 'selectors', 'runner'].includes(v.type)),
      );
      const data: Array<DataType> = AgentContent.checkDuplicates(
        allContent.filter((v): v is DataType => v.type === 'data'),
      );
      const selectors: Array<DataType> = AgentContent.checkDuplicates(
        allContent.filter((v): v is DataType => v.type === 'selectors'),
      );
      const runners: Array<RunnerType> = AgentContent.checkDuplicates(
        allContent.filter((v): v is RunnerType => v.type === 'runner'),
      );
      const runnersResolved = AgentContent.resolveRunners(runners, data, selectors);

      this.allData = { allFiles, allContent, agents, runners: runnersResolved, data, selectors };
    }

    return this.allData;
  }

  /**
   * Resolves and merges extensions for runners.
   *
   * @param runnersAll - Array of all runners
   * @param dataAll - Array of all data
   * @param selectorsAll - Array of all selectors
   * @returns Array of resolved runners with merged extensions
   *
   * Function handles three types of extensions:
   * 1. runnersExt - Extension from other runners (inherits browser, log, data, selectors, description)
   * 2. dataExt - Extension of data from external files
   * 3. selectorsExt - Extension of selectors from external files
   *
   * When resolving extensions:
   * - Checks existence of extended resources
   * - Merges properties considering priorities
   * - Updates description to reflect inheritance chain
   * - Throws error if extended resource is not found
   */
  static resolveRunners(
    runnersAll: Array<RunnerType>,
    dataAll: Array<DataType>,
    selectorsAll: Array<DataType>,
  ): Array<RunnerType> {
    return runnersAll.map((runner: RunnerType) => {
      const runnerResult = runner;
      const {
        dataExt = [],
        selectorsExt = [],
        runnersExt = [],
        data: dataRunner = {},
        selectors: selectorsRunner = {},
      } = runner;

      runnersExt.forEach((runnerExtName: string) => {
        const runnerExt = runnersAll.find((r) => r.name === runnerExtName);
        if (runnerExt) {
          if (runnerExt.browser) {
            runnerResult.browser = mergeObjects([runnerResult.browser, runnerExt?.browser]);
          }
          ['log', 'data', 'selectors'].forEach((key) => {
            runnerResult[key] = { ...(runnerResult[key] ?? {}), ...(runnerExt[key] ?? {}) };
          });
          runnerResult.description = `${runnerResult.description ?? ''} -> ${runnerExt.description ?? ''}`;
        } else {
          throw new Error(`PuppeDo can't resolve extended runner '${runnerExtName}' in runner '${runnerResult.name}'`);
        }
      });

      const resolveExtensions = (
        extNames: string[],
        collection: DataType[],
        type: 'data' | 'selectors',
        runnerValues: Record<string, unknown>,
      ): void => {
        extNames.forEach((extName) => {
          const collectionExt = collection.find((item) => item.name === extName);
          if (!collectionExt) {
            throw new Error(`PuppeDo can't resolve extended ${type} '${extName}' in runner '${runner.name}'`);
          }

          Object.assign(runnerResult, {
            [type]: { ...(runnerResult[type] ?? {}), ...(collectionExt.data ?? {}), ...runnerValues },
          });
        });
      };

      resolveExtensions(dataExt, dataAll, 'data', dataRunner);
      resolveExtensions(selectorsExt, selectorsAll, 'selectors', selectorsRunner);

      return runnerResult;
    });
  }
}

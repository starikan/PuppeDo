import { getTimer, pick, resolveAliases, runScriptInContext } from './Helpers';
import Blocker from './Blocker';
import { Arguments } from './Arguments';
import { Environment, Runner } from './Environment';
import AgentContent from './TestContent';
import { ContinueParentError, TestError } from './Error';
import { logDebug } from './Loggers/CustomLogEntries';
import {
  ColorsType,
  TestArgsType,
  LogFunctionType,
  TestLifeCycleFunctionType,
  TestExtendType,
  Element,
  AgentData,
} from './model';
import Atom from './AtomCore';
import { Plugins } from './PluginsCore';
import {
  PluginContinueOnError,
  PluginSkipSublingIfResult,
  PluginArgsRedefine,
  PluginDebug,
  PluginLogOptions,
  PluginOptions,
} from './Plugins';
import { EXTEND_BLANK_AGENT } from './Defaults';
import { Log } from './Log';
import { AgentTree } from './AgentTree';

const checkNeeds = (needs: string[], data: Record<string, unknown>, agentName: string): boolean => {
  // [['data', 'd'], 'another', 'optional?']
  const keysData = new Set(Object.keys(data));
  needs.forEach((d) => {
    if (typeof d === 'string' && d.endsWith('?')) return; // optional parameter
    const keysDataIncome = new Set(typeof d === 'string' ? [d] : d);
    const intersectionData = new Set([...keysData].filter((x) => keysDataIncome.has(x)));
    if (!intersectionData.size) {
      throw new Error(`Error: can't find data parameter "${d}" in ${agentName} test`);
    }
  });
  return true;
};

const resolveDataFunctions = (
  funcParams: Record<string, string>,
  allData: Record<string, unknown>,
): Record<string, unknown> => {
  const funcEval = Object.entries(funcParams).reduce((s, v) => {
    const [key, data] = v;
    let evalData: unknown = data;
    try {
      evalData = runScriptInContext(data, allData);
    } catch {
      // Nothing to do
    }
    const collector = { ...s, ...{ [key]: evalData } };
    return collector;
  }, {});
  return funcEval;
};

// TODO: 2021-12-07 S.Starodubov move to class and improve with ${getLogText(text, this.name, PPD_LOG_AGENT_NAME)}
export const checkIf = async (
  expr: string,
  ifType: 'if' | 'errorIf' | 'errorIfResult',
  log: LogFunctionType,
  plugins: Plugins,
  agent: AgentData,
  allData: Record<string, unknown> = {},
): Promise<boolean> => {
  let { levelIndent = 0 } = agent;
  const { breadcrumbs = [], stepId } = agent;

  const { continueOnError } = plugins.getPlugins<PluginContinueOnError>('continueOnError').getValues(stepId);
  const { PPD_LOG_STEPID } = plugins.getPlugins<PluginArgsRedefine>('argsRedefine').getValues(stepId).argsRedefine;

  const textAddition = PPD_LOG_STEPID ? ` [${stepId}]` : '';

  if (ifType === 'errorIfResult') {
    levelIndent += 1;
  }

  const exprResult = runScriptInContext(expr, allData);

  if ((!exprResult && ifType === 'if') || (exprResult && ifType !== 'if')) {
    const logLevel = exprResult ? 'error' : 'info';
    const logText = exprResult
      ? `Test stopped with expr ${ifType} = '${expr}'`
      : `Skip with IF expr '${expr}' === '${exprResult}'${textAddition}`;

    if (!continueOnError || logLevel === 'info') {
      await log({
        text: logText,
        level: logLevel,
        levelIndent,
        logOptions: {
          screenshot: !!exprResult,
          fullpage: !!exprResult,
        },
        logMeta: { breadcrumbs },
      });
    }

    if (exprResult) {
      throw new Error(logText);
    }

    return true;
  }

  return false;
};

const updateDataWithNeeds = (
  needData: string[],
  needSelectors: string[],
  dataLocal: Record<string, unknown>,
  selectorsLocal: Record<string, unknown>,
): { dataLocal: Record<string, unknown>; selectorsLocal: Record<string, unknown> } => {
  const allData = { ...selectorsLocal, ...dataLocal };
  const dataLocalCopy = { ...dataLocal };
  const selectorsLocalCopy = { ...selectorsLocal };

  [...needData, ...needSelectors]
    .map((v: string) => v.replace('?', ''))
    .forEach((v: string) => {
      dataLocalCopy[v] = typeof allData[v] !== 'undefined' ? allData[v] : null;
      selectorsLocalCopy[v] = typeof allData[v] !== 'undefined' ? allData[v] : null;
    });

  return { dataLocal: dataLocalCopy, selectorsLocal: selectorsLocalCopy };
};

const fetchData = (
  dataExt: string[],
  selectorsExt: string[],
  resultsFromParent: Record<string, unknown>,
  dataParent: Record<string, unknown>,
  data: Record<string, unknown>,
  bindData: Record<string, string>,
  selectorsParent: Record<string, unknown>,
  selectors: Record<string, unknown>,
  bindSelectors: Record<string, string>,
  runner: Runner,
): { dataLocal: Record<string, unknown>; selectorsLocal: Record<string, unknown> } => {
  const { PPD_DATA, PPD_SELECTORS } = new Arguments().args;
  const { data: allData, selectors: allSelectors } = new AgentContent().allData;

  const dataExtResolved = dataExt.reduce((collect, v) => {
    const extData = allData.find((d) => v === d.name);
    return extData ? { ...collect, ...extData.data } : collect;
  }, {});
  const selectorsExtResolved = selectorsExt.reduce((collect, v) => {
    const extData = allSelectors.find((d) => v === d.name);
    return extData ? { ...collect, ...extData.data } : collect;
  }, {});

  let dataLocal = {
    ...PPD_DATA,
    ...((runner && runner.getRunnerData().data) || {}),
    ...dataExtResolved,
    ...dataParent,
    ...(resultsFromParent || {}),
    ...data,
  };

  let selectorsLocal = {
    ...PPD_SELECTORS,
    ...((runner && runner.getRunnerData().selectors) || {}),
    ...selectorsExtResolved,
    ...selectorsParent,
    ...(resultsFromParent || {}),
    ...selectors,
  };

  const allDataLocal = { ...dataLocal, ...selectorsLocal };
  Object.entries(bindData).forEach((v: [string, string]) => {
    const [key, val] = v;
    dataLocal = { ...dataLocal, ...resolveDataFunctions({ [key]: val }, allDataLocal) };
  });

  Object.entries(bindSelectors).forEach((v: [string, string]) => {
    const [key, val] = v;
    selectorsLocal = { ...selectorsLocal, ...resolveDataFunctions({ [key]: val }, allDataLocal) };
  });

  return { dataLocal, selectorsLocal };
};

const getLogText = (text: string, nameTest = '', PPD_LOG_AGENT_NAME = false): string => {
  const nameTestResolved = nameTest && (PPD_LOG_AGENT_NAME || !text) ? `(${nameTest}) ` : '';
  const descriptionTest = text || 'TODO: Fill description';
  return `${nameTestResolved}${descriptionTest}`;
};

const checkIntersection = (dataLocal: Record<string, unknown>, selectorsLocal: Record<string, unknown>): void => {
  const intersectionKeys = Object.keys(dataLocal).filter((v) => Object.keys(selectorsLocal).includes(v));
  if (intersectionKeys.length) {
    intersectionKeys.forEach((v) => {
      if (
        !Number.isNaN(dataLocal[v]) &&
        !Number.isNaN(selectorsLocal[v]) &&
        JSON.stringify(dataLocal[v]) !== JSON.stringify(selectorsLocal[v])
      ) {
        throw new Error(`Some keys in data and selectors intersect. It can corrupt data: '${v}'`);
      }
    });
  }
};

export class Test {
  runner!: Runner;

  plugins: Plugins;

  lifeCycleFunctions: TestLifeCycleFunctionType[];

  agent: AgentData = EXTEND_BLANK_AGENT();

  logger: Log;

  agentTree: AgentTree;

  testsStruct: Record<string, TestExtendType>;

  constructor(initValues: TestExtendType) {
    const { testTree, plugins, logger, testsStruct } = new Environment().getEnvInstance(initValues.envsId);
    testTree.createStep({ stepIdParent: initValues.stepIdParent, stepId: initValues.stepId, payload: {} });

    this.plugins = plugins;
    this.agentTree = testTree;
    this.testsStruct = testsStruct;
    this.logger = logger;

    this.plugins.hook('initValues', { inputs: initValues, stepId: initValues.stepId });

    // TODO: Нужна какая то проверка тут initValues
    for (const key of Object.keys(this.agent)) {
      this.agent[key] = initValues[key] ?? this.agent[key];
    }

    const { PPD_LIFE_CYCLE_FUNCTIONS } = new Arguments().args;
    this.lifeCycleFunctions = [
      initValues.atomRun ?? [],
      ...PPD_LIFE_CYCLE_FUNCTIONS.map((v) => (initValues[v] ?? []) as TestLifeCycleFunctionType[]),
    ].flat();
  }

  runLogic = async (inputs: TestExtendType): Promise<{ result: Record<string, unknown> }> => {
    this.plugins.hook('runLogic', { inputs, stepId: inputs.stepId });
    const { timeStartBigInt, timeStart: timeStartDate } = getTimer();

    const {
      PPD_LOG_EXTEND,
      PPD_LOG_AGENT_NAME,
      PPD_TAGS_TO_RUN,
      PPD_LOG_DOCUMENTATION_MODE,
      PPD_LOG_NAMES_ONLY,
      PPD_LOG_TIMER_SHOW,
      PPD_LOG_STEPID,
    } = this.plugins.getPlugins<PluginArgsRedefine>('argsRedefine').getValue(this.agent.stepId, 'argsRedefine');

    const { debug } = this.plugins.getPlugins<PluginDebug>('debug').getValues(this.agent.stepId);

    if (debug) {
      console.log(this);
      // eslint-disable-next-line no-debugger
      debugger;
    }

    const { logShowFlag } = this.plugins
      .getPlugins<PluginLogOptions>('logOptions')
      .getValues(this.agent.stepId).logOptions;

    const { skipMeBecausePrevSublingResults } = this.plugins
      .getPlugins<PluginSkipSublingIfResult>('skipSublingIfResult')
      .getValues(this.agent.stepId);

    if (this.agent.disable || skipMeBecausePrevSublingResults) {
      let disableText = '';
      if (this.agent.disable) {
        disableText = 'disable';
      } else if (skipMeBecausePrevSublingResults) {
        disableText = 'skipMeBecausePrevSublingResults or skipSublingIfResult';
      }

      await this.logger.log({
        text: `Skip with ${disableText}: ${getLogText(this.agent.description, this.agent.name, PPD_LOG_AGENT_NAME)}${
          PPD_LOG_STEPID ? `[${this.agent.stepId}]` : ''
        }`,
        level: 'raw',
        levelIndent: this.agent.levelIndent,
        logOptions: {
          logShowFlag,
          textColor: 'blue',
        },
        logMeta: { breadcrumbs: this.agent.breadcrumbs },
      });
      // Drop disable for loops nested tests
      this.agent.disable = false;
      return { result: {} };
    }

    if (
      PPD_TAGS_TO_RUN.length &&
      this.agent.tags.length &&
      !this.agent.tags.filter((v) => PPD_TAGS_TO_RUN.includes(v)).length
    ) {
      await this.logger.log({
        text: `Skip with tags: ${JSON.stringify(this.agent.tags)} => ${getLogText(
          this.agent.description,
          this.agent.name,
          PPD_LOG_AGENT_NAME,
        )}${PPD_LOG_STEPID ? `[${this.agent.stepId}]` : ''}`,
        level: 'raw',
        levelIndent: this.agent.levelIndent,
        logOptions: {
          logShowFlag,
          textColor: 'blue',
        },
        logMeta: { breadcrumbs: this.agent.breadcrumbs },
      });
      return { result: {} };
    }

    // Get Data from parent test and merge it with current test
    this.agent.stepId = inputs.stepId ?? this.agent.stepId;
    this.agent.description = inputs.description ?? this.agent.description;
    this.agent.descriptionExtend = inputs.descriptionExtend ?? this.agent.descriptionExtend ?? [];
    this.agent.bindDescription = inputs.bindDescription ?? this.agent.bindDescription;
    this.agent.while = inputs.while || this.agent.while;
    this.agent.if = inputs.if || this.agent.if;
    this.agent.errorIf = inputs.errorIf || this.agent.errorIf;
    this.agent.errorIfResult = inputs.errorIfResult || this.agent.errorIfResult;
    this.agent.resultsFromPrevSubling = inputs.resultsFromPrevSubling || this.agent.resultsFromPrevSubling;
    this.agent.dataExt = [...new Set([...this.agent.dataExt, ...(inputs.dataExt || [])])];
    this.agent.selectorsExt = [...new Set([...this.agent.selectorsExt, ...(inputs.selectorsExt || [])])];
    this.agent.repeat = inputs.repeat || this.agent.repeat;

    this.agent.data = resolveAliases<Record<string, string>>('data', inputs);
    this.agent.dataParent = { ...(this.agent.dataParent || {}), ...inputs.dataParent };
    this.agent.bindData = resolveAliases<Record<string, string>>('bindData', inputs);

    this.agent.selectors = resolveAliases<Record<string, string>>('selectors', inputs);
    this.agent.selectorsParent = { ...(this.agent.selectorsParent || {}), ...inputs.selectorsParent };
    this.agent.bindSelectors = resolveAliases<Record<string, string>>('bindSelectors', inputs);

    this.agent.bindResults = resolveAliases<Record<string, string>>('bindResults', inputs);

    const { logOptions } = this.plugins.getPlugins<PluginLogOptions>('logOptions').getValues(this.agent.stepId);
    this.agent.logOptions = logOptions;

    try {
      this.plugins.hook('resolveValues', { inputs, stepId: this.agent.stepId });

      if (this.agent.needEnvParams.length) {
        for (const envParam of this.agent.needEnvParams) {
          if (!envParam.endsWith('?') && !Object.keys(process.env).includes(envParam)) {
            throw new Error(`You need set environment parametr: ${envParam}`);
          }
        }
      }

      checkIntersection(this.agent.data, this.agent.selectors);

      const { allRunners } = new Environment().getEnvInstance(this.agent.envsId);
      const current = new Environment().getCurrent(this.agent.envsId);
      this.runner = allRunners.getRunnerByName(current.name || '');

      let { dataLocal, selectorsLocal } = fetchData(
        this.agent.dataExt,
        this.agent.selectorsExt,
        this.agent.resultsFromPrevSubling,
        this.agent.dataParent,
        this.agent.data,
        this.agent.bindData,
        this.agent.selectorsParent,
        this.agent.selectors,
        this.agent.bindSelectors,
        this.runner,
      );

      checkNeeds(this.agent.needData, dataLocal, this.agent.name);
      checkNeeds(this.agent.needSelectors, selectorsLocal, this.agent.name);

      ({ dataLocal, selectorsLocal } = updateDataWithNeeds(
        this.agent.needData,
        this.agent.needSelectors,
        dataLocal,
        selectorsLocal,
      ));

      checkIntersection(dataLocal, selectorsLocal);

      const allData = { ...selectorsLocal, ...dataLocal };

      this.agent.repeat = parseInt(runScriptInContext(String(this.agent.repeat), allData, '1') as string, 10);
      allData.repeat = this.agent.repeat;
      dataLocal.repeat = this.agent.repeat;
      selectorsLocal.repeat = this.agent.repeat;
      allData.$loop = (inputs.dataParent || {}).repeat || this.agent.repeat;
      dataLocal.$loop = (inputs.dataParent || {}).repeat || this.agent.repeat;
      selectorsLocal.$loop = (inputs.dataParent || {}).repeat || this.agent.repeat;

      const descriptionResolved = this.agent.bindDescription
        ? this.agent.description || String(runScriptInContext(this.agent.bindDescription, allData))
        : this.agent.description;

      if (!descriptionResolved) {
        this.agent.logOptions.backgroundColor = 'red';
      }

      // Extend with data passed to functions
      const pageCurrent = this.runner && this.runner.getState()?.pages?.[current?.page];

      // IF
      if (this.agent.if) {
        const skipIf = await checkIf(
          this.agent.if,
          'if',
          this.logger.log.bind(this.logger),
          this.plugins,
          this.agent,
          allData,
        );
        if (skipIf) {
          return { result: {} };
        }
      }

      // ERROR IF
      if (this.agent.errorIf) {
        await checkIf(
          this.agent.errorIf,
          'errorIf',
          this.logger.log.bind(this.logger),
          this.plugins,
          this.agent,
          allData,
        );
      }

      // LOG TEST
      if (!PPD_LOG_NAMES_ONLY.length || PPD_LOG_NAMES_ONLY.includes(this.agent.name)) {
        const elements: Element = [];
        if (this.agent.logOptions.screenshot) {
          // Create Atom for get elements only
          const atom = new Atom({ page: pageCurrent, runner: this.runner });
          const selectors = this.agent.needSelectors.map((v) => selectorsLocal[v]) as string[];
          for (const selector of selectors) {
            elements.push(await atom.getElement(selector));
          }
        }

        if (!elements.length) {
          elements.push(null);
        }

        for (const element of elements) {
          await this.logger.log({
            text: `${getLogText(descriptionResolved, this.agent.name, PPD_LOG_AGENT_NAME)}${
              PPD_LOG_STEPID ? ` [${this.agent.stepId}]` : ''
            }`,
            level: 'test',
            levelIndent: this.agent.levelIndent,
            element,
            stepId: this.agent.stepId,
            logOptions: { ...this.agent.logOptions, logShowFlag },
            logMeta: { repeat: this.agent.repeat, breadcrumbs: this.agent.breadcrumbs },
          });
        }

        if (PPD_LOG_DOCUMENTATION_MODE) {
          for (let step = 0; step < this.agent.descriptionExtend.length; step += 1) {
            await this.logger.log({
              text: `${step + 1}. => ${getLogText(this.agent.descriptionExtend[step])}`,
              level: 'test',
              levelIndent: this.agent.levelIndent + 1,
              stepId: this.agent.stepId,
              logOptions: {
                logShowFlag,
                textColor: 'cyan' as ColorsType,
              },
              logMeta: { repeat: this.agent.repeat, breadcrumbs: this.agent.breadcrumbs },
            });
          }
        }
      }

      // todo: перенести логику в хук
      if (this.agent.debugInfo) {
        logDebug(this.logger.log.bind(this.logger), { data: dataLocal, selectors: selectorsLocal });
        if (this.agent.debug) {
          console.log(this);
          // eslint-disable-next-line no-debugger
          debugger;
        }
      }

      this.plugins.hook('beforeFunctions', { stepId: this.agent.stepId });

      const { options } = this.plugins.getPlugins<PluginOptions>('options').getValues(this.agent.stepId);
      this.agent.options = options;

      const args: TestArgsType = {
        agent: this.agent,
        options: this.agent.options,
        logOptions: this.agent.logOptions,
        environment: new Environment(),
        runner: this.runner,
        allRunners,
        data: dataLocal,
        selectors: selectorsLocal,
        browser: this.runner && this.runner.getState().browser,
        page: pageCurrent, // If there is no page it`s might be API
        allData: new AgentContent().allData,
        log: this.logger.log.bind(this.logger),
        plugins: this.plugins,
      };

      // LIFE CYCLE
      let resultFromLifeCycle = {};

      for (const funcs of this.lifeCycleFunctions) {
        const funcsArray = [funcs].flat();
        for (const func of funcsArray) {
          const funResult = (await func(args)) || {};
          resultFromLifeCycle = { ...resultFromLifeCycle, ...funResult };
        }
      }

      // RESULTS
      const results = this.agent.allowResults.length
        ? pick(resultFromLifeCycle, this.agent.allowResults)
        : resultFromLifeCycle;
      if (
        this.agent.allowResults.length &&
        Object.keys(results).length &&
        Object.keys(results).length !== [...new Set(this.agent.allowResults)].length
      ) {
        throw new Error('Can`t get results from test');
      }
      const allowResultsObject = this.agent.allowResults.reduce((collect, v) => ({ ...collect, ...{ [v]: v } }), {});
      let localResults = resolveDataFunctions(
        { ...this.agent.bindResults, ...allowResultsObject },
        { ...selectorsLocal, ...dataLocal, ...results },
      );

      this.plugins.hook('afterResults', { inputs: localResults, stepId: this.agent.stepId });

      // ERROR
      if (this.agent.errorIfResult) {
        await checkIf(
          this.agent.errorIfResult,
          'errorIfResult',
          this.logger.log.bind(this.logger),
          this.plugins,
          this.agent,
          { ...allData, ...localResults },
        );
      }

      // WHILE
      if (this.agent.while) {
        const whileEval = runScriptInContext(this.agent.while, { ...allData, ...localResults });
        if (whileEval) {
          this.agent.repeat += 1;
        }
      }

      // TIMER IN CONSOLE
      const { timeStart, timeEnd, deltaStr } = getTimer({ timeStartBigInt, timeStart: timeStartDate });
      await this.logger.log({
        text: `🕝: ${deltaStr} (${this.agent.name})${PPD_LOG_STEPID ? ` [${this.agent.stepId}]` : ''}`,
        level: 'timer',
        levelIndent: this.agent.levelIndent,
        stepId: this.agent.stepId,
        logOptions: {
          logShowFlag:
            logShowFlag &&
            (PPD_LOG_EXTEND || PPD_LOG_TIMER_SHOW) &&
            (!PPD_LOG_NAMES_ONLY.length || PPD_LOG_NAMES_ONLY.includes(this.agent.name)),
        },
        logMeta: {
          extendInfo: true,
          breadcrumbs: this.agent.breadcrumbs,
          repeat: this.agent.repeat,
          timeStart,
          timeEnd,
        },
      });

      // REPEAT
      if (this.agent.repeat > 1) {
        const repeatArgs = { ...inputs };
        repeatArgs.selectors = { ...repeatArgs.selectors, ...localResults };
        repeatArgs.data = { ...repeatArgs.data, ...localResults };
        repeatArgs.repeat = this.agent.repeat - 1;
        repeatArgs.stepId = `${inputs.stepId}-repeat-${repeatArgs.repeat}`;
        const repeatResult = await this.run(repeatArgs);
        localResults = { ...localResults, ...repeatResult };
      }

      if (this.agent.breakParentIfResult) {
        const breakParentIfResult = runScriptInContext(this.agent.breakParentIfResult, {
          ...allData,
          ...localResults,
        });
        if (breakParentIfResult) {
          throw new ContinueParentError({
            localResults,
            errorLevel: 1,
            logger: this.logger,
            test: this,
            agent: this.agent,
          });
        }
      }

      this.plugins.hook('afterRepeat', { inputs: { ...allData, ...localResults }, stepId: this.agent.stepId });

      return { result: localResults };
    } catch (error) {
      const { continueOnError } = this.plugins
        .getPlugins<PluginContinueOnError>('continueOnError')
        .getValues(this.agent.stepId);

      if (error instanceof ContinueParentError) {
        if (error.errorLevel) {
          await error.log();
          error.errorLevel -= 1;
          throw error;
        }
        return { result: error.localResults };
      }

      if (continueOnError) {
        const continueError = new ContinueParentError({
          localResults: error.localResults || {},
          errorLevel: 0,
          logger: this.logger,
          test: this,
          parentError: error,
          agent: this.agent,
        });
        await continueError.log();
        return { result: error.localResults };
      }

      const newError = new TestError({
        logger: this.logger,
        parentError: error,
        agent: this.agent,
        plugins: this.plugins,
      });
      await newError.log();
      throw newError;
    }
  };

  run = async (inputArgs: TestExtendType): Promise<{ result: Record<string, unknown> }> => {
    const { testTree } = new Environment().getEnvInstance(inputArgs.envsId);
    testTree.createStep({ stepIdParent: inputArgs.stepIdParent, stepId: inputArgs.stepId, payload: {} });

    const blocker = new Blocker();
    const block = blocker.getBlock(this.agent.stepId);
    const { blockEmitter } = blocker;
    if (block && blockEmitter) {
      // Test
      // setTimeout(() => {
      //   blocker.setBlock(this.stepId, false);
      // }, 2000);
      return new Promise((resolve) => {
        blockEmitter.on('updateBlock', async (newBlock) => {
          if (newBlock.stepId === this.agent.stepId && !newBlock.block) {
            resolve(await this.runLogic(inputArgs));
          }
        });
      });
    }
    return this.runLogic(inputArgs);
  };
}

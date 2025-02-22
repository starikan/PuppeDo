import vm from 'vm';
import { blankSocket, getTimer, pick, generateId, mergeObjects } from './Helpers';
import Blocker from './Blocker';
import { Arguments } from './Arguments';
import { Environment, Runner } from './Environment';
import AgentContent from './TestContent';
import { ContinueParentError, TestError } from './Error';
import { logDebug } from './Loggers/CustomLogEntries';
import {
  LogOptionsType,
  ColorsType,
  TestArgsType,
  LogFunctionType,
  TestLifeCycleFunctionType,
  TestExtendType,
  TestMetaSublingExchangeData,
  Element,
  AliasesKeysType,
  DeepMergeable,
  AgentData,
} from './global.d';
import Atom from './AtomCore';
import { Plugins } from './PluginsCore';
import { PluginContinueOnError, PluginSkipSublingIfResult, PluginArgsRedefine } from './Plugins';
import globalExportPPD from './index';

/**
 * Resolves aliases for a given key in the inputs object.
 *
 * @param alias The alias key to resolve.
 * @param inputs The inputs object to search for alias values.
 * @returns The resolved alias value.
 */
export const resolveAliases = <T extends DeepMergeable = DeepMergeable>(
  alias: AliasesKeysType,
  inputs: TestExtendType,
): T => {
  const { PPD_ALIASES } = new Arguments().args;
  const allValues = [...Object.keys(PPD_ALIASES), ...Object.values(PPD_ALIASES)].flat();
  const duplicateValues = allValues.filter((value, index) => allValues.indexOf(value) !== index);

  if (duplicateValues.length) {
    throw new Error(`PPD_ALIASES contains duplicate keys: ${duplicateValues.join(', ')}`);
  }

  const variants = [...(PPD_ALIASES[alias] ?? []), alias];
  const values = (Object.values(pick(inputs, variants)) as T[]).map((v) => v || ({} as T));
  const result = values.length ? mergeObjects<T>(values) : [];
  return result as T;
};

export const runScriptInContext = (
  source: string,
  context: Record<string, unknown>,
  defaultValue: unknown = null,
): unknown => {
  let result: unknown;

  if (source === '{}') {
    return {};
  }

  try {
    const script = new vm.Script(source);
    vm.createContext(context);
    result = script.runInContext(context);
  } catch (error) {
    if (defaultValue !== null && defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Can't evaluate ${source} = '${error.message}'`);
  }

  return result;
};

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

// TODO: 2021-12-07 S.Starodubov move to class and improve with ${getLogText(text, this.name, PPD_LOG_TEST_NAME)}
export const checkIf = async (
  expr: string,
  ifType: 'if' | 'errorIf' | 'errorIfResult',
  log: LogFunctionType,
  levelIndent = 0,
  allData: Record<string, unknown> = {},
  logShowFlag = true,
  continueOnError = false,
  breadcrumbs = [],
  textAddition = '',
): Promise<boolean> => {
  const exprResult = runScriptInContext(expr, allData);

  if (!exprResult && ifType === 'if') {
    if (logShowFlag && !continueOnError) {
      await log({
        text: `Skip with IF expr '${expr}' === '${exprResult}'${textAddition}`,
        level: 'info',
        levelIndent,
        logOptions: {
          screenshot: false,
          fullpage: false,
        },
        logMeta: { breadcrumbs },
      });
    }
    return true;
  }

  if (exprResult && ifType !== 'if') {
    if (!continueOnError) {
      await log({
        text: `Test stopped with expr ${ifType} = '${expr}'`,
        level: 'error',
        levelIndent,
        logOptions: {
          screenshot: true,
          fullpage: true,
        },
        logMeta: { breadcrumbs },
      });
    }
    throw new Error(`Test stopped with expr ${ifType} = '${expr}'`);
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

const resolveLogOptions = (
  logOptionsParent: LogOptionsType,
  logOptions: LogOptionsType,
): { logShowFlag: boolean; logForChild: LogOptionsType } => {
  const { PPD_LOG_IGNORE_HIDE_LOG } = new Arguments().args;
  const { logChildren: logChildrenParent = true } = logOptionsParent;

  const logForChild: LogOptionsType = {
    ...{ logChildren: logChildrenParent },
    ...{ logThis: logChildrenParent },
    textColor: 'sane' as ColorsType,
    backgroundColor: 'sane' as ColorsType,
    ...logOptions,
  };

  let logShowFlag = true;

  if (logChildrenParent === false) {
    logShowFlag = false;
  }

  if (typeof logOptions.logThis === 'boolean') {
    logShowFlag = logOptions.logThis;
  }

  if (PPD_LOG_IGNORE_HIDE_LOG) {
    logForChild.logThis = true;
    logForChild.logChildren = true;
    logShowFlag = true;
  }

  return { logShowFlag, logForChild };
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

const getLogText = (text: string, nameTest = '', PPD_LOG_TEST_NAME = false): string => {
  const nameTestResolved = nameTest && (PPD_LOG_TEST_NAME || !text) ? `(${nameTest}) ` : '';
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

const resolveDisable = (thisDisable: boolean, metaFromPrevSubling: TestMetaSublingExchangeData): string => {
  if (thisDisable) {
    return 'disable';
  }
  if (metaFromPrevSubling.skipBecausePrevSubling) {
    return 'skipSublingIfResult';
  }
  return '';
};

export class Test {
  dataParent!: Record<string, unknown>;
  selectorsParent!: Record<string, unknown>;
  options: Record<string, string | number>;
  debug: boolean;
  debugInfo: boolean | 'data' | 'selectors';
  disable: boolean;
  logOptions: LogOptionsType;
  data: Record<string, unknown>;
  bindData!: Record<string, string>;
  selectors: Record<string, unknown>;
  bindSelectors!: Record<string, string>;
  bindResults!: Record<string, string>;
  metaFromPrevSubling!: TestMetaSublingExchangeData;

  runner!: Runner;

  runLogic: (inputs: TestExtendType) => Promise<{ result: Record<string, unknown>; meta: Record<string, unknown> }>;
  run: (inputArgs: TestExtendType) => Promise<{ result: Record<string, unknown>; meta: Record<string, unknown> }>;

  plugins: Plugins;

  lifeCycleFunctions: TestLifeCycleFunctionType[];

  // TODO BLANK_TEST разбивлять тут
  agent: AgentData = {
    name: '',
    type: 'agent',
    envsId: '',
    stepId: '',
    needData: [],
    needSelectors: [],
    needEnvParams: [],
    engineSupports: [],
    description: '',
    descriptionExtend: [],
    bindDescription: '',
    breadcrumbs: [],
    breadcrumbsDescriptions: [],
    while: '',
    if: '',
    errorIf: '',
    errorIfResult: '',
    frame: '',
    resultsFromPrevSubling: {},
    tags: [],
    allowOptions: [],
    todo: '',
    inlineJS: '',
    breakParentIfResult: '',
    source: '',
    socket: blankSocket,
    funcFile: '',
    testFile: '',
    dataExt: [],
    selectorsExt: [],
    allowResults: [],
    levelIndent: 0,
    repeat: 1,
  };

  constructor(initValues: TestExtendType) {
    this.plugins = new Plugins(this);
    this.plugins.hook('initValues', { initValues });

    // TODO: Нужна какая то проверка тут initValues

    for (const key of Object.keys(this.agent)) {
      this.agent[key] = initValues[key] ?? this.agent[key];
    }

    this.data = initValues.data ?? {};
    this.selectors = initValues.selectors ?? {};
    this.options = initValues.options ?? {};
    this.debug = initValues.debug ?? false;
    this.debugInfo = initValues.debugInfo ?? false;
    this.disable = initValues.disable ?? false;
    this.logOptions = initValues.logOptions ?? {};

    const { PPD_LIFE_CYCLE_FUNCTIONS } = new Arguments().args;
    this.lifeCycleFunctions = [
      initValues.atomRun ?? [],
      ...PPD_LIFE_CYCLE_FUNCTIONS.map((v) => (initValues[v] ?? []) as TestLifeCycleFunctionType[]),
    ].flat();

    this.runLogic = async (
      inputs: TestExtendType,
    ): Promise<{ result: Record<string, unknown>; meta: Record<string, unknown> }> => {
      this.plugins.hook('runLogic', { inputs });
      const { timeStartBigInt, timeStart: timeStartDate } = getTimer();

      const { allRunners, logger } = new Environment().getEnvInstance(this.agent.envsId);
      const current = new Environment().getCurrent(this.agent.envsId);

      this.runner = allRunners.getRunnerByName(current.name || '');

      const { logShowFlag, logForChild } = resolveLogOptions(inputs.logOptionsParent || {}, this.logOptions);

      const { argsRedefine } = this.plugins.getValue<PluginArgsRedefine>('argsRedefine');
      const {
        PPD_DEBUG_MODE,
        PPD_LOG_EXTEND,
        PPD_LOG_TEST_NAME,
        PPD_TAGS_TO_RUN,
        PPD_LOG_DOCUMENTATION_MODE,
        PPD_LOG_NAMES_ONLY,
        PPD_LOG_TIMER_SHOW,
        PPD_LOG_STEPID,
      } = { ...new Arguments().args, ...argsRedefine };

      this.debug = PPD_DEBUG_MODE && (inputs.debug || this.debug);
      if (this.debug) {
        console.log(this);
        // eslint-disable-next-line no-debugger
        debugger;
      }

      this.metaFromPrevSubling = inputs.metaFromPrevSubling || {};
      const disable = resolveDisable(this.disable, this.metaFromPrevSubling);

      if (disable) {
        await logger.log({
          text: `Skip with ${disable}: ${getLogText(this.agent.description, this.agent.name, PPD_LOG_TEST_NAME)}${
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
        this.disable = false;
        return {
          result: {},
          meta: {
            skipBecausePrevSubling: this.metaFromPrevSubling.skipBecausePrevSubling,
            disable: Boolean(disable),
          },
        };
      }

      if (
        PPD_TAGS_TO_RUN.length &&
        this.agent.tags.length &&
        !this.agent.tags.filter((v) => PPD_TAGS_TO_RUN.includes(v)).length
      ) {
        await logger.log({
          text: `Skip with tags: ${JSON.stringify(this.agent.tags)} => ${getLogText(
            this.agent.description,
            this.agent.name,
            PPD_LOG_TEST_NAME,
          )}${PPD_LOG_STEPID ? `[${this.agent.stepId}]` : ''}`,
          level: 'raw',
          levelIndent: this.agent.levelIndent,
          logOptions: {
            logShowFlag,
            textColor: 'blue',
          },
          logMeta: { breadcrumbs: this.agent.breadcrumbs },
        });
        return { result: {}, meta: {} };
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
      this.agent.frame = inputs.frame || this.agent.frame;
      this.agent.resultsFromPrevSubling = inputs.resultsFromPrevSubling || this.agent.resultsFromPrevSubling;
      this.agent.dataExt = [...new Set([...this.agent.dataExt, ...(inputs.dataExt || [])])];
      this.agent.selectorsExt = [...new Set([...this.agent.selectorsExt, ...(inputs.selectorsExt || [])])];
      this.agent.repeat = inputs.repeat || this.agent.repeat;

      this.data = resolveAliases<Record<string, string>>('data', inputs);
      this.dataParent = { ...(this.dataParent || {}), ...inputs.dataParent };
      this.bindData = resolveAliases<Record<string, string>>('bindData', inputs);

      this.selectors = resolveAliases<Record<string, string>>('selectors', inputs);
      this.selectorsParent = { ...(this.selectorsParent || {}), ...inputs.selectorsParent };
      this.bindSelectors = resolveAliases<Record<string, string>>('bindSelectors', inputs);

      this.bindResults = resolveAliases<Record<string, string>>('bindResults', inputs);

      this.options = {
        ...this.options,
        ...resolveAliases<Record<string, string>>('options', inputs),
        ...inputs.optionsParent,
      } as Record<string, string | number>;

      this.logOptions = logForChild;

      try {
        this.plugins.hook('resolveValues', { inputs });

        if (this.agent.engineSupports.length) {
          const { engine } = this.runner.getRunnerData().browser || {};
          if (engine && !this.agent.engineSupports.includes(engine)) {
            throw new Error(`Current engine: '${engine}' not supported in this test`);
          }
        }

        if (this.agent.needEnvParams.length) {
          for (const envParam of this.agent.needEnvParams) {
            if (!envParam.endsWith('?') && !Object.keys(process.env).includes(envParam)) {
              throw new Error(`You need set environment parametr: ${envParam}`);
            }
          }
        }

        checkIntersection(this.data, this.selectors);

        let { dataLocal, selectorsLocal } = fetchData(
          this.agent.dataExt,
          this.agent.selectorsExt,
          this.agent.resultsFromPrevSubling,
          this.dataParent,
          this.data,
          this.bindData,
          this.selectorsParent,
          this.selectors,
          this.bindSelectors,
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
          this.logOptions.backgroundColor = 'red';
        }

        // Extend with data passed to functions
        const pageCurrent = this.runner && this.runner.getState()?.pages?.[current?.page];

        // TODO: заменить Partial<TestExtendType> на строгий тип TestExtendType прямо в TestArgsType
        const args: TestArgsType & AgentData = {
          environment: new Environment(),
          runner: this.runner,
          allRunners,
          data: dataLocal,
          selectors: selectorsLocal,
          dataTest: this.data,
          selectorsTest: this.selectors,
          options: this.options,
          bindResults: this.bindResults,
          bindSelectors: this.bindSelectors,
          bindData: this.bindData,
          debug: this.debug,
          disable: this.disable,
          logOptions: logForChild,
          ppd: globalExportPPD,
          argsEnv: { ...new Arguments().args, ...argsRedefine },
          browser: this.runner && this.runner.getState().browser,
          page: pageCurrent, // If there is no page it`s might be API
          log: logger.log.bind(logger),
          allData: new AgentContent().allData,
          plugins: this.plugins,
          // TODO: 2022-10-06 S.Starodubov Это тут не нужно
          continueOnError: this.plugins.getValue<PluginContinueOnError>('continueOnError').continueOnError,
          ...this.agent,
        };

        // IF
        if (this.agent.if) {
          const skipIf = await checkIf(
            this.agent.if,
            'if',
            logger.log.bind(logger),
            this.agent.levelIndent,
            allData,
            logShowFlag,
            this.plugins.getValue<PluginContinueOnError>('continueOnError').continueOnError,
            this.agent.breadcrumbs,
            PPD_LOG_STEPID ? ` [${this.agent.stepId}]` : '',
          );
          if (skipIf) {
            return { result: {}, meta: {} };
          }
        }

        // ERROR IF
        if (this.agent.errorIf) {
          await checkIf(
            this.agent.errorIf,
            'errorIf',
            logger.log.bind(logger),
            this.agent.levelIndent,
            allData,
            logShowFlag,
            this.plugins.getValue<PluginContinueOnError>('continueOnError').continueOnError,
            this.agent.breadcrumbs,
            PPD_LOG_STEPID ? ` [${this.agent.stepId}]` : '',
          );
        }

        // LOG TEST
        if (!PPD_LOG_NAMES_ONLY.length || PPD_LOG_NAMES_ONLY.includes(this.agent.name)) {
          const elements: Element = [];
          if (this.logOptions.screenshot) {
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
            await logger.log({
              text: `${getLogText(descriptionResolved, this.agent.name, PPD_LOG_TEST_NAME)}${
                PPD_LOG_STEPID ? ` [${this.agent.stepId}]` : ''
              }`,
              level: 'test',
              levelIndent: this.agent.levelIndent,
              element,
              stepId: this.agent.stepId,
              logOptions: { ...this.logOptions, logShowFlag },
              logMeta: { repeat: this.agent.repeat, breadcrumbs: this.agent.breadcrumbs },
              args,
            });
          }

          if (PPD_LOG_DOCUMENTATION_MODE) {
            for (let step = 0; step < this.agent.descriptionExtend.length; step += 1) {
              await logger.log({
                text: `${step + 1}. => ${getLogText(this.agent.descriptionExtend[step])}`,
                level: 'test',
                levelIndent: this.agent.levelIndent + 1,
                stepId: this.agent.stepId,
                logOptions: {
                  logShowFlag,
                  textColor: 'cyan' as ColorsType,
                },
                logMeta: { repeat: this.agent.repeat, breadcrumbs: this.agent.breadcrumbs },
                args,
              });
            }
          }
        }

        if (this.debugInfo) {
          logDebug(logger.log.bind(logger), args);
          if (this.debug) {
            console.log(this);
            // eslint-disable-next-line no-debugger
            debugger;
          }
        }

        this.plugins.hook('beforeFunctions', { args });

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
          { ...this.bindResults, ...allowResultsObject },
          { ...selectorsLocal, ...dataLocal, ...results },
        );

        this.plugins.hook('afterResults', { args, results: localResults });

        // ERROR
        if (this.agent.errorIfResult) {
          await checkIf(
            this.agent.errorIfResult,
            'errorIfResult',
            logger.log.bind(logger),
            this.agent.levelIndent + 1,
            { ...allData, ...localResults },
            logShowFlag,
            this.plugins.getValue<PluginContinueOnError>('continueOnError').continueOnError,
            this.agent.breadcrumbs,
            PPD_LOG_STEPID ? ` [${this.agent.stepId}]` : '',
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
        await logger.log({
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
          repeatArgs.stepId = generateId();
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
              logger,
              test: this,
              agent: this.agent,
            });
          }
        }

        const metaForNextSubling: TestMetaSublingExchangeData = {};
        const { skipSublingIfResult } = this.plugins.getValue<PluginSkipSublingIfResult>('skipSublingIfResult');
        if (skipSublingIfResult) {
          const skipSublingIfResultResolved = runScriptInContext(skipSublingIfResult, {
            ...allData,
            ...localResults,
          });
          if (skipSublingIfResultResolved) {
            metaForNextSubling.disable = true;
            metaForNextSubling.skipBecausePrevSubling = true;
          }
        }

        return { result: localResults, meta: metaForNextSubling };
      } catch (error) {
        if (error instanceof ContinueParentError) {
          if (error.errorLevel) {
            await error.log();
            error.errorLevel -= 1;
            throw error;
          }
          return { result: error.localResults, meta: {} };
        }

        let newError;
        if (this.plugins.getValue<PluginContinueOnError>('continueOnError').continueOnError) {
          newError = new ContinueParentError({
            localResults: error.localResults || {},
            errorLevel: 0,
            logger,
            test: this,
            parentError: error,
            agent: this.agent,
          });
        } else {
          // TODO: избавиться от test тут
          newError = new TestError({ logger, parentError: error, test: this, agent: this.agent });
        }
        await newError.log();
        throw newError;
      }
    };

    this.run = async (
      inputArgs: TestExtendType,
    ): Promise<{ result: Record<string, unknown>; meta: Record<string, unknown> }> => {
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
}

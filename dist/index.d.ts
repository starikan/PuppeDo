import type { Browser } from 'playwright';
import type { Browser as Browser_2 } from 'puppeteer';
import { EventEmitter } from 'events';
import type { Frame } from 'puppeteer';
import type { Frame as Frame_2 } from 'playwright';
import type { Page } from 'playwright';
import type { Page as Page_2 } from 'puppeteer';

declare class AgentContent extends Singleton {
    allData: AllDataType;
    constructor(reInit?: boolean);
    static getPaths(): string[];
    static checkDuplicates<T extends TestExtendType | RunnerType | DataType>(agents: Array<T>): Array<T>;
    static readFile: (filePath: string) => Partial<TestTypeYaml>[];
    static fileResolver: (agentContent: Partial<TestTypeYaml>, filePath: string) => Required<TestTypeYaml> | RunnerType | DataType;
    private static mergeContentWithRaw;
    private static normalizeRawEntries;
    getAllData(force?: boolean): AllDataType;
    static resolveRunners(runnersAll: Array<RunnerType>, dataAll: Array<DataType>, selectorsAll: Array<DataType>): Array<RunnerType>;
}

declare type AgentData = Required<TestExtendType> & PliginsFields;

declare class AgentTree {
    private tree;
    private errorRoute;
    getTree(fieldsOnly?: string[]): TreeEntryType[];
    findNode(stepId: string, tree?: TreeEntryType[]): TreeEntryType | null;
    findParent(stepId: string, tree?: TreeEntryType[]): TreeEntryType | null;
    findPreviousSibling(stepId: string, tree?: TreeEntryType[]): TreeEntryType | null;
    createStep({ stepIdParent, stepId, payload }: CreateStepParams): TreeEntryType[];
    updateStep({ stepId, stepIdParent, payload }: CreateStepParams): TreeEntryType[];
    addError({ stepId, payload }: CreateStepParams): TreeEntryType[];
    clearErrors(): void;
    getErrors(): TreeEntryType[];
}

declare type AliasesKeysType = 'data' | 'bindData' | 'selectors' | 'bindSelectors' | 'bindResults' | 'options' | string;

declare type AllDataType = {
    allFiles: string[];
    allContent: Array<TestType | RunnerType | DataType>;
    agents: Array<TestType>;
    runners: Array<RunnerType>;
    data: Array<DataType>;
    selectors: Array<DataType>;
};

declare class Arguments extends Singleton {
    private _args;
    constructor(args?: Partial<ArgumentsType>, argsConfig?: Partial<ArgumentsType>, reInit?: boolean);
    private initializeArgs;
    get args(): ArgumentsType;
}

declare type ArgumentsType = {
    PPD_ROOT: string;
    PPD_ROOT_ADDITIONAL: string[];
    PPD_ROOT_IGNORE: string[];
    PPD_FILES_IGNORE: string[];
    PPD_TESTS: string[];
    PPD_TESTS_RAW: RawTestEntry[];
    PPD_OUTPUT: string;
    PPD_DATA: Record<string, unknown>;
    PPD_SELECTORS: Record<string, unknown>;
    PPD_DEBUG_MODE: boolean;
    PPD_LOG_DISABLED: boolean;
    PPD_LOG_EXTEND: boolean;
    PPD_LOG_LEVEL_NESTED: number;
    PPD_LOG_LEVEL_TYPE_IGNORE: ColorsType[];
    PPD_LOG_SCREENSHOT: boolean;
    PPD_LOG_FULLPAGE: boolean;
    PPD_LOG_AGENT_NAME: boolean;
    PPD_LOG_IGNORE_HIDE_LOG: boolean;
    PPD_TAGS_TO_RUN: string[];
    PPD_LOG_DOCUMENTATION_MODE: boolean;
    PPD_LOG_NAMES_ONLY: string[];
    PPD_LOG_TIMER_SHOW: boolean;
    PPD_LOG_TIMESTAMP_SHOW: boolean;
    PPD_LOG_INDENT_LENGTH: number;
    PPD_LOG_STEPID: boolean;
    PPD_CONTINUE_ON_ERROR_ENABLED: boolean;
    PPD_IGNORE_AGENTS_WITHOUT_NAME: boolean;
    PPD_FILES_EXTENSIONS_AVAILABLE: string[];
    PPD_ALIASES: Record<Partial<AliasesKeysType>, string[]>;
    PPD_LIFE_CYCLE_FUNCTIONS: string[];
};

declare class Atom {
    runner: Runner;
    page: BrowserPageType | BrowserFrame;
    log: LogFunctionType;
    levelIndent: number;
    logOptions: LogOptionsType;
    options: Record<string, string>;
    constructor(init?: AtomInit);
    getEngine(engine: EnginesType | null): boolean | EnginesType;
    getElement(selector: string, allElements?: boolean, elementPatent?: BrowserPageType | BrowserFrame): Promise<Element_2[] | Element_2 | false>;
    atomRun(): Promise<Record<string, unknown>>;
    updateFrame(agent: AgentData): Promise<void>;
    runAtom(args?: TestArgsType): Promise<Record<string, unknown>>;
}

declare type AtomInit = {
    runner?: Runner;
    page?: BrowserPageType | BrowserFrame;
};

declare class Blocker extends Singleton {
    blocks: Array<BlockType>;
    blockEmitter: EventEmitter;
    constructor();
    push(data: BlockType): void;
    reset(): void;
    setAll(blockArray: Array<BlockType>): void;
    setBlock(stepId: string, block: boolean): void;
    getBlock(stepId: string): boolean;
}

declare type BlockType = {
    stepId: string;
    block: boolean;
    breadcrumbs?: string[];
};

declare type BrowserEngineType = 'puppeteer' | 'playwright';

declare type BrowserFrame = Frame | Frame_2;

declare type BrowserNameType = 'chrome' | 'chromium' | 'firefox' | 'webkit';

declare type BrowserPageType = Page | Page_2;

declare type BrowserType = Browser | Browser_2;

declare type BrowserTypeType = 'browser' | 'electron';

declare enum colors {
    sane = 0,
    black = 30,
    red = 31,
    green = 32,
    yellow = 33,
    blue = 34,
    magenta = 35,
    cyan = 36,
    white = 37,
    blackBackground = 40,
    redBackground = 41,
    greenBackground = 42,
    yellowBackground = 43,
    blueBackground = 44,
    magentaBackground = 45,
    cyanBackground = 46,
    whiteBackground = 47,
    raw = 0,
    timer = 0,
    debug = 0,
    info = 36,
    test = 32,
    warn = 33,
    error = 31,
    trace = 36,
    env = 34
}

declare type ColorsType = keyof typeof colors;

declare type CreateStepParams = {
    stepIdParent?: string | null;
    stepId: string;
    payload: Partial<TreeEntryDataType>;
};

declare interface DataType extends DataYamlType {
    testFile: string;
}

declare type DataYamlType = {
    name: string;
    type: 'data' | 'selectors';
    data: Record<string, unknown>;
};

declare const _default: {
    run: typeof run;
    errorHandler: (errorIncome: ErrorType) => Promise<void>;
    FlowStructure: typeof FlowStructure;
    getAgent: ({ agentJsonIncome, envsId, parentStepMetaCollector, }: {
        agentJsonIncome: TestExtendType;
        envsId: string;
        parentStepMetaCollector?: Partial<TestExtendType>;
    }) => TestLifeCycleFunctionType;
    getTest: ({ agentJsonIncome, envsId, parentStepMetaCollector, }: {
        agentJsonIncome: TestExtendType;
        envsId: string;
        parentStepMetaCollector?: Partial<TestExtendType>;
    }) => TestLifeCycleFunctionType;
    AgentContent: typeof AgentContent;
    Environment: typeof Environment;
    Arguments: typeof Arguments;
    Blocker: typeof Blocker;
    Log: typeof Log;
    Singleton: typeof Singleton;
    paintString: (str: string, color?: ColorsType) => string;
    blankSocket: SocketType;
    argsDefault: ArgumentsType;
    runScriptInContext: (source: string, context: Record<string, unknown>, defaultValue?: unknown) => unknown;
    Screenshot: typeof Screenshot;
    Plugin: typeof Plugin_2;
    Plugins: typeof Plugins;
    Atom: typeof Atom;
};
export default _default;

declare type DocumentationLanguages = 'ru' | 'en';

declare type Element_2 = ElementHandleLike | null;

declare type ElementHandleLike = {
    screenshot: (options: {
        path: string;
    }) => Promise<unknown>;
    contentFrame?: () => Promise<BrowserFrame | null>;
};

declare type EnginesType = 'puppeteer' | 'playwright';

declare type EnvBrowserType = {
    type: BrowserTypeType;
    engine: BrowserEngineType;
    browserName: BrowserNameType;
    runtime: 'run' | 'connect';
    executablePath?: string;
    headless: boolean;
    slowMo: number;
    args?: string[];
    urlDevtoolsJson?: string;
    windowSize?: {
        width?: number;
        height?: number;
    };
    killOnEnd?: boolean;
    killProcessName?: string;
    runtimeEnv?: {
        runtimeExecutable?: string;
        program?: string;
        cwd?: string;
        args?: string[];
        env?: Record<string, string>;
        secondsToStartApp?: number;
        secondsDelayAfterStartApp?: number;
    };
    timeout?: number;
};

declare class Environment extends Singleton {
    private instances;
    constructor(reInit?: boolean);
    createEnv(data?: {
        envsId?: string;
        socket?: SocketType;
        loggerOptions?: {
            stdOut?: boolean;
            loggerPipes?: LogPipe[];
        };
    }): EnvsInstanceType;
    private checkId;
    getStruct(envsId: string, name: string): TestExtendType;
    getEnvRunners(envsId: string): Runners;
    getEnvInstance(envsId: string): EnvsInstanceType;
    getLogger(envsId: string): Log;
    getOutput(envsId: string): Outputs;
    getSocket(envsId: string): SocketType;
    getCurrent(envsId: string): Partial<RunnerCurrentType>;
    setCurrent(envsId: string, newData: Partial<RunnerCurrentType>): void;
}

declare type EnvsInstanceType = {
    allRunners: Runners;
    socket: SocketType;
    envsId: string;
    logger: Log;
    log: Array<LogEntry>;
    current: RunnerCurrentType;
    testsStruct: Record<string, TestExtendType>;
    testTree: AgentTree;
    plugins: Plugins;
};

declare interface ErrorType extends Error {
    envsId: string;
    runners: Runner;
    socket: SocketType;
    stepId: string;
    testDescription: string;
    message: string;
    stack: string;
    type: string;
    breadcrumbs: string[];
    breadcrumbsDescriptions: string[];
    test?: Test;
}

declare class FlowStructure {
    static generateFlowDescription(flowJSON: TestExtendType, indentLength?: number): string;
    static getFlowRaw(name: string): Required<TestTypeYaml>;
    static getFlowFullJSON(flowName: string, flowBody?: TestTypeYaml | null, levelIndent?: number, resolved?: boolean): TestExtendType;
}

declare type LifeCycleFunction = Record<string, TestTypeYaml>;

declare class Log {
    private envsId;
    exporter: LogExports;
    output: Outputs;
    constructor(envsId: string);
    static checkLevel(level: ColorsType): boolean;
    static isManualSkipEntry(level: ColorsType, logThis: boolean, logShowFlag: boolean, levelIndent: number): boolean;
    getScreenshots(logOptions: LogOptionsType, level: ColorsType, levelIndent: number, extendInfo: boolean, element: Element_2): Promise<string[]>;
    bulkLog(data: LogInputType[]): Promise<void>;
    runPipes(logEntries: LogEntry[], manualSkipEntry?: boolean): Promise<void>;
    private updateTree;
    log({ text, level, levelIndent, element, error, stepId, logMeta, logOptions, }: LogInputType): Promise<void>;
}

declare type LogEntrieType = {
    text: string;
    textColor: ColorsType;
    backgroundColor: ColorsType;
};

declare type LogEntry = {
    text: string;
    level: ColorsType;
    levelIndent: number;
    time: Date;
    stepId: string;
    screenshots?: string[];
    funcFile?: string;
    testFile?: string;
    extendInfo?: boolean;
    error?: Error | ErrorType | null;
    textColor?: ColorsType;
    backgroundColor?: ColorsType;
    breadcrumbs?: string[];
    repeat?: number;
    logMeta?: LogMetaInfoType;
};

declare type LogExporter = (logEntry: LogEntry, logEntryFormated: LogEntrieType[][], logString: string, options: LogExporterOptions) => Promise<void>;

declare type LogExporterOptions = {
    envsId: string;
    skipThis: boolean;
};

declare class LogExports {
    envsId: string;
    constructor(envsId: string);
    saveToFile(fileName: string, text: string): void;
    appendToFile(fileName: string, text: string): void;
    static resolveOutputHtmlFile(): string;
    static initOutput(envsId: string): Outputs;
}

declare type LogFormatter = (logEntry: LogEntry, logEntryTransformed: Partial<LogEntry>) => Promise<LogEntrieType[][] | string>;

declare type LogFunctionType = (options: LogInputType) => Promise<void>;

declare type LogInputType = {
    text: string | string[];
    level?: ColorsType;
    element?: Element_2;
    levelIndent?: number;
    error?: Error | ErrorType | null;
    stepId?: string;
    page?: Page_2 | Page;
    logMeta?: LogMetaInfoType;
    logOptions?: LogOptionsType;
    args?: TestArgsType;
};

declare type LogMetaInfoType = {
    funcFile?: string;
    testFile?: string;
    extendInfo?: boolean;
    breadcrumbs?: string[];
    repeat?: number;
    timeStart?: Date;
    timeEnd?: Date;
};

declare type LogOptionsType = {
    logThis?: boolean;
    logChildren?: boolean;
    logShowFlag?: boolean;
    screenshot?: boolean;
    fullpage?: boolean;
    screenshotName?: string;
    fullpageName?: string;
    level?: ColorsType;
    textColor?: ColorsType;
    backgroundColor?: ColorsType;
};

declare type LogPipe = {
    transformer: LogTransformer;
    formatter: LogFormatter;
    exporter: LogExporter;
};

declare type LogTransformer = (logEntry: LogEntry) => Promise<Partial<LogEntry> | LogEntry>;

declare type Outputs = {
    output: string;
    name: string;
    folder: string;
    folderFull: string;
    folderLatest: string;
    folderLatestFull: string;
};

declare type PagesType = Record<string, BrowserPageType | BrowserFrame>;

declare type PliginsFields = Partial<PluginSkipSublingIfResult> & Partial<PluginDebug> & Partial<PluginArgsRedefine> & Partial<PluginDescriptionError> & Partial<PluginEngineSupports> & Partial<PluginFrame> & Partial<PluginLogOptions> & Partial<PluginContinueOnError> & Partial<PluginOptions> & Partial<PluginSelectors>;

declare class Plugin_2<T extends Record<keyof T, T[keyof T]>> implements PluginType<T> {
    id: string;
    name: string;
    defaultValues: T;
    plugins: Plugins;
    agentTree: AgentTree;
    hooks: PluginHooks;
    propogation: Partial<PluginPropogations<T>>;
    isActive: ({ inputs, stepId }: {
        inputs: Record<string, unknown>;
        stepId?: string;
    }) => boolean;
    constructor({ name, defaultValues, propogation, plugins, hooks, isActive, }: PluginInitType<T>);
    hook(name: keyof PluginHooks): (unknown: any) => void;
    getValue(stepId: string, value: keyof T): T[keyof T];
    getValuesParent(stepId: string): T;
    getValues(stepId: string): T;
    setValues(stepId: string, inputs?: Partial<T>): T;
}

declare type PluginArgsRedefine = {
    argsRedefine: Partial<ArgumentsType>;
};

declare type PluginContinueOnError = {
    continueOnError: boolean;
};

declare type PluginDebug = {
    debug: boolean;
};

declare type PluginDescriptionError = {
    descriptionError: string;
};

declare type PluginDocumentation = {
    description: {
        en: string[];
    } & Partial<Record<DocumentationLanguages, string[]>>;
    examples: [PluginDocumentationExample, ...PluginDocumentationExample[]];
    name: string;
    type: string;
    propogation: boolean;
};

declare type PluginDocumentationExample = {
    test: string;
    result: string;
};

declare type PluginEngineSupports = {
    engineSupports: BrowserEngineType[];
};

declare type PluginFrame = {
    frame: string;
};

declare type PluginFunction<T> = (plugins: Plugins) => PluginType<T>;

declare type PluginHooks = {
    initValues?: ({ inputs, stepId }: {
        inputs: Record<string, unknown>;
        stepId?: string;
    }) => void;
    runLogic?: ({ inputs, stepId }: {
        inputs: Record<string, unknown>;
        stepId?: string;
    }) => void;
    resolveValues?: ({ inputs, stepId }: {
        inputs: Record<string, unknown>;
        stepId?: string;
    }) => void;
    beforeFunctions?: ({ inputs, stepId }: {
        inputs: Record<string, unknown>;
        stepId?: string;
    }) => void;
    afterResults?: ({ inputs, stepId }: {
        inputs: Record<string, unknown>;
        stepId?: string;
    }) => void;
    afterRepeat?: ({ inputs, stepId }: {
        inputs: Record<string, unknown>;
        stepId?: string;
    }) => void;
};

declare type PluginInitType<T> = {
    name: string;
    defaultValues: T;
    plugins: Plugins;
    hooks: PluginHooks;
    propogation?: Partial<PluginPropogations<T>>;
    isActive?: ({ inputs, stepId }: {
        inputs: Record<string, unknown>;
        stepId?: string;
    }) => boolean;
};

declare type PluginList = Record<string, {
    plugin: PluginModule<unknown> | string;
    order?: number;
}>;

declare type PluginLogOptions = {
    logOptions: LogOptionsType;
};

declare type PluginModule<T> = {
    name: string;
    plugin: PluginFunction<T>;
    documentation: PluginDocumentation;
    depends: string[];
    order?: number;
};

declare type PluginOptions = {
    options: Record<string, string | number>;
    allowOptions: string[];
};

declare type PluginPropogations<T> = Partial<Record<keyof T, PluginPropogationsEntry>>;

declare type PluginPropogationsEntry = {
    type: 'lastParent' | 'lastSubling';
    fieldsOnly?: string[];
    force?: boolean;
};

declare class Plugins {
    private plugins;
    envsId: string;
    agentTree: AgentTree;
    constructor(envsId: string, agentTree: AgentTree);
    hook<T>(name: keyof PluginHooks, args: T): void;
    getPlugins<TPlugin = unknown>(pluginName: string): PluginType<TPlugin>;
}

declare type PluginSelectors = {
    selectors: Record<string, unknown>;
};

declare type PluginSkipSublingIfResult = {
    skipSublingIfResult: string;
    skipMeBecausePrevSublingResults: boolean;
};

declare type PluginType<T> = {
    id: string;
    hook: (name: keyof PluginHooks) => (_: unknown) => void;
    getValue: (stepId: string, value?: keyof T) => T[keyof T];
    getValues: (stepId: string) => T;
    getValuesParent: (stepId: string) => T;
    setValues: (stepId: string, values?: Partial<T>) => T;
    agentTree: AgentTree;
} & Required<PluginInitType<T>>;

declare type RawTestEntry = Partial<TestTypeYaml> | string | Array<Partial<TestTypeYaml> | string>;

declare function run(argsInput?: Partial<ArgumentsType>, optionsInit?: Partial<RunOptions>): Promise<{
    results: Record<string, unknown>;
    logs: Record<string, unknown>;
}>;

declare class Runner {
    private name;
    private state;
    private runnerData;
    constructor(runnerData: RunnerType);
    getRunnerData(): RunnerType;
    getState(): RunnerStateType;
    runEngine(envsId: string): Promise<void>;
    stopEngine(): Promise<void>;
}

declare type RunnerCurrentType = {
    name?: string;
    page?: string;
    test?: string;
};

declare class Runners {
    private runners;
    private envsId;
    constructor(envsId: string);
    switchRunner({ name, runner, page, }: {
        name: string;
        runner: Partial<RunnerYamlType>;
        page: string;
    }): Promise<void>;
    closeRunner(name: string): Promise<void>;
    closeAllRunners(): Promise<void>;
    getActivePage(): BrowserPageType | BrowserFrame;
    getRunnerByName(name: string): Runner;
}

declare type RunnerStateType = {
    browser?: BrowserType;
    browserSettings?: EnvBrowserType;
    pages?: PagesType;
    contexts?: Record<string, unknown>;
    pid?: number;
};

declare interface RunnerType extends RunnerYamlType {
    testFile?: string;
}

declare type RunnerYamlType = {
    name: string;
    type: 'runner';
    browser: EnvBrowserType;
    description?: string;
    data?: Record<string, unknown>;
    selectors?: Record<string, unknown>;
    dataExt?: string[];
    selectorsExt?: string[];
    runnersExt?: string[];
    log?: {
        level?: ColorsType;
        screenshot?: boolean;
        fullpage?: boolean;
    };
};

declare type RunOptions = {
    closeProcess: boolean;
    stdOut: boolean;
    closeAllEnvs: boolean;
    globalConfigFile: string;
    pluginsList: PluginList;
    loggerPipes: LogPipe[];
    argsConfig: Partial<ArgumentsType>;
    socket: SocketType;
    debug: boolean;
};

declare class Screenshot {
    envsId: string;
    constructor(envsId: string);
    static copyScreenshotToFolder(pathScreenshot: string, folder: string, name?: string): Promise<void>;
    copyScreenshotToLatest(pathScreenshot: string): Promise<void>;
    getScreenshotName(nameIncome?: string): string;
    saveScreenshotElement(element: Element_2, name?: string, copyToLatest?: boolean): Promise<string>;
    saveScreenshotFull(nameIncome?: string, copyToLatest?: boolean): Promise<string>;
    getScreenshotsLogEntry(isFullpage: boolean, isScreenshot: boolean, element: Element_2, fullpageName?: string, screenshotName?: string): Promise<string[]>;
}

declare class Singleton {
    constructor();
}

declare type SocketType = {
    send: () => void;
    sendYAML: (data: {
        type: string;
        data: LogEntry | ErrorType;
        envsId: string;
    }) => void;
};

declare class Test {
    runner: Runner;
    plugins: Plugins;
    lifeCycleFunctions: TestLifeCycleFunctionType[];
    agent: AgentData;
    logger: Log;
    agentTree: AgentTree;
    testsStruct: Record<string, TestExtendType>;
    constructor(initValues: TestExtendType);
    runLogic: (inputs: TestExtendType) => Promise<{
        result: Record<string, unknown>;
    }>;
    run: (inputArgs: TestExtendType) => Promise<{
        result: Record<string, unknown>;
    }>;
}

declare type TestArgsType = {
    environment: Environment;
    data: Record<string, unknown>;
    selectors: Record<string, unknown>;
    logOptions: LogOptionsType;
    runner: Runner;
    allRunners: Runners;
    browser?: BrowserType;
    page?: BrowserPageType | BrowserFrame;
    log: LogFunctionType;
    allData: AllDataType;
    plugins: Plugins;
    options: AgentData['options'];
    agent: AgentData;
};

declare type TestExtendType = {
    levelIndent?: number;
    breadcrumbs?: string[];
    breadcrumbsDescriptions?: string[];
    stepIdParent?: string;
    stepId?: string;
    source?: string;
    socket?: SocketType;
    envsId?: string;
    resultsFromPrevSubling?: Record<string, unknown>;
    dataParent?: Record<string, unknown>;
    funcFile?: string;
    testFile?: string;
    atomRun?: TestLifeCycleFunctionType[];
} & Required<TestTypeYaml>;

declare type TestLifeCycleFunctionType = (args?: TestArgsType) => Promise<Record<string, unknown>>;

declare type TestType = Required<TestTypeYaml>;

declare type TestTypeYaml = {
    name: string;
    type?: 'runner' | 'data' | 'selectors' | 'test' | 'atom' | 'agent';
    needData?: string[];
    needSelectors?: string[];
    needEnvParams?: string[];
    dataExt?: string[];
    selectorsExt?: string[];
    allowResults?: string[];
    todo?: string;
    debugInfo?: boolean | 'data' | 'selectors';
    disable?: boolean;
    data?: Record<string, unknown>;
    bindData?: Record<string, string>;
    selectors?: Record<string, unknown>;
    bindSelectors?: Record<string, string>;
    bindResults?: Record<string, string>;
    description?: string;
    descriptionExtend?: string[];
    bindDescription?: string;
    repeat?: number;
    while?: string;
    if?: string;
    errorIf?: string;
    errorIfResult?: string;
    tags?: string[];
    inlineJS?: string;
    breakParentIfResult?: string;
    [key: string]: LifeCycleFunction[] | unknown;
};

declare type TreeEntryDataType = TestExtendType & {
    timeStart: Date;
    timeEnd: Date;
};

declare type TreeEntryType = Partial<TestExtendType> & {
    stepId: string;
    stepIdParent?: string | null;
    steps?: TreeEntryType[];
    timeStart?: Date;
    timeEnd?: Date;
} & Record<string, unknown>;

export { }

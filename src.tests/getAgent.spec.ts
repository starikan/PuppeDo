import requireFromString from 'require-from-string';
import Atom from '../src/AtomCore';
import { Arguments } from '../src/Arguments';
import Blocker from '../src/Blocker';
import { BLANK_AGENT } from '../src/Defaults';
import { Environment } from '../src/Environment';
import getAgent, { propagateArgumentsObjectsOnAir } from '../src/getAgent';
import type { TestExtendType } from '../src/model';
import { Test } from '../src/Test';

jest.mock('require-from-string');
jest.mock('../src/AtomCore');
jest.mock('../src/Arguments');
jest.mock('../src/Blocker');
jest.mock('../src/Environment');
jest.mock('../src/Test');

const mockRequireFromString = requireFromString as jest.MockedFunction<typeof requireFromString>;
const mockAtomClass = Atom as jest.MockedClass<typeof Atom>;
const mockArguments = Arguments as jest.MockedClass<typeof Arguments>;
const mockBlockerClass = Blocker as jest.MockedClass<typeof Blocker>;
const mockEnvironmentClass = Environment as jest.MockedClass<typeof Environment>;
const mockTestClass = Test as jest.MockedClass<typeof Test>;

let mockRun: jest.Mock;
let mockBlockerPush: jest.Mock;
let mockAtomRun: jest.Mock;
let mockGetSocket: jest.Mock;

const createAgent = (overrides: Partial<TestExtendType> = {}): TestExtendType => ({
  ...BLANK_AGENT,
  envsId: '',
  stepId: '',
  breadcrumbs: [],
  breadcrumbsDescriptions: [],
  resultsFromPrevSubling: {},
  source: '',
  funcFile: '',
  testFile: 'D:/tmp/agent.ts',
  levelIndent: 0,
  dataParent: {},
  socket: {} as any,
  ...overrides,
});

describe('getAgent', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockBlockerPush = jest.fn();
    mockBlockerClass.mockImplementation(() => ({ push: mockBlockerPush } as any));

    mockGetSocket = jest.fn().mockReturnValue({ id: 'socket-1' });
    mockEnvironmentClass.mockImplementation(() => ({ getSocket: mockGetSocket } as any));

    mockRun = jest.fn().mockResolvedValue({ result: {} });
    mockTestClass.mockImplementation(() => ({ run: mockRun } as any));

    mockAtomRun = jest.fn();
    mockAtomClass.mockImplementation(() => ({ atomRun: undefined, runAtom: mockAtomRun } as any));

    mockArguments.mockImplementation(
      () =>
        ({
          args: {
            PPD_LIFE_CYCLE_FUNCTIONS: ['beforeRun', 'run', 'afterRun'],
          },
        } as any),
    );

    mockRequireFromString.mockReturnValue(async () => ({}));

    (global as any).__non_webpack_require__ = jest.fn();
  });

  test('resolves inlineJS and propagates args/results', async () => {
    const parentStepMetaCollector: Partial<TestExtendType> = { resultsFromPrevSubling: { prev: 1 } };

    const agentJson = createAgent({
      name: 'inlineAgent',
      inlineJS: 'return { ok: true };',
      data: { fromAgent: 1 },
      stepId: 'step-1',
      breadcrumbs: ['root'],
    });

    mockRun.mockResolvedValue({ result: { next: 2 } });

    const stepFn = getAgent({ agentJsonIncome: agentJson, envsId: 'env-1', parentStepMetaCollector });

    const result = await (stepFn as any)({
      agent: { stepId: 'parent-1' } as any,
      data: { fromArgs: 2 } as any,
    });

    expect(result).toEqual({ next: 2 });
    expect(mockBlockerPush).toHaveBeenCalledWith({ stepId: 'step-1', block: false, breadcrumbs: ['root'] });

    expect(mockTestClass).toHaveBeenCalledTimes(1);
    const agentUsed = mockTestClass.mock.calls[0][0];
    expect(agentUsed.stepIdParent).toBe('parent-1');
    expect(agentUsed.atomRun).toHaveLength(1);
    expect(agentUsed.envsId).toBe('env-1');
    expect(agentUsed.socket).toEqual({ id: 'socket-1' });

    const updatedAgentJson = mockRun.mock.calls[0][0];
    expect(updatedAgentJson.dataParent).toEqual({ fromArgs: 2 });
    expect(updatedAgentJson.resultsFromPrevSubling).toEqual({ prev: 1 });

    expect(parentStepMetaCollector.resultsFromPrevSubling).toEqual({ prev: 1, next: 2 });
  });

  test('skips resolveJS when lifecycle functions already present', async () => {
    const beforeRunFn = jest.fn(async () => ({}));
    const agentJson = createAgent({
      name: 'lifecycleAgent',
      inlineJS: 'return { ok: true };',
      beforeRun: [beforeRunFn],
    });

    const stepFn = getAgent({ agentJsonIncome: agentJson, envsId: 'env-2' });
    await (stepFn as any)({ agent: { stepId: 'parent-2' } as any });

    expect(mockRequireFromString).not.toHaveBeenCalled();
    expect((global as any).__non_webpack_require__).not.toHaveBeenCalled();
  });

  test('throws when lifecycle block is not array', () => {
    const agentJson = createAgent({
      name: 'invalidLifecycle',
      beforeRun: {} as any,
    });

    expect(() => getAgent({ agentJsonIncome: agentJson, envsId: 'env-3' })).toThrow(
      "Block beforeRun must be array. Path: ''",
    );
  });

  test('throws when lifecycle block is not array without breadcrumbs', () => {
    const agentJson = createAgent({
      name: 'invalidLifecycleNoBreadcrumbs',
      beforeRun: {} as any,
      breadcrumbs: undefined,
    });

    expect(() => getAgent({ agentJsonIncome: agentJson, envsId: 'env-3b' })).toThrow(
      "Block beforeRun must be array. Path: ''",
    );
  });

  test('loads atom from js file when inlineJS is missing', async () => {
    (global as any).__non_webpack_require__ = jest
      .fn()
      .mockReturnValue({ fileAtom: async () => ({ file: true }) });

    const agentJson = createAgent({
      name: 'fileAtom',
      inlineJS: '',
      testFile: 'D:/tmp/agent.ts',
    });

    const stepFn = getAgent({ agentJsonIncome: agentJson, envsId: 'env-4' });
    await (stepFn as any)({ agent: { stepId: 'parent-4' } as any });

    expect((global as any).__non_webpack_require__).toHaveBeenCalled();
    expect(mockRequireFromString).not.toHaveBeenCalled();

    const agentUsed = mockTestClass.mock.calls[0][0];
    expect(agentUsed.funcFile?.replace(/\\/g, '/')).toBe('D:/tmp/agent.js');
    expect(agentUsed.atomRun).toHaveLength(1);
  });

  test('returns empty atomRun on non-syntax require error', async () => {
    (global as any).__non_webpack_require__ = jest.fn(() => {
      const error = new Error('Not found');
      error.name = 'NotFoundError';
      throw error;
    });

    const agentJson = createAgent({
      name: 'missingAtom',
      inlineJS: '',
      testFile: 'D:/tmp/missing.ts',
    });

    const stepFn = getAgent({ agentJsonIncome: agentJson, envsId: 'env-5' });
    await (stepFn as any)({ agent: { stepId: 'parent-5' } as any });

    const agentUsed = mockTestClass.mock.calls[0][0];
    expect(agentUsed.atomRun).toEqual([]);
  });

  test('throws SyntaxError for invalid inlineJS', () => {
    mockRequireFromString.mockImplementation(() => {
      const error = new SyntaxError('Bad inlineJS');
      throw error;
    });

    const agentJson = createAgent({
      name: 'badInline',
      inlineJS: 'const =',
    });

    expect(() => getAgent({ agentJsonIncome: agentJson, envsId: 'env-6' })).toThrow(SyntaxError);
  });

  test('maps lifecycle children to functions', async () => {
    mockRequireFromString.mockReturnValue(async () => ({ child: true }));

    const childAgent = createAgent({
      name: 'childAgent',
      inlineJS: 'return { child: true };',
      testFile: 'D:/tmp/child.ts',
    });

    const parentAgent = createAgent({
      name: 'parentAgent',
      beforeRun: [childAgent],
    });

    const stepFn = getAgent({ agentJsonIncome: parentAgent, envsId: 'env-7' });
    await (stepFn as any)({ agent: { stepId: 'parent-7' } as any });

    const agentUsed = mockTestClass.mock.calls[0][0];
    expect(Array.isArray(agentUsed.beforeRun)).toBe(true);
    expect(typeof agentUsed.beforeRun?.[0]).toBe('function');
  });

  test('uses cached atom without повторного require', async () => {
    const requireMock = jest.fn().mockReturnValue({ cachedAtom: async () => ({ cached: true }) });
    (global as any).__non_webpack_require__ = requireMock;

    const agentJson = createAgent({
      name: 'cachedAtom',
      inlineJS: '',
      testFile: 'D:/tmp/cache.ts',
    });

    const stepFn1 = getAgent({ agentJsonIncome: agentJson, envsId: 'env-8' });
    await (stepFn1 as any)({ agent: { stepId: 'parent-8' } as any });

    const stepFn2 = getAgent({ agentJsonIncome: agentJson, envsId: 'env-8' });
    await (stepFn2 as any)({ agent: { stepId: 'parent-8b' } as any });

    expect(requireMock).toHaveBeenCalledTimes(1);
  });

  test('does not set atomRun when resolved value is not a function', async () => {
    (global as any).__non_webpack_require__ = jest.fn().mockReturnValue({});

    const agentJson = createAgent({
      name: 'nonFunctionAtom',
      inlineJS: '',
      testFile: 'D:/tmp/nonfunc.ts',
    });

    const stepFn = getAgent({ agentJsonIncome: agentJson, envsId: 'env-9' });
    await (stepFn as any)({ agent: { stepId: 'parent-9' } as any });

    const agentUsed = mockTestClass.mock.calls[0][0];
    expect(agentUsed.atomRun).toBeUndefined();
  });

  test('handles call without args and default result', async () => {
    mockRun.mockResolvedValue({});

    const parentStepMetaCollector: Partial<TestExtendType> = {};
    const agentJson = createAgent({
      name: 'noArgsAgent',
      inlineJS: 'return { ok: true };',
      data: { fromAgent: 3 },
    });

    const stepFn = getAgent({ agentJsonIncome: agentJson, envsId: 'env-10', parentStepMetaCollector });
    const result = await (stepFn as any)();

    expect(result).toEqual({});
    const updatedAgentJson = mockRun.mock.calls[0][0];
    expect(updatedAgentJson.dataParent).toEqual({ fromAgent: 3 });
    expect(updatedAgentJson.resultsFromPrevSubling).toEqual({});
  });

  test('propagateArgumentsObjectsOnAir uses defaults for list and sources', () => {
    const result = propagateArgumentsObjectsOnAir(undefined as any, undefined);
    expect(result).toEqual({});
  });

  test('propagateArgumentsObjectsOnAir keeps parent data when args missing', () => {
    const source = createAgent({ data: { fromAgent: 4 } });
    const result = propagateArgumentsObjectsOnAir(source, undefined, ['data']);
    expect(result.dataParent).toEqual({ fromAgent: 4 });
  });
});

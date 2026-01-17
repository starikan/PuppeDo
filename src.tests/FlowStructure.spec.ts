import FlowStructure from '../src/FlowStructure';
import { Arguments } from '../src/Arguments';
import AgentContent from '../src/TestContent';
import { resolveTest } from '../src/TestContent';
import { deepMergeField, generateId } from '../src/Helpers';
import { BLANK_AGENT } from '../src/Defaults';
import type { TestExtendType, TestTypeYaml } from '../src/model';

// Mock dependencies
jest.mock('../src/Arguments');
jest.mock('../src/TestContent');
jest.mock('../src/Helpers');

const mockArguments = Arguments as jest.MockedClass<typeof Arguments>;
const mockAgentContent = AgentContent as jest.MockedClass<typeof AgentContent>;
const mockResolveTest = resolveTest as jest.MockedFunction<typeof resolveTest>;
const mockDeepMergeField = deepMergeField as jest.MockedFunction<typeof deepMergeField>;
const mockGenerateId = generateId as jest.MockedFunction<typeof generateId>;

describe('FlowStructure', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mocks
    mockArguments.mockImplementation(
      () =>
        ({
          args: {
            PPD_LIFE_CYCLE_FUNCTIONS: ['beforeRun', 'run', 'afterRun'],
          },
        } as any),
    );

    mockAgentContent.mockImplementation(
      () =>
        ({
          allData: {
            agents: [{ name: 'testAgent', description: 'Test Agent' } as TestTypeYaml],
          },
        } as any),
    );

    mockResolveTest.mockReturnValue({
      ...BLANK_AGENT,
      name: 'resolvedTest',
      description: 'Resolved Test',
    });

    mockDeepMergeField.mockImplementation((base, override) => ({ ...base, ...override }));

    mockGenerateId.mockReturnValue('generatedId');
  });

  describe('generateFlowDescription', () => {
    test('should generate description with all fields', () => {
      const flowJSON: TestExtendType = {
        ...BLANK_AGENT,
        name: 'testName',
        description: 'testDescription',
        todo: 'testTodo',
        levelIndent: 1,
        beforeRun: [],
        run: [],
        afterRun: [],
      };

      const result = FlowStructure.generateFlowDescription(flowJSON);

      expect(result).toContain('TODO: testTodo== testDescription (testName)');
      expect(result).toContain('\n'); // Should have newline
    });

    test('should generate description without optional fields', () => {
      const flowJSON: TestExtendType = {
        ...BLANK_AGENT,
        name: '',
        description: '',
        todo: '',
        levelIndent: 0,
        beforeRun: [],
        run: [],
        afterRun: [],
      };

      const result = FlowStructure.generateFlowDescription(flowJSON);

      expect(result).toBe('\n');
    });

    test('should handle nested blocks', () => {
      const nestedFlow: TestExtendType = {
        ...BLANK_AGENT,
        name: 'nested',
        description: 'nested desc',
        levelIndent: 0,
        beforeRun: [],
        run: [],
        afterRun: [],
      };

      const flowJSON: TestExtendType = {
        ...BLANK_AGENT,
        name: 'parent',
        description: 'parent desc',
        levelIndent: 0,
        beforeRun: [nestedFlow],
        run: [],
        afterRun: [],
      };

      const result = FlowStructure.generateFlowDescription(flowJSON);

      expect(result).toContain('parent desc (parent)');
      expect(result).toContain('nested desc (nested)');
    });

    test('should filter out functions', () => {
      const flowJSON: TestExtendType = {
        ...BLANK_AGENT,
        name: 'test',
        description: 'desc',
        levelIndent: 0,
        beforeRun: [(() => {}) as any, { ...BLANK_AGENT, name: 'valid' }],
        run: [],
        afterRun: [],
      };

      const result = FlowStructure.generateFlowDescription(flowJSON);

      expect(result).toContain('desc (test)');
      // Should not include the function
    });

    test('should use custom indentLength', () => {
      const flowJSON: TestExtendType = {
        ...BLANK_AGENT,
        name: 'test',
        description: 'desc',
        levelIndent: 1,
        beforeRun: [],
        run: [],
        afterRun: [],
      };

      const result = FlowStructure.generateFlowDescription(flowJSON, 2);

      expect(result).toContain('  '); // 1 * 2 spaces
    });
  });

  describe('getFlowRaw', () => {
    test('should return agent from allData if found', () => {
      const result = FlowStructure.getFlowRaw('testAgent');

      expect(mockAgentContent).toHaveBeenCalled();
      expect(result).toEqual({ name: 'testAgent', description: 'Test Agent' });
    });

    test('should resolve test if agent not found', () => {
      const result = FlowStructure.getFlowRaw('unknownAgent');

      expect(mockResolveTest).toHaveBeenCalledWith({ name: 'unknownAgent' });
      expect(result).toEqual({
        ...BLANK_AGENT,
        name: 'resolvedTest',
        description: 'Resolved Test',
      });
    });
  });

  describe('getFlowFullJSON', () => {
    test('should build full JSON with resolved true', () => {
      const flowName = 'testFlow';
      const flowBody: TestTypeYaml = { ...BLANK_AGENT, name: 'testFlow', description: 'body desc' };

      const result = FlowStructure.getFlowFullJSON(flowName, flowBody, 0, true);

      expect(mockDeepMergeField).toHaveBeenCalledWith(
        { ...BLANK_AGENT, name: 'resolvedTest', description: 'Resolved Test' },
        flowBody,
        ['logOptions'],
      );
      expect(result.breadcrumbs).toEqual(['testFlow']);
      expect(result.breadcrumbsDescriptions).toEqual([]);
      expect(result.levelIndent).toBe(0);
      expect(result.stepId).toBe('generatedId');
      expect(result.source).toBeDefined();
      expect(result.source).toContain('"name": "testFlow"');
      expect(() => JSON.parse(result.source)).not.toThrow();
    });

    test('should build full JSON with resolved false', () => {
      const flowName = 'testFlow';
      const flowBody: TestTypeYaml = { ...BLANK_AGENT, name: 'testFlow', description: 'body desc' };

      const result = FlowStructure.getFlowFullJSON(flowName, flowBody, 1, false);

      expect(result).toEqual({
        ...flowBody,
        ...{ ...BLANK_AGENT, name: 'resolvedTest', description: 'Resolved Test' },
        breadcrumbs: ['testFlow'],
        breadcrumbsDescriptions: [],
        levelIndent: 1,
        stepId: 'generatedId',
        source: expect.any(String),
      });
    });

    test('should handle null flowBody', () => {
      const result = FlowStructure.getFlowFullJSON('testFlow', null, 0, true);

      expect(mockDeepMergeField).toHaveBeenCalledWith(
        { ...BLANK_AGENT, name: 'resolvedTest', description: 'Resolved Test' },
        {},
        ['logOptions'],
      );
    });

    test('should preserve existing stepId', () => {
      const flowBody: TestTypeYaml = { ...BLANK_AGENT, name: 'testFlow', stepId: 'existingId' };

      const result = FlowStructure.getFlowFullJSON('testFlow', flowBody, 0, true);

      expect(result.stepId).toBe('existingId');
      expect(mockGenerateId).not.toHaveBeenCalled();
    });

    test('should generate stepId when not provided', () => {
      const flowBody: TestTypeYaml = { ...BLANK_AGENT, name: 'testFlow' };

      const result = FlowStructure.getFlowFullJSON('testFlow', flowBody, 0, true);

      expect(result.stepId).toBe('generatedId');
      expect(mockGenerateId).toHaveBeenCalled();
    });

    test('should process life cycle functions', () => {
      const flowBody: TestTypeYaml = {
        ...BLANK_AGENT,
        name: 'testFlow',
        description: 'test description',
        beforeRun: [{ agent1: { ...BLANK_AGENT, name: 'agent1' } }],
        run: [],
        afterRun: [],
      };

      mockResolveTest.mockReturnValueOnce({
        ...BLANK_AGENT,
        name: 'testFlow',
        beforeRun: [],
        run: [],
        afterRun: [],
      });

      const result = FlowStructure.getFlowFullJSON('testFlow', flowBody, 0, true);

      expect(result.beforeRun).toBeDefined();
      expect(result.beforeRun[0].breadcrumbsDescriptions).toEqual(['test description']);
      // The recursive call should have been made
    });

    test('should throw error if life cycle function is not array', () => {
      const flowBody: TestTypeYaml = {
        ...BLANK_AGENT,
        name: 'testFlow',
        beforeRun: 'notArray' as any,
        run: [],
        afterRun: [],
      };

      mockResolveTest.mockReturnValueOnce({
        ...BLANK_AGENT,
        name: 'testFlow',
        beforeRun: 'notArray' as any,
        run: [],
        afterRun: [],
      });

      expect(() => FlowStructure.getFlowFullJSON('testFlow', flowBody, 0, true)).toThrow(
        "Block 'beforeRun' in agent 'testFlow' in file 'undefined' must be array of agents",
      );
    });

    test('should throw error if runner has multiple keys', () => {
      const flowBody: TestTypeYaml = {
        ...BLANK_AGENT,
        name: 'testFlow',
        beforeRun: [{ agent1: { ...BLANK_AGENT, name: 'agent1' }, agent2: { ...BLANK_AGENT, name: 'agent2' } }],
        run: [],
        afterRun: [],
      };

      mockResolveTest.mockReturnValueOnce({
        ...BLANK_AGENT,
        name: 'testFlow',
        beforeRun: [{ agent1: { ...BLANK_AGENT, name: 'agent1' }, agent2: { ...BLANK_AGENT, name: 'agent2' } }],
        run: [],
        afterRun: [],
      });

      expect(() => FlowStructure.getFlowFullJSON('testFlow', flowBody, 0, true)).toThrow(
        "Block 'beforeRun' in agent 'testFlow' in file 'undefined' must be array of agents with one key each",
      );
    });

    test('should handle runner with null value', () => {
      const flowBody: TestTypeYaml = {
        ...BLANK_AGENT,
        name: 'testFlow',
        beforeRun: [{ agent1: null }],
        run: [],
        afterRun: [],
      };

      jest.spyOn(FlowStructure, 'getFlowFullJSON');

      const result = FlowStructure.getFlowFullJSON('testFlow', flowBody, 0, true);

      expect(mockResolveTest).toHaveBeenCalledWith({ name: 'agent1' });
      expect(FlowStructure.getFlowFullJSON).toHaveBeenCalledWith(
        'agent1',
        expect.objectContaining({ name: 'agent1' }),
        1,
        false,
      );
      expect(result.beforeRun[0]).toBeDefined();
      expect(result.beforeRun[0].breadcrumbsDescriptions).toEqual(['']);
    });

    test('should handle runner with falsy value', () => {
      const flowBody: TestTypeYaml = {
        ...BLANK_AGENT,
        name: 'testFlow',
        beforeRun: [{ agent1: undefined }],
        run: [],
        afterRun: [],
      };

      jest.spyOn(FlowStructure, 'getFlowFullJSON');

      const result = FlowStructure.getFlowFullJSON('testFlow', flowBody, 0, true);

      expect(mockResolveTest).toHaveBeenCalledWith({ name: 'agent1' });
      expect(FlowStructure.getFlowFullJSON).toHaveBeenCalledWith(
        'agent1',
        expect.objectContaining({ name: 'agent1' }),
        1,
        false,
      );
      expect(result.beforeRun[0]).toBeDefined();
      expect(result.beforeRun[0].breadcrumbsDescriptions).toEqual(['']);
    });
  });
});

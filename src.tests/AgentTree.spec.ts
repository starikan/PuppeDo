import { AgentTree } from '../src/AgentTree';

describe('AgentTree', () => {
  describe('getTree', () => {
    test('getTree returns an empty array when no steps have been added', () => {
      const tree = new AgentTree();
      expect(tree.getTree()).toEqual([]);
    });

    test('getTree returns the correct tree after creating a single top-level step', () => {
      const tree = new AgentTree();
      tree.createStep({ stepId: 'step1', payload: { timeStart: new Date() } });
      expect(tree.getTree()).toEqual([{ stepId: 'step1', timeStart: expect.any(Date) }]);
    });

    test('getTree returns the correct tree after creating a top-level step and a child step', () => {
      const tree = new AgentTree();
      tree.createStep({ stepId: 'step1', payload: { timeStart: new Date() } });
      tree.createStep({ stepIdParent: 'step1', stepId: 'step2', payload: { timeEnd: new Date() } });
      expect(tree.getTree()).toEqual([
        {
          stepId: 'step1',
          timeStart: expect.any(Date),
          steps: [{ stepId: 'step2', stepIdParent: 'step1', timeEnd: expect.any(Date) }],
        },
      ]);
    });
  });

  describe('createStep', () => {
    let agentTree: AgentTree;

    beforeEach(() => {
      agentTree = new AgentTree();
    });

    test('creates a top-level step when stepIdParent is null', () => {
      const payload = { timeStart: new Date(), timeEnd: new Date() };
      const stepId = '1';
      agentTree.createStep({ stepId, payload });
      expect(agentTree.getTree()).toEqual([{ stepId, ...payload }]);
    });

    test('adds a new step to the steps array of a parent step when stepIdParent is not null', () => {
      const parentStepId = '1';
      const parentPayload = { timeStart: new Date(), timeEnd: new Date() };
      const childStepId = '2';
      const childPayload = { timeStart: new Date(), timeEnd: new Date() };
      agentTree.createStep({ stepId: parentStepId, payload: parentPayload });
      agentTree.createStep({ stepIdParent: parentStepId, stepId: childStepId, payload: childPayload });
      expect(agentTree.getTree()).toEqual([
        {
          stepId: parentStepId,
          ...parentPayload,
          steps: [{ stepId: childStepId, stepIdParent: parentStepId, ...childPayload }],
        },
      ]);
    });

    test('does nothing if stepIdParent is not found', () => {
      const payload = { timeStart: new Date(), timeEnd: new Date() };
      const stepId = '2';
      agentTree.createStep({ stepIdParent: '1', stepId, payload });
      expect(agentTree.getTree()).toEqual([]);
    });
  });

  describe('updateStep', () => {
    let agentTree: AgentTree;

    beforeEach(() => {
      agentTree = new AgentTree();
      agentTree.createStep({ stepIdParent: null, stepId: 'root', payload: {} });
    });

    it('should update an existing step', () => {
      const updatedData = { timeStart: new Date() };
      const result = agentTree.updateStep({ stepId: 'root', payload: updatedData });
      expect(result[0]).toMatchObject(updatedData);
    });

    it('should update an existing step with stepIdParent (set if not set)', () => {
      const result = agentTree.updateStep({ stepId: 'root', stepIdParent: 'newParent', payload: { timeStart: new Date() } });
      expect(result[0]).toMatchObject({ timeStart: expect.any(Date), stepIdParent: 'newParent' });
    });

    it('should update an existing step with stepIdParent (no change if already set)', () => {
      agentTree.createStep({ stepIdParent: 'root', stepId: 'child', payload: {} });
      const result = agentTree.updateStep({
        stepId: 'child',
        stepIdParent: 'other',
        payload: { timeStart: new Date() },
      });
      const child = result[0].steps?.find((s) => s.stepId === 'child');
      expect(child?.stepIdParent).toBe('root'); // unchanged
      expect(child).toMatchObject({ timeStart: expect.any(Date) });
    });

    it('should create a new step if stepId does not exist', () => {
      const updatedData = { timeStart: new Date() };
      agentTree.updateStep({ stepId: 'newStep', payload: updatedData });
      const newStep = agentTree.getTree().find((step) => step.stepId === 'newStep');
      expect(newStep).not.toBeNull();
      expect(newStep).toMatchObject(updatedData);
    });

    it('should create a new step with correct stepIdParent', () => {
      agentTree.createStep({ stepIdParent: 'root', stepId: 'childStep', payload: {} });
      const updatedData = { timeStart: new Date() };
      agentTree.updateStep({ stepId: 'childStep', payload: updatedData });
      const childStep = agentTree.getTree()[0].steps?.find((step) => step.stepId === 'childStep');
      expect(childStep).not.toBeNull();
      expect(childStep).toMatchObject(updatedData);
    });

    it('should update stepIdParent if provided and not set', () => {
      agentTree.createStep({ stepIdParent: 'root', stepId: 'childStep', payload: {} });
      agentTree.updateStep({ stepId: 'childStep', stepIdParent: 'newParent', payload: {} });
      const childStep = agentTree.getTree()[0].steps?.find((step) => step.stepId === 'childStep');
      expect(childStep?.stepIdParent).toBe('root'); // should not change if already set
    });
  });

  it('should create an empty array for entry.steps if it is nullish', () => {
    const agentTree = new AgentTree();
    agentTree.createStep({ stepIdParent: null, stepId: '1', payload: {} });
    const entry = agentTree.getTree()[0];
    expect(entry.steps).toBeUndefined();

    agentTree.createStep({ stepIdParent: '1', stepId: '1-1', payload: {} });
    expect(entry.steps).toBeDefined();
    expect(entry.steps).toHaveLength(1);

    agentTree.createStep({ stepIdParent: '1', stepId: '1-2', payload: {} });
    expect(entry.steps).toBeDefined();
    expect(entry.steps).toHaveLength(2);

    agentTree.createStep({ stepIdParent: '1-2', stepId: '1-2-1', payload: {} });
    const subEntry = entry.steps[1];
    expect(subEntry.steps).toBeDefined();
    expect(subEntry.steps).toHaveLength(1);
  });

  describe('findParent', () => {
    let agentTree: AgentTree;

    beforeEach(() => {
      agentTree = new AgentTree();
      agentTree.createStep({ stepId: 'root', payload: {} });
      agentTree.createStep({ stepIdParent: 'root', stepId: 'child1', payload: {} });
      agentTree.createStep({ stepIdParent: 'child1', stepId: 'grandchild', payload: {} });
    });

    test('returns null for root node', () => {
      const parent = agentTree.findParent('root');
      expect(parent).toBeNull();
    });

    test('returns correct parent for child node', () => {
      const parent = agentTree.findParent('child1');
      expect(parent).toEqual(expect.objectContaining({ stepId: 'root' }));
    });

    test('returns correct parent for grandchild node', () => {
      const parent = agentTree.findParent('grandchild');
      expect(parent).toEqual({ stepId: 'child1', stepIdParent: 'root', steps: expect.any(Array) });
    });

    test('returns null for non-existent node', () => {
      const parent = agentTree.findParent('nonexistent');
      expect(parent).toBeNull();
    });
  });

  describe('findPreviousSibling', () => {
    let agentTree: AgentTree;

    beforeEach(() => {
      agentTree = new AgentTree();
      agentTree.createStep({ stepId: 'root', payload: {} });
      agentTree.createStep({ stepIdParent: 'root', stepId: 'child1', payload: {} });
      agentTree.createStep({ stepIdParent: 'root', stepId: 'child2', payload: {} });
      agentTree.createStep({ stepIdParent: 'root', stepId: 'child3', payload: {} });
    });

    test('returns null for first child', () => {
      const sibling = agentTree.findPreviousSibling('child1');
      expect(sibling).toBeNull();
    });

    test('returns correct previous sibling for middle child', () => {
      const sibling = agentTree.findPreviousSibling('child2');
      expect(sibling).toEqual({ stepId: 'child1', stepIdParent: 'root' });
    });

    test('returns correct previous sibling for last child', () => {
      const sibling = agentTree.findPreviousSibling('child3');
      expect(sibling).toEqual({ stepId: 'child2', stepIdParent: 'root' });
    });

    test('returns null for root node', () => {
      const sibling = agentTree.findPreviousSibling('root');
      expect(sibling).toBeNull();
    });

    test('returns null for non-existent node', () => {
      const sibling = agentTree.findPreviousSibling('nonexistent');
      expect(sibling).toBeNull();
    });
  });

  describe('findNode', () => {
    let agentTree: AgentTree;

    beforeEach(() => {
      agentTree = new AgentTree();
      agentTree.createStep({ stepId: 'root', payload: {} });
      agentTree.createStep({ stepIdParent: 'root', stepId: 'child1', payload: {} });
      agentTree.createStep({ stepIdParent: 'child1', stepId: 'grandchild', payload: {} });
    });

    test('finds root node', () => {
      const node = agentTree.findNode('root');
      expect(node).toEqual(expect.objectContaining({ stepId: 'root' }));
    });

    test('finds child node', () => {
      const node = agentTree.findNode('child1');
      expect(node).toEqual(expect.objectContaining({ stepId: 'child1', stepIdParent: 'root' }));
    });

    test('finds grandchild node', () => {
      const node = agentTree.findNode('grandchild');
      expect(node).toEqual(expect.objectContaining({ stepId: 'grandchild', stepIdParent: 'child1' }));
    });

    test('returns null for non-existent node', () => {
      const node = agentTree.findNode('nonexistent');
      expect(node).toBeNull();
    });

    test('handles node without steps property', () => {
      const tree = new AgentTree();
      tree.createStep({ stepId: 'root', payload: {} });
      // root has no steps yet
      const node = tree.findNode('nonexistent');
      expect(node).toBeNull();
    });
  });

  describe('getTree with fieldsOnly', () => {
    test('filters fields correctly', () => {
      const tree = new AgentTree();
      tree.createStep({ stepId: 'step1', payload: { timeStart: new Date(), timeEnd: new Date(), custom: 'value' } });
      tree.createStep({ stepIdParent: 'step1', stepId: 'step2', payload: { timeStart: new Date() } });
      const filtered = tree.getTree(['timeStart', 'custom', 'nonexistent']);
      expect(filtered).toEqual([
        {
          stepId: 'step1',
          stepIdParent: undefined,
          timeStart: expect.any(Date),
          custom: 'value',
          steps: [{ stepId: 'step2', stepIdParent: 'step1', timeStart: expect.any(Date), steps: [] }],
        },
      ]);
    });

    test('returns all fields if fieldsOnly is not provided', () => {
      const tree = new AgentTree();
      tree.createStep({ stepId: 'step1', payload: { timeStart: new Date() } });
      const full = tree.getTree();
      expect(full[0]).toHaveProperty('timeStart');
    });
  });

  describe('createStep with existing stepId', () => {
    test('updates existing step instead of creating new', () => {
      const tree = new AgentTree();
      tree.createStep({ stepId: 'step1', payload: { timeStart: new Date() } });
      tree.createStep({ stepId: 'step1', payload: { timeEnd: new Date() } });
      const result = tree.getTree();
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({ stepId: 'step1', timeStart: expect.any(Date), timeEnd: expect.any(Date) });
    });
  });

  describe('updateStep with stepIdParent', () => {
    test('sets stepIdParent if not set', () => {
      const tree = new AgentTree();
      tree.createStep({ stepId: 'parent', payload: {} });
      tree.updateStep({ stepId: 'newStep', stepIdParent: 'parent', payload: { timeStart: new Date() } });
      const step = tree.findNode('newStep');
      expect(step?.stepIdParent).toBe('parent');
    });
  });

  describe('error handling', () => {
    let agentTree: AgentTree;

    beforeEach(() => {
      agentTree = new AgentTree();
    });

    describe('addError', () => {
      test('adds an error to the error route', () => {
        const payload = { message: 'Test error' };
        agentTree.addError({ stepId: 'error1', payload });
        const errors = agentTree.getErrors();
        expect(errors).toHaveLength(1);
        expect(errors[0]).toEqual({ stepId: 'error1', stepIdParent: null, ...payload });
      });
    });

    describe('clearErrors', () => {
      test('clears all errors', () => {
        agentTree.addError({ stepId: 'error1', payload: {} });
        agentTree.addError({ stepId: 'error2', payload: {} });
        expect(agentTree.getErrors()).toHaveLength(2);
        agentTree.clearErrors();
        expect(agentTree.getErrors()).toHaveLength(0);
      });
    });

    describe('getErrors', () => {
      test('returns the error route', () => {
        expect(agentTree.getErrors()).toEqual([]);
        agentTree.addError({ stepId: 'error1', payload: {} });
        expect(agentTree.getErrors()).toHaveLength(1);
      });
    });
  });
});

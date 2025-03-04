import { TestTree } from '../src/TestTree';

describe('TestTree', () => {
  describe('getTree', () => {
    test('getTree returns an empty array when no steps have been added', () => {
      const tree = new TestTree();
      expect(tree.getTree()).toEqual([]);
    });

    test('getTree returns the correct tree after creating a single top-level step', () => {
      const tree = new TestTree();
      tree.createStep({ stepId: 'step1', payload: { timeStart: new Date() } });
      expect(tree.getTree()).toEqual([{ stepId: 'step1', stepIdParent: null, timeStart: expect.any(Date) }]);
    });

    test('getTree returns the correct tree after creating a top-level step and a child step', () => {
      const tree = new TestTree();
      tree.createStep({ stepId: 'step1', payload: { timeStart: new Date() } });
      tree.createStep({ stepIdParent: 'step1', stepId: 'step2', payload: { timeEnd: new Date() } });
      expect(tree.getTree()).toEqual([
        {
          stepId: 'step1',
          stepIdParent: null,
          timeStart: expect.any(Date),
          steps: [{ stepId: 'step2', stepIdParent: 'step1', timeEnd: expect.any(Date) }],
        },
      ]);
    });
  });

  describe('createStep', () => {
    let testTree: TestTree;

    beforeEach(() => {
      testTree = new TestTree();
    });

    test('creates a top-level step when stepIdParent is null', () => {
      const payload = { timeStart: new Date(), timeEnd: new Date() };
      const stepId = '1';
      testTree.createStep({ stepId, payload });
      expect(testTree.getTree()).toEqual([{ stepId, stepIdParent: null, ...payload }]);
    });

    test('adds a new step to the steps array of a parent step when stepIdParent is not null', () => {
      const parentStepId = '1';
      const parentPayload = { timeStart: new Date(), timeEnd: new Date() };
      const childStepId = '2';
      const childPayload = { timeStart: new Date(), timeEnd: new Date() };
      testTree.createStep({ stepId: parentStepId, payload: parentPayload });
      testTree.createStep({ stepIdParent: parentStepId, stepId: childStepId, payload: childPayload });
      expect(testTree.getTree()).toEqual([
        {
          stepId: parentStepId,
          stepIdParent: null,
          ...parentPayload,
          steps: [{ stepId: childStepId, stepIdParent: parentStepId, ...childPayload }],
        },
      ]);
    });

    test('does nothing if stepIdParent is not found', () => {
      const payload = { timeStart: new Date(), timeEnd: new Date() };
      const stepId = '2';
      testTree.createStep({ stepIdParent: '1', stepId, payload });
      expect(testTree.getTree()).toEqual([]);
    });
  });

  describe('updateStep', () => {
    let testTree: TestTree;

    beforeEach(() => {
      testTree = new TestTree();
      testTree.createStep({ stepIdParent: null, stepId: 'root', payload: {} });
    });

    it('should update an existing step', () => {
      const updatedData = { timeStart: new Date() };
      const result = testTree.updateStep({ stepId: 'root', payload: updatedData });
      expect(result[0]).toMatchObject(updatedData);
    });

    it('should create a new step if stepId does not exist', () => {
      const updatedData = { timeStart: new Date() };
      testTree.updateStep({ stepId: 'newStep', payload: updatedData });
      const newStep = testTree.getTree().find((step) => step.stepId === 'newStep');
      expect(newStep).not.toBeNull();
      expect(newStep).toMatchObject(updatedData);
    });

    it('should create a new step with correct stepIdParent', () => {
      testTree.createStep({ stepIdParent: 'root', stepId: 'childStep', payload: {} });
      const updatedData = { timeStart: new Date() };
      testTree.updateStep({ stepId: 'childStep', payload: updatedData });
      const childStep = testTree.getTree()[0].steps?.find((step) => step.stepId === 'childStep');
      expect(childStep).not.toBeNull();
      expect(childStep).toMatchObject(updatedData);
    });
  });

  it('should create an empty array for entry.steps if it is nullish', () => {
    const testTree = new TestTree();
    testTree.createStep({ stepIdParent: null, stepId: '1', payload: {} });
    const entry = testTree.getTree()[0];
    expect(entry.steps).toBeUndefined();

    testTree.createStep({ stepIdParent: '1', stepId: '1-1', payload: {} });
    expect(entry.steps).toBeDefined();
    expect(entry.steps).toHaveLength(1);

    testTree.createStep({ stepIdParent: '1', stepId: '1-2', payload: {} });
    expect(entry.steps).toBeDefined();
    expect(entry.steps).toHaveLength(2);

    testTree.createStep({ stepIdParent: '1-2', stepId: '1-2-1', payload: {} });
    const subEntry = entry.steps[1];
    expect(subEntry.steps).toBeDefined();
    expect(subEntry.steps).toHaveLength(1);
  });
});

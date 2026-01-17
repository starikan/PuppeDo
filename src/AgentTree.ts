import type { CreateStepParams, TreeEntryType } from './model';

/* "It takes a stepIdParent, stepId, and payload, and then it either pushes a new step to the tree if there is no
stepIdParent, or it finds the stepIdParent and pushes a new step to its steps array."

The class has two public methods:

* `createStep`: It takes a stepIdParent, stepId, and payload, and then it either pushes a new step to the tree if there
is no stepIdParent, or it finds the stepIdParent and pushes a new step to its steps array.
* `updateStep`: It takes a stepId and a payload, finds the node in the tree with that stepId, and updates it with the
payload */
export class AgentTree {
  private tree: TreeEntryType[] = [];

  private errorRoute: TreeEntryType[] = [];

  /**
   * It returns the tree
   * @returns The tree property of the class.
   */
  getTree(fieldsOnly?: string[]): TreeEntryType[] {
    if (!fieldsOnly) {
      return this.tree;
    }
    const filterFields = (node: TreeEntryType): TreeEntryType => {
      const filteredNode: TreeEntryType = {
        stepId: node.stepId,
        stepIdParent: node.stepIdParent,
      };

      fieldsOnly.forEach((field) => {
        if (node[field] !== undefined) {
          filteredNode[field] = node[field];
        }
      });

      filteredNode.steps = node.steps ? node.steps.map(filterFields) : [];

      return filteredNode;
    };

    return this.tree.map(filterFields);
  }

  /**
   * "Find the node with the given stepId in the given tree."
   *
   * The function takes two parameters:
   *
   * * `tree`: The tree to search.
   * * `stepId`: The stepId to search for
   * @param {TreeEntryType[]} tree - The tree to search
   * @param {string} stepId - The stepId of the step you want to find.
   * @returns the first node that matches the stepId.
   */
  findNode(stepId: string, tree: TreeEntryType[] = this.tree): TreeEntryType | null {
    for (const entry of tree) {
      if (entry.stepId === stepId) {
        return entry;
      }

      const found = this.findNode(stepId, entry.steps || []);
      if (found) {
        return found;
      }
    }

    return null;
  }

  /**
   * Finds the parent node of a given stepId in the tree.
   *
   * @param {string} stepId - The stepId to find the parent for.
   * @param {TreeEntryType[]} tree - The tree to search in. Defaults to the class's tree property.
   * @returns {(TreeEntryType | null)} The parent node if found, otherwise null.
   */
  findParent(stepId: string, tree: TreeEntryType[] = this.tree): TreeEntryType | null {
    const node = this.findNode(stepId, tree);
    if (node) {
      return this.findNode(node.stepIdParent, tree);
    }
    return null;
  }

  /**
   * Finds the previous sibling of a node with the given stepId in the tree.
   *
   * @param {string} stepId - The stepId of the node to find the previous sibling for.
   * @param {TreeEntryType[]} tree - The tree to search in. Defaults to the class's tree property.
   * @returns {(TreeEntryType | null)} The previous sibling node if found, otherwise null.
   */
  findPreviousSibling(stepId: string, tree: TreeEntryType[] = this.tree): TreeEntryType | null {
    const node = this.findParent(stepId, tree);
    let steps = [];
    if (!node) {
      steps = this.tree;
    } else {
      steps = node.steps || [];
    }
    const index = steps.findIndex((step) => step.stepId === stepId);
    if (index !== -1 && index > 0) {
      return steps[index - 1];
    }
    return null;
  }

  /**
   * It takes a stepIdParent, stepId, and payload, and then it either pushes a new step to the tree if there is no
   * stepIdParent, or it finds the stepIdParent and pushes a new step to its steps array
   * @param {string | null} stepIdParent - The stepId of the parent step. If this is null, then the step is a top-level
   * step.
   * @param {string} stepId - The id of the step you want to create.
   * @param payload - Partial<TreeEntryDataType>
   * @returns The tree
   */
  createStep({ stepIdParent = null, stepId, payload }: CreateStepParams): TreeEntryType[] {
    if (this.findNode(stepId, this.tree)) {
      return this.updateStep({ stepId, stepIdParent, payload });
    }

    // Top step
    if (!stepIdParent && stepId) {
      this.tree.push({ stepId, ...payload });
    } else {
      const entry = this.findNode(stepIdParent, this.tree);
      if (entry) {
        entry.steps ??= [];
        entry.steps.push({ stepIdParent, stepId, ...payload });
      }
    }

    return this.getTree();
  }

  /**
   * It takes a stepId and a payload, finds the node in the tree with that stepId, and updates it with the payload
   * @param {string} stepId - The id of the step you want to update.
   * @param payload - Partial<TreeEntryDataType>
   * @returns The tree
   */
  updateStep({ stepId, stepIdParent = null, payload }: CreateStepParams): TreeEntryType[] {
    const entry = this.findNode(stepId, this.tree);
    if (entry) {
      for (const [key, value] of Object.entries(payload)) {
        entry[key] = value;
      }

      if (stepIdParent) {
        entry.stepIdParent ??= stepIdParent;
      }
    } else {
      this.createStep({ stepIdParent, stepId, payload });
    }

    return this.getTree();
  }

  /**
   * Adds an error to the error route.
   * @param {CreateStepParams} params - The parameters for creating a step.
   * @returns {TreeEntryType[]} The updated error route.
   */
  addError({ stepId, payload }: CreateStepParams): TreeEntryType[] {
    this.errorRoute.push({ stepId, stepIdParent: null, ...payload });

    return this.errorRoute;
  }

  /**
   * Clears all errors from the error route.
   */
  clearErrors(): void {
    this.errorRoute = [];
  }

  /**
   * Gets all errors from the error route.
   * @returns {TreeEntryType[]} The current error route.
   */
  getErrors(): TreeEntryType[] {
    return this.errorRoute;
  }
}

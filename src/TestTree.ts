import { TreeEntryDataType, TreeEntryType, TreeType } from './global.d';

type CreateStepParams = {
  stepIdParent?: string | null;
  stepId: string;
  payload: Partial<TreeEntryDataType>;
};

/* "It takes a stepIdParent, stepId, and payload, and then it either pushes a new step to the tree if there is no
stepIdParent, or it finds the stepIdParent and pushes a new step to its steps array."

The class has two public methods:

* `createStep`: It takes a stepIdParent, stepId, and payload, and then it either pushes a new step to the tree if there
is no stepIdParent, or it finds the stepIdParent and pushes a new step to its steps array.
* `updateStep`: It takes a stepId and a payload, finds the node in the tree with that stepId, and updates it with the
payload */
export class TestTree {
  private tree: TreeType = [];

  /**
   * It returns the tree
   * @returns The tree property of the class.
   */
  getTree(): TreeType {
    return this.tree;
  }

  /**
   * "Find the node with the given stepId in the given tree."
   *
   * The function takes two parameters:
   *
   * * `tree`: The tree to search.
   * * `stepId`: The stepId to search for
   * @param {TreeType} tree - The tree to search
   * @param {string} stepId - The stepId of the step you want to find.
   * @returns the first node that matches the stepId.
   */
  findNode(tree: TreeType, stepId: string): TreeEntryType | null {
    for (const entry of tree) {
      if (entry.stepId === stepId) {
        return entry;
      }

      const found = this.findNode(entry.steps ?? [], stepId);
      if (found) {
        return found;
      }
    }

    return null;
  }

  findParent(stepId: string, tree: TreeType = this.tree): TreeEntryType | null {
    const node = this.findNode(tree, stepId);
    if (node) {
      return this.findNode(tree, node.stepIdParent);
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
  createStep({ stepIdParent = null, stepId, payload }: CreateStepParams): TreeType {
    if (this.findNode(this.tree, stepId)) {
      return this.updateStep({ stepId, stepIdParent, payload });
    }

    // Top step
    if (!stepIdParent && stepId) {
      this.tree.push({ stepId, stepIdParent, ...payload });
    } else {
      const entry = this.findNode(this.tree, stepIdParent);
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
  updateStep({ stepId, stepIdParent = null, payload }: CreateStepParams): TreeType {
    const entry = this.findNode(this.tree, stepId);
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
}

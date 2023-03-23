import { Environment } from '../../Environment';
import { LogEntry, LogExporter } from '../../global.d';
import { PluginAllureSuit } from './allureSuite';

// Here are all the fields that can be included in a StepResult object in Allure:

// name: The name of the step.
// status: The status of the step, which can be one of "passed", "failed", or "skipped".
// start: The start time of the step in milliseconds since the UNIX epoch.
// stop: The end time of the step in milliseconds since the UNIX epoch.
// description: A description of the step, which can be a plain text string or an HTML string.
// attachments: An array of attachments that were added to the step. Each attachment is represented by an object with the following properties:
//   name: The name of the attachment.
//   source: The file path or URL of the attachment.
//   type: The MIME type of the attachment.
// steps: An array of nested steps that were executed within this step. Each nested step is represented by a StepResult object.
// parameters: An array of parameters that were added to the step. Each parameter is represented by an object with the following properties:
//   name: The name of the parameter.
//   value: The value of the parameter.
// statusDetails: An object that provides additional details about the status of the step. This object has the following properties:
//   message: A message describing the status of the step.
//   trace: A stack trace associated with the status of the step.
// Note that not all of these fields are required or applicable for every step. The StepResult object may contain only a subset of these fields depending on what was added to the step.

type AllureEntry = {
  name: string;
  start: number;
  stop: number;
  stage: 'finished';
  description?: string | null;
  descriptionHtml?: string | null;
  status: 'passed';
  statusDetails?: string | null;
  steps: AllureEntry[];
  attachments?: unknown[];
  parameters?: unknown[];
};

const resolveStep = (envsId: string, stepId: string): AllureEntry => {
  const { testTree } = new Environment().getEnvInstance(envsId);
  const node = testTree.getNode(stepId);
  const { description, timeStart, timeEnd, steps = [] } = node;

  const allureResult: AllureEntry = {
    name: description,
    start: timeStart?.getTime() ?? 0,
    stop: timeEnd?.getTime() ?? 0,
    stage: 'finished',
    description: null,
    descriptionHtml: null,
    status: 'passed',
    statusDetails: null,
    steps: steps.map((v) => resolveStep(envsId, v.stepId)),
  };

  return allureResult;
};

const ALLURE_RESULTS_FOLDER = 'allure-results';

export const exporterAllure: LogExporter = async (logEntry: LogEntry): Promise<void> => {
  const { args, stepId } = logEntry;
  if (!args) {
    return;
  }
  const { plugins } = args;
  const { allureSuite } = plugins.getValue<PluginAllureSuit>('allureSuite');

  if (allureSuite && logEntry.level === 'timer') {
    const allureResult = resolveStep(args.envsId, stepId);

    const logger = new Environment().getLogger(args.envsId);
    logger.exporter.saveToFile(`${stepId}-result.json`, JSON.stringify(allureResult, null, 2), [ALLURE_RESULTS_FOLDER]);
  }
  //   allure.runtime.writeResult({ uuid: logEntry.stepId ?? generateId(), historyId: '555', labels: [], links: [] });
};

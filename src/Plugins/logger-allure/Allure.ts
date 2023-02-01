// import {
//   Allure,
//   AllureConfig,
//   AllureGroup,
//   AllureRuntime,
//   AllureStep,
//   AllureTest,
//   AttachmentOptions,
//   ContentType,
//   ExecutableItemWrapper,
//   isPromise,
//   Label,
//   Status,
//   StepInterface,
// } from 'allure-js-commons';

import { LogEntry, LogExporter } from '../../global.d';
import { PluginAllureSuit } from './allureSuite';

// import { LogEntrieType, LogEntry, LogExporter, LogExporterOptions } from '../global.d';
// import { generateId } from '../Helpers';

// export class AllureReporter {
//   private groupStack: AllureGroup[] = [];
//   private labelStack: Label[][] = [[]];
//   private runningTest: AllureTest | null = null;
//   private stepStack: AllureStep[] = [];
//   private runningExecutable: ExecutableItemWrapper | null = null;
//   private readonly runtime: AllureRuntime;

//   constructor(config: AllureConfig) {
//     this.runtime = new AllureRuntime(config);
//     // debugger;
//   }

//   get currentGroup(): AllureGroup {
//     const currentGroup = this.getCurrentGroup();
//     if (currentGroup === null) {
//       throw new Error('No active group');
//     }
//     return currentGroup;
//   }

//   getInterface(): Allure {
//     return new AllureInterface(this, this.runtime);
//   }

//   get currentTest(): AllureTest {
//     if (this.runningTest === null) {
//       throw new Error('No active test');
//     }
//     return this.runningTest;
//   }

//   get currentExecutable(): ExecutableItemWrapper | null {
//     return this.runningExecutable;
//   }

//   writeAttachment(content: Buffer | string, options: ContentType | string | AttachmentOptions): string {
//     return this.runtime.writeAttachment(content, options);
//   }

//   addLabel(name: string, value: string): void {
//     if (this.labelStack.length) {
//       this.labelStack[this.labelStack.length - 1].push({ name, value });
//     }
//   }

//   pushStep(step: AllureStep): void {
//     this.stepStack.push(step);
//   }

//   popStep(): void {
//     this.stepStack.pop();
//   }

//   get currentStep(): AllureStep | null {
//     if (this.stepStack.length > 0) {
//       return this.stepStack[this.stepStack.length - 1];
//     }
//     return null;
//   }

//   private getCurrentGroup(): AllureGroup | null {
//     if (this.groupStack.length === 0) {
//       return null;
//     }
//     return this.groupStack[this.groupStack.length - 1];
//   }
// }

// export class AllureInterface extends Allure {
//   constructor(private readonly reporter: AllureReporter, runtime: AllureRuntime) {
//     super(runtime);
//   }

//   label(name: string, value: string): void {
//     try {
//       this.reporter.currentTest.addLabel(name, value);
//     } catch {
//       this.reporter.addLabel(name, value);
//     }
//   }

//   step<T>(name: string, body: (step: StepInterface) => T): T {
//     const wrappedStep = this.startStep(name);
//     let result;
//     try {
//       result = wrappedStep.run(body);
//     } catch (err) {
//       wrappedStep.setError(err as Error);
//       wrappedStep.endStep();
//       throw err;
//     }
//     if (isPromise(result)) {
//       const promise = result as any as Promise<any>;
//       return promise
//         .then((a) => {
//           wrappedStep.endStep();
//           return a;
//         })
//         .catch((e: Error) => {
//           wrappedStep.setError(e);
//           wrappedStep.endStep();
//           throw e;
//         }) as any as T;
//     } else {
//       wrappedStep.endStep();
//       return result;
//     }
//   }

//   logStep(name: string, status?: Status): void {
//     const step = this.startStep(name);
//     step.setStatus(status);
//     step.endStep();
//   }

//   attachment(name: string, content: Buffer | string, options: ContentType | string | AttachmentOptions): void {
//     const file = this.reporter.writeAttachment(content, options);
//     this.currentExecutable.addAttachment(name, options, file);
//   }

//   testAttachment(name: string, content: Buffer | string, options: ContentType | string | AttachmentOptions): void {
//     const file = this.reporter.writeAttachment(content, options);
//     this.currentTest.addAttachment(name, options, file);
//   }

//   protected get currentExecutable(): ExecutableItemWrapper {
//     return this.reporter.currentStep || this.reporter.currentExecutable || this.reporter.currentTest;
//   }

//   protected get currentTest(): AllureTest {
//     return this.reporter.currentTest;
//   }

//   private startStep(name: string): WrappedStep {
//     const allureStep: AllureStep = this.currentExecutable.startStep(name);
//     this.reporter.pushStep(allureStep);
//     return new WrappedStep(this.reporter, allureStep);
//   }
// }

// class WrappedStep {
//   // needed?
//   constructor(private readonly reporter: AllureReporter, private readonly step: AllureStep) {}

//   startStep(name: string): WrappedStep {
//     const step = this.step.startStep(name);
//     this.reporter.pushStep(step);
//     return new WrappedStep(this.reporter, step);
//   }

//   setStatus(status?: Status): void {
//     this.step.status = status;
//   }

//   setError(error: Error): void {
//     this.step.status = Status.FAILED;
//     this.step.detailsMessage = error.message;
//     this.step.detailsTrace = error.stack;
//   }

//   endStep(): void {
//     this.reporter.popStep();
//     this.step.endStep();
//   }

//   run<T>(body: (step: StepInterface) => T): T {
//     return this.step.wrap(body)();
//   }
// }

// const reporter = new AllureReporter({
//   resultsDir: './output',
// });

// export const allure = reporter.getInterface();

// allure.writeEnvironmentInfo({
//   a: 'b',
//   PATH: 'azazaz',
//   APPDATA: 'C:\\USERS\\test (x86)\\AppData',
//   PS1: '\\[\\0330;$MSYSTEM;${PWD//[^[:ascii:]]/?}\\007\\]',
//   TEST1: '\\usr\\bin',
// });

// allure.writeCategoriesDefinitions([
//   {
//     name: 'Sad tests',
//     messageRegex: /.*Sad.*/,
//     matchedStatuses: [Status.FAILED],
//   },
//   {
//     name: 'Infrastructure problems',
//     messageRegex: '.*RuntimeException.*',
//     matchedStatuses: [Status.BROKEN],
//   },
//   {
//     name: 'Outdated tests',
//     messageRegex: '.*FileNotFound.*',
//     matchedStatuses: [Status.BROKEN],
//   },
//   {
//     name: 'Regression',
//     messageRegex: '.*\\sException:.*',
//     matchedStatuses: [Status.BROKEN],
//   },
// ]);

const COLLECTOR: any = {};

// // logEntryFormated: LogEntrieType[][],
// // logString: string,
// // options: LogExporterOptions,
export const exporterAllure: LogExporter = async (logEntry: LogEntry): Promise<void> => {
  const { args } = logEntry;
  if (!args) {
    return;
  }
  const { plugins } = args;

  const name = plugins.getValue<PluginAllureSuit>('allureSuite').allureSuite;

  debugger;
  //   allure.suite('TestSuite');
  //   allure.runtime.writeResult({ uuid: logEntry.stepId ?? generateId(), historyId: '555', labels: [], links: [] });
};

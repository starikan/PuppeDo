import path from 'path';

import { Arguments } from '../Arguments';
import { Environment } from '../Environment';
import { ErrorType } from '../Error';
import { LogFunctionType, TestArgsType } from '../global.d';
import { getTimer } from '../Helpers';

export const logExtendFileInfo = async (log: LogFunctionType, args: TestArgsType | undefined): Promise<void> => {
  if (args?.envsId) {
    const output = new Environment().getOutput(args?.envsId);
    const outputFile = path.join(output.folderFull || '.', 'output.log');
    const text = ['=============== EXTEND FILE ===============', `file:///${outputFile}`, ''];
    await log({ text, levelIndent: 0, level: 'error', logMeta: { extendInfo: true } });
  }
};

export const logError = async (log: LogFunctionType, error: ErrorType): Promise<void> => {
  if (error.message) {
    const text = ['============== ERROR MESSAGE ==============', ...error.message.split('\n'), ''];
    await log({ text, levelIndent: 0, level: 'error', logMeta: { extendInfo: true } });
  }

  if (error.stack) {
    const text = ['============== ERROR STACK ==============', ...error.stack.split('\n'), ''];
    await log({ text, levelIndent: 0, level: 'error', logMeta: { extendInfo: true } });
  }
};

export const logTimer = async (
  log: LogFunctionType,
  startTime: bigint,
  endTime: bigint,
  args: TestArgsType,
): Promise<void> => {
  const { levelIndent = 0, stepId } = args;
  const { PPD_LOG_EXTEND, PPD_LOG_STEPID } = new Arguments().args;
  if (PPD_LOG_EXTEND) {
    const { timeStart, timeEnd, deltaStr } = getTimer({ timeStartBigInt: startTime, timeEndBigInt: endTime });
    await log({
      text: `⌛: ${deltaStr}${PPD_LOG_STEPID ? ` [${stepId}]` : ''}`,
      level: 'timer',
      levelIndent: levelIndent + 1,
      stepId,
      logMeta: { extendInfo: true, timeStart, timeEnd },
    });
  }
};

export const logExtend = async (
  log: LogFunctionType,
  args: TestArgsType | undefined,
  isError = false,
): Promise<void> => {
  const { PPD_LOG_EXTEND } = new Arguments().args;
  const { dataTest, bindData, selectorsTest, bindSelectors, bindResults, options, levelIndent = 0 } = args || {};
  if (PPD_LOG_EXTEND || isError) {
    let text = [
      ['📋 (data):', dataTest],
      ['📌📋 (bD):', bindData],
      ['☸️ (selectors):', selectorsTest],
      ['📌☸️ (bS):', bindSelectors],
      ['↩️ (results):', bindResults],
      ['⚙️ (options):', options],
    ]
      .filter((v) => typeof v[1] === 'object' && Object.keys(v[1]).length)
      .map((v) => `${v[0]} ${JSON.stringify(v[1])}`);

    if (isError && text.length) {
      text = ['============== ALL DATA ==============', ...text, ''];
    }

    await log({
      text,
      levelIndent: isError ? 0 : levelIndent + 1,
      level: isError ? 'error' : 'info',
      logMeta: { extendInfo: true },
    });
  }
};

export const logArgs = async (log: LogFunctionType): Promise<void> => {
  const args = Object.entries(new Arguments().args).map((v) => `${v[0]}: ${JSON.stringify(v[1])}`);
  const text = ['============== ARGUMENTS ==============', ...args, ''];
  await log({ text, levelIndent: 0, level: 'error', logMeta: { extendInfo: true } });
};

export const logDebug = async (log: LogFunctionType, args: TestArgsType | undefined): Promise<void> => {
  let text: string[] = [];
  const { data, selectors } = args || {};

  if (data && Object.keys(data).length) {
    const dataDebug = JSON.stringify(data, null, 2).split('\n');
    text = [...text, '============== DEBUG DATA ==============', ...dataDebug, ''];
  }

  if (selectors && Object.keys(selectors).length) {
    const selectorsDebug = JSON.stringify(selectors, null, 2).split('\n');
    text = [...text, '============== DEBUG SELECTORS ==============', ...selectorsDebug, ''];
  }

  await log({ text, levelIndent: 0, level: 'error', logMeta: { extendInfo: true } });

  // console.log(args);
};

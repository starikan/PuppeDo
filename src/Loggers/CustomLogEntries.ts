import path from 'path';

import { Arguments } from '../Arguments';
import { Environment } from '../Environment';
import type { ErrorType } from '../Error';
import { getTimer } from '../Helpers';
import type { LogFunctionType } from '../model';

export const logExtendFileInfo = async (log: LogFunctionType, { envsId }: { envsId: string }): Promise<void> => {
  if (envsId) {
    const output = new Environment().getOutput(envsId);
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
  { levelIndent = 0, stepId }: { levelIndent: number; stepId: string },
): Promise<void> => {
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
  {
    data,
    bindData,
    selectors,
    bindSelectors,
    bindResults,
    options,
    levelIndent = 0,
  }: {
    data: Record<string, unknown>;
    bindData: Record<string, unknown>;
    selectors: Record<string, unknown>;
    bindSelectors: Record<string, unknown>;
    bindResults: Record<string, unknown>;
    options: Record<string, unknown>;
    levelIndent: number;
  },
  isError = false,
): Promise<void> => {
  const { PPD_LOG_EXTEND } = new Arguments().args;
  if (PPD_LOG_EXTEND || isError) {
    let text = [
      ['📋 (data):', data],
      ['📌📋 (bD):', bindData],
      ['☸️ (selectors):', selectors],
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

export const logDebug = async (
  log: LogFunctionType,
  { data, selectors }: { data: Record<string, unknown>; selectors: Record<string, unknown> },
): Promise<void> => {
  let text: string[] = [];

  if (data && Object.keys(data).length) {
    const dataDebug = JSON.stringify(data, null, 2).split('\n');
    text = [...text, '============== DEBUG DATA ==============', ...dataDebug, ''];
  }

  if (selectors && Object.keys(selectors).length) {
    const selectorsDebug = JSON.stringify(selectors, null, 2).split('\n');
    text = [...text, '============== DEBUG SELECTORS ==============', ...selectorsDebug, ''];
  }

  await log({ text, levelIndent: 0, level: 'error', logMeta: { extendInfo: true } });
};

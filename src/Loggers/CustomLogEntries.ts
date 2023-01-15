import path from 'path';

import { Arguments } from '../Arguments';
import { Environment } from '../Environment';
import { ErrorType } from '../Error';
import { LogFunctionType, TestArgsType } from '../global.d';

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

export const logTimer = async (log: LogFunctionType, startTime: bigint, levelIndent = 0): Promise<void> => {
  const { PPD_LOG_EXTEND } = new Arguments().args;
  if (PPD_LOG_EXTEND) {
    const text = `⌛: ${(Number(process.hrtime.bigint() - startTime) / 1e9).toFixed(3)} s.`;
    await log({ text, level: 'timer', levelIndent: levelIndent + 1, logMeta: { extendInfo: true } });
  }
};

export const logExtend = async (
  log: LogFunctionType,
  levelIndent: number,
  args: TestArgsType | undefined,
  isError = false,
): Promise<void> => {
  const { PPD_LOG_EXTEND } = new Arguments().args;
  const { dataTest, bindData, selectorsTest, bindSelectors, bindResults, options } = args || {};
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
      levelIndent: isError ? levelIndent : levelIndent + 1,
      level: isError ? 'error' : 'info',
      logMeta: { extendInfo: true },
    });
  }
};

export const logArgs = async (log: LogFunctionType, levelIndent: number, stdOut = false): Promise<void> => {
  const args = Object.entries(new Arguments().args).map((v) => `${v[0]}: ${JSON.stringify(v[1])}`);
  const text = ['============== ARGUMENTS ==============', ...args, ''];
  await log({ text, levelIndent, level: 'error', logMeta: { extendInfo: true }, stdOut });
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

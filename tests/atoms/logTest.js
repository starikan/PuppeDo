module.exports = {
  runTest: async function(args) {
    const CircularJSON = require('circular-json');
    const {
      envName,
      envPageName,
      env,
      browser,
      page,
      data,
      selectors,
      options,
      envsId,
      envs,
      log,
      helper,
      levelIndent,
      _,
    } = args;

    const selector = _.get(data, 'selector');
    const text = _.get(data, 'text', '');
    const screenshot = _.get(data, 'screenshot', false);
    const fullpage = _.get(data, 'fullpage', false);
    const level = _.get(data, 'level', 'raw');
    const logVars = _.get(data, 'logVars', false);
    const logData = _.get(data, 'logData', false);
    const logSelectors = _.get(data, 'logSelectors', false);
    const logBrowser = _.get(data, 'logBrowser', false);
    const logPage = _.get(data, 'logPage', false);
    const logOptions = _.get(data, 'logOptions', false);
    const logEnv = _.get(data, 'logEnv', false);
    const logEnvs = _.get(data, 'logEnvs', false);
    const debug = _.get(data, 'debug', false);

    const element = false;
    if (selector) {
      element = await helper.getElement(page, selector);
    }

    if (logVars) {
      const vars = {
        envName,
        envPageName,
        envsId,
      };
      await log({
        text: `
============================ VARS
${JSON.stringify(vars, null, '  ')}
============================ VARS
        `,
        screenshot: false,
        fullpage: false,
        level: 'raw',
        levelIndent: levelIndent + 1,
      });
    }

    if (logData) {
      await log({
        text: `
============================ DATA
${JSON.stringify(data, null, '  ')}
============================ DATA
        `,
        screenshot: false,
        fullpage: false,
        level: 'raw',
        levelIndent: levelIndent + 1,
      });
    }

    if (logSelectors) {
      await log({
        text: `
============================ SELECTOR
${JSON.stringify(selectors, null, '  ')}
============================ SELECTOR
        `,
        screenshot: false,
        fullpage: false,
        level: 'raw',
        levelIndent: levelIndent + 1,
      });
    }

    if (logBrowser) {
      await log({
        text: `
============================ BROWSER
${CircularJSON.stringify(browser, null, '  ')}
============================ BROWSER
        `,
        screenshot: false,
        fullpage: false,
        level: 'raw',
        levelIndent: levelIndent + 1,
      });
    }

    if (logPage) {
      await log({
        text: `
============================ PAGE
${CircularJSON.stringify(page, null, '  ')}
============================ PAGE
        `,
        screenshot: false,
        fullpage: false,
        level: 'raw',
        levelIndent: levelIndent + 1,
      });
    }

    if (logOptions) {
      await log({
        text: `
============================ OPTIONS
${CircularJSON.stringify(options, null, '  ')}
============================ OPTIONS
        `,
        screenshot: false,
        fullpage: false,
        level: 'raw',
        levelIndent: levelIndent + 1,
      });
    }

    if (logEnv) {
      await log({
        text: `
============================ ENV
${CircularJSON.stringify(env, null, '  ')}
============================ ENV
        `,
        screenshot: false,
        fullpage: false,
        level: 'raw',
        levelIndent: levelIndent + 1,
      });
    }

    if (logEnvs) {
      await log({
        text: `
============================ ENVS
${CircularJSON.stringify(envs, null, '  ')}
============================ ENVS
        `,
        screenshot: false,
        fullpage: false,
        level: 'raw',
        levelIndent: levelIndent + 1,
      });
    }

    if (debug) {
      if (process.env.PPD_DEBUG_MODE) {
        debugger;
      }
    }

    await log({
      text: text,
      screenshot: screenshot,
      fullpage: fullpage,
      element: element,
      level: level,
      levelIndent: levelIndent + 1,
    });
  },
};

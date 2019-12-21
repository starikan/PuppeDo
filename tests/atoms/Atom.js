class Atom {
  constructor() {}

  async getElement(page, selector, allElements = false) {
    if (page && selector && typeof selector === 'string' && typeof page === 'object') {
      let element;
      if (selector.startsWith('xpath:')) {
        selector = selector.replace(/^xpath:/, '');
        element = await page.$x(selector);
        if (!allElements) {
          if (element.length > 1) {
            throw { message: `Finded more then 1 xpath elements ${selector}` };
          }
          element = element[0];
        }
      } else {
        selector = selector.replace(/^css:/, '');
        element = allElements ? await page.$$(selector) : await page.$(selector);
      }
      return element;
    } else {
      return false;
    }
  }

  async atomRun() {
    console.log('Empty Atom Run');
  }

  async runTest(args = {}) {
    try {
      const startTime = new Date();

      this.envs = args.envs;
      this.envsId = args.envsId;
      this.envName = args.envName;
      this.envPageName = args.envPageName;
      this.data = args.data;
      this.selectors = args.selectors;
      this.options = args.options;
      this.allowResults = args.allowResults;
      this.bindResults = args.bindResults;
      this.levelIndent = args.levelIndent;
      this.repeat = args.repeat;
      this.stepId = args.stepId;
      this.env = args.env;
      this.browser = args.browser;
      this.page = args.page;
      // TODO: delete this arter refactoring
      this.helper = args.helper;
      this._ = args._;
      this.name = args.name;
      this.description = args.description;

      this.screenshot = (this.options || {})['screenshot'] || false;
      this.fullpage = (this.options || {})['fullpage'] || false;
      this.level = (this.options || {})['level'] || 'raw';
      this.log = function(cusomLog) {
        args.log({
          ...{
            screenshot: this.screenshot,
            fullpage: this.fullpage,
            level: this.level,
            levelIndent: this.levelIndent + 1,
          },
          ...cusomLog,
        });
      };

      await this.atomRun();

      const timer = (this.envs.args || {})['PPD_LOG_TIMER'] || false;
      if (timer) {
        console.log(`${' '.repeat(21)}${' | '.repeat(this.levelIndent + 1)} ⌛: ${new Date() - startTime} ms.`);
      }
    } catch (error) {
      throw { message: `Error in Atom` };
    }
  }
}

module.exports = Atom;

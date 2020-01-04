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
      debugger;
      throw { message: `Error in Atom` };
    }
  }
}

const instance = new Atom();
module.exports = { runTest: instance.runTest.bind(instance) };

// WRITE YOUR LOGIC BELLOW
instance.atomRun = async function() {
  const js = () => {
    function clickHandler(event) {
      console.log(event);

      const fields = [
        'x',
        'y',
        'button',
        'clientX',
        'clientY',
        'ctrlKey',
        'layerX',
        'layerY',
        'metaKey',
        'movementX',
        'movementY',
        'offsetX',
        'offsetY',
        'pageX',
        'pageY',
        'screenX',
        'screenY',
        'shiftKey',
      ];
      const exportData = _.pick(event, fields);

      exportData.path = [];
      event.path.forEach((p, i) => {
        let fieldsPath = [
          'baseURI',
          'childElementCount',
          'className',
          'clientHeight',
          'clientLeft',
          'clientTop',
          'clientWidth',
          'draggable',
          'hidden',
          'id',
          'localName',
          'nodeName',
          'nodeType',
          'nodeValue',
          'offsetHeight',
          'offsetLeft',
          'offsetTop',
          'offsetWidth',
          'scrollHeight',
          'scrollLeft',
          'scrollTop',
          'scrollWidth',
          'tabIndex',
          'tagName',
          'textContent',
          'title',
        ];

        if (i === 0) {
          fieldsPath = [...fieldsPath, 'innerHTML', 'innerText', 'outerHTML', 'outerText', 'text'];
        }

        const path = _.pick(p, fieldsPath);

        path.attributes = {};
        if (p.attributes && p.attributes.length) {
          for (let attr of p.attributes) {
            path.attributes[attr.name] = attr.value;
          }
        }

        path.classList = p.classList && p.classList.length ? [...p.classList] : [];

        exportData.path.push(path);
      });

      console.log(exportData);
      console.log(JSON.stringify(exportData, { skipInvalid: true }));
      // debugger;
    }
    window.addEventListener('click', clickHandler, true);
    return window;
  };

  const yamlFile = 'https://cdnjs.cloudflare.com/ajax/libs/js-yaml/3.13.1/js-yaml.min.js';
  const lodashFile = 'https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.15/lodash.core.min.js';

  await this.page.addScriptTag({ url: yamlFile });
  await this.page.addScriptTag({ url: lodashFile });
  await this.page.evaluate(js);

  const client = await this.page.target().createCDPSession();
  await client.send('Console.enable');
  await client.send('DOM.enable');
  client.on('Console.messageAdded', async e => {
    const textLog = e.message.text;
    console.log(textLog);
    try {
      const data = JSON.parse(textLog);
      const { x, y } = data;
      const { nodeId } = await client.send('DOM.getNodeForLocation', { x, y });
      const nodeIdDescribe = await client.send('DOM.describeNode', { nodeId });
      debugger;
    } catch (err) {
      // debugger;
    }
  });

  // await client.send('DOM.enable');
  // client.on('DOM.documentUpdated', e => {
  //   await client.send('Page.enable');
  //   const links = await client.send('')
  //   console.log(e);
  // });
};

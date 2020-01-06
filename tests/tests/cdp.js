const { Atom } = require('@puppedo/atoms');
const instance = new Atom();
module.exports = { runTest: instance.runTest.bind(instance) };

// WRITE YOUR LOGIC BELLOW
instance.atomRun = async function() {
  const jsEvalOnClick = () => {
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
    }
    window.addEventListener('click', clickHandler, true);
    return window;
  };

  const yamlFile = 'https://cdnjs.cloudflare.com/ajax/libs/js-yaml/3.13.1/js-yaml.min.js';
  const lodashFile = 'https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.15/lodash.core.min.js';

  await this.page.addScriptTag({ url: yamlFile });
  await this.page.addScriptTag({ url: lodashFile });
  await this.page.evaluate(jsEvalOnClick);

  const client = await this.page.target().createCDPSession();
  await client.send('Console.enable');
  await client.send('DOM.enable');
  client.on('Console.messageAdded', async e => {
    const textLog = e.message.text;
    try {
      const data = JSON.parse(textLog);
      // const { x, y } = data;
      // const { nodeId } = await client.send('DOM.getNodeForLocation', { x, y });
      // const nodeIdDescribe = await client.send('DOM.describeNode', { nodeId });
      // debugger;
      console.log(data)
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

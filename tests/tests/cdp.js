const { Atom } = require('@puppedo/atoms');
const instance = new Atom();
module.exports = { runTest: instance.runTest.bind(instance) };

// WRITE YOUR LOGIC BELLOW
instance.atomRun = async function() {
  const jsEvalOnClick = () => {
    let previousBorder = null;
    let elementClicked = null;
    function clickHandler(event) {
      if (elementClicked) {
        elementClicked.style.border = previousBorder;
      }

      elementClicked = event.target;
      elementClicked.style.setProperty('border', previousBorder);

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

      const target = event.target;
      exportData.xpath = [xpath.getXPath(target), xpath.getUniqueXPath(target)];

      // console.log(exportData);
      console.log(JSON.stringify(exportData, { skipInvalid: true }));

      target.style.setProperty('border', '2px solid red');
    }
    window.addEventListener('click', clickHandler, true);
    return window;
  };

  const checkSelectorsInDom = selectors => {
    selectors = selectors.map(v => [v, document.querySelectorAll(v).length]);
    return selectors;
  };

  const getCombinations = (chars, divider = '.') => {
    const result = [];
    const f = (prefix, chars) => {
      for (var i = 0; i < chars.length; i++) {
        result.push(prefix + divider + chars[i]);
        f(prefix + divider + chars[i], chars.slice(i + 1));
      }
    };
    f('', chars);
    return result;
  };

  const generateSelectors = elements => {
    elements = elements
      .filter(v => !v.hidden)
      .filter(v => v.tagName && !['HTML', 'BODY'].includes(v.tagName))
      .map(v => this._.pick(v, ['classList', 'attributes', 'id', 'tagName', 'textContent']))
      .map(v => {
        v.tagName = v.tagName.toLowerCase();
        return v;
      })
      .map(v => {
        delete v.attributes.class;
        return v;
      });

    const parts = elements.map(v => {
      let set = [
        ...(v.id ? [`#${v.id}`] : []),
        ...getCombinations(v.classList)
          .map(c => `${c}`)
          .sort((a, b) => a.length - b.length),
        // ...getCombinations(v.classList)
        //   .map(c => `${v.tagName}${c}`)
        //   .sort((a, b) => a.length - b.length),
        ...getCombinations(
          Object.entries(v.attributes).map(attr => `[${attr[0]}='${attr[1]}']`),
          '',
        ),
        // ...getCombinations(
        //   Object.entries(v.attributes).map(attr => `[${attr[0]}='${attr[1]}']`),
        //   '',
        // ).map(c => `${v.tagName}${c}`),
        ...[v.tagName],
      ];

      return set;
    });

    let selectors = [...parts[0]];
    let combines = [...parts[0]];
    for (let i = 1; i < parts.length; i++) {
      combines = parts[i].reduce((s, b) => (s = [...s, ...combines.map(a => `${b} > ${a}`)]), []);
      selectors = [...selectors, ...combines];
    }

    return selectors;
  };

  const checkSelectors = async selectors => {
    let counts = await this.page.evaluate(checkSelectorsInDom, selectors);
    counts = counts
      .filter(v => v[1] === 1)
      .map(v => v[0])
      .sort(
        (a, b) =>
          a.split('').filter(v => ['.', '>'].includes(v)).length >
          b.split('').filter(v => ['.', '>'].includes(v)).length,
      );
    return counts;
  };

  this.addScripts = async () => {
    const yamlFile = 'https://cdnjs.cloudflare.com/ajax/libs/js-yaml/3.13.1/js-yaml.min.js';
    const lodashFile = 'https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.15/lodash.core.min.js';
    // https://github.com/johannhof/xpath-dom
    const xpathFile = 'https://cdn.rawgit.com/johannhof/xpath-dom/master/dist/xpath-dom.min.js';

    try {
      await this.page.addScriptTag({ url: yamlFile });
      await this.page.addScriptTag({ url: lodashFile });
      await this.page.addScriptTag({ url: xpathFile });
      await this.page.evaluate(jsEvalOnClick);

      const client = await this.page.target().createCDPSession();
      await client.send('Console.enable');
      client.on('Console.messageAdded', async e => {
        const textLog = e.message.text;
        try {
          const data = JSON.parse(textLog);
          const selectors = generateSelectors(data.path);
          const selectorsCheck = await checkSelectors(selectors);
          // const { x, y } = data;
          // const { nodeId } = await client.send('DOM.getNodeForLocation', { x, y });
          // const nodeIdDescribe = await client.send('DOM.describeNode', { nodeId });
          // debugger;
          console.log(selectorsCheck);
        } catch (err) {
          // debugger;
        }
      });

      await client.send('DOM.enable');
      client.on('DOM.documentUpdated', this.addScripts);

      // debugger;
    } catch (err) {
      debugger;
    }
  };

  await this.addScripts();
};

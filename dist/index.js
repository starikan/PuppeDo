/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 83
(module, __unused_webpack_exports, __webpack_require__) {

"use strict";
/* module decorator */ module = __webpack_require__.nmd(module);


var Module = __webpack_require__(339);
var path = __webpack_require__(928);

module.exports = function requireFromString(code, filename, opts) {
	if (typeof filename === 'object') {
		opts = filename;
		filename = undefined;
	}

	opts = opts || {};
	filename = filename || '';

	opts.appendPaths = opts.appendPaths || [];
	opts.prependPaths = opts.prependPaths || [];

	if (typeof code !== 'string') {
		throw new Error('code must be a string, not ' + typeof code);
	}

	var paths = Module._nodeModulePaths(path.dirname(filename));

	var parent = module.parent;
	var m = new Module(filename, parent);
	m.filename = filename;
	m.paths = [].concat(opts.prependPaths).concat(paths).concat(opts.appendPaths);
	m._compile(code, filename);

	var exports = m.exports;
	parent && parent.children && parent.children.splice(parent.children.indexOf(m), 1);

	return exports;
};


/***/ },

/***/ 339
(module) {

"use strict";
module.exports = require("module");

/***/ },

/***/ 587
(module, __unused_webpack_exports, __webpack_require__) {

(()=>{"use strict";var e={n:r=>{var n=r&&r.__esModule?()=>r.default:()=>r;return e.d(n,{a:n}),n},d:(r,n)=>{for(var i in n)e.o(n,i)&&!e.o(r,i)&&Object.defineProperty(r,i,{enumerable:!0,get:n[i]})},o:(e,r)=>Object.prototype.hasOwnProperty.call(e,r),r:e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})}},r={};e.r(r),e.d(r,{walkSync:()=>s});const n=__webpack_require__(928);var i=e.n(n);const t=__webpack_require__(896);var o=e.n(t);const s=(e,r={ignoreFolders:[],ignoreFiles:[],fullPathReturn:!0})=>{if(!e||"string"!=typeof e)return[];const n=r||{ignoreFolders:[],ignoreFiles:[]};n.ignoreFolders&&!Array.isArray(n.ignoreFolders)&&(n.ignoreFolders=[]),n.ignoreFiles&&!Array.isArray(n.ignoreFiles)&&(n.ignoreFiles=[]),n.includeExtensions&&!Array.isArray(n.includeExtensions)&&(n.includeExtensions=[]),n.onlyFiles&&!Array.isArray(n.onlyFiles)&&(n.onlyFiles=[]);const t=i().basename(e);if(!o().existsSync(e)||n.ignoreFolders?.includes(t))return[];if(void 0!==n.depth&&(Number.isNaN(n.depth)||n.depth<0))return[];if(!o().statSync(e).isDirectory())return[e];return o().readdirSync(e).map((r=>void 0===n.depth||n.depth>0?s(i().join(e,r),{...n,depth:n.depth?n.depth-1:void 0}):[])).flat().filter((e=>!n.ignoreFiles?.some((r=>e.endsWith(r))))).filter((e=>!n.includeExtensions?.length||n.includeExtensions.includes(i().parse(e).ext))).filter((e=>!n?.onlyFiles?.length||n.onlyFiles.includes(i().basename(e)))).filter((r=>n.fullPathReturn?r:i().join(e,r)))};module.exports=r})();
//# sourceMappingURL=index.js.map

/***/ },

/***/ 896
(module) {

"use strict";
module.exports = require("fs");

/***/ },

/***/ 928
(module) {

"use strict";
module.exports = require("path");

/***/ }

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			loaded: false,
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/node module decorator */
/******/ 	(() => {
/******/ 		__webpack_require__.nmd = (module) => {
/******/ 			module.paths = [];
/******/ 			if (!module.children) module.children = [];
/******/ 			return module;
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be in strict mode.
(() => {
"use strict";
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "default": () => (/* binding */ src)
});

// EXTERNAL MODULE: external "path"
var external_path_ = __webpack_require__(928);
var external_path_default = /*#__PURE__*/__webpack_require__.n(external_path_);
;// external "crypto"
const external_crypto_namespaceObject = require("crypto");
var external_crypto_default = /*#__PURE__*/__webpack_require__.n(external_crypto_namespaceObject);
;// external "vm"
const external_vm_namespaceObject = require("vm");
var external_vm_default = /*#__PURE__*/__webpack_require__.n(external_vm_namespaceObject);
;// ./src/Helpers.ts



/*
https://stackoverflow.com/questions/23975735/what-is-this-u001b9-syntax-of-choosing-what-color-text-appears-on-console

SANE = "\u001B[0m"

HIGH_INTENSITY = "\u001B[1m"
LOW_INTENSITY = "\u001B[2m"

ITALIC = "\u001B[3m"
UNDERLINE = "\u001B[4m"
BLINK = "\u001B[5m"
RAPID_BLINK = "\u001B[6m"
REVERSE_VIDEO = "\u001B[7m"
INVISIBLE_TEXT = "\u001B[8m"

BACKGROUND_BLACK = "\u001B[40m"
BACKGROUND_RED = "\u001B[41m"
BACKGROUND_GREEN = "\u001B[42m"
BACKGROUND_YELLOW = "\u001B[43m"
BACKGROUND_BLUE = "\u001B[44m"
BACKGROUND_MAGENTA = "\u001B[45m"
BACKGROUND_CYAN = "\u001B[46m"
BACKGROUND_WHITE = "\u001B[47m"
*/
let colors = function (colors) {
  colors[colors["sane"] = 0] = "sane";
  colors[colors["black"] = 30] = "black";
  colors[colors["red"] = 31] = "red";
  colors[colors["green"] = 32] = "green";
  colors[colors["yellow"] = 33] = "yellow";
  colors[colors["blue"] = 34] = "blue";
  colors[colors["magenta"] = 35] = "magenta";
  colors[colors["cyan"] = 36] = "cyan";
  colors[colors["white"] = 37] = "white";
  colors[colors["blackBackground"] = 40] = "blackBackground";
  colors[colors["redBackground"] = 41] = "redBackground";
  colors[colors["greenBackground"] = 42] = "greenBackground";
  colors[colors["yellowBackground"] = 43] = "yellowBackground";
  colors[colors["blueBackground"] = 44] = "blueBackground";
  colors[colors["magentaBackground"] = 45] = "magentaBackground";
  colors[colors["cyanBackground"] = 46] = "cyanBackground";
  colors[colors["whiteBackground"] = 47] = "whiteBackground";
  colors[colors["raw"] = colors.sane] = "raw";
  colors[colors["timer"] = colors.sane] = "timer";
  colors[colors["debug"] = colors.sane] = "debug";
  colors[colors["info"] = colors.cyan] = "info";
  colors[colors["test"] = colors.green] = "test";
  colors[colors["warn"] = colors.yellow] = "warn";
  colors[colors["error"] = colors.red] = "error";
  colors[colors["trace"] = colors.cyan] = "trace";
  colors[colors["env"] = colors.blue] = "env";
  return colors;
}({});

/**
 * This function creates a pause in the execution of the program for the specified number of milliseconds.
 *
 * @param ms - The number of milliseconds for which the program will pause.
 * @returns A promise that will be resolved after the specified number of milliseconds.
 */
function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

/**
 * Merges multiple objects into one.
 *
 * @param objects - Objects for merging.
 * @returns - The result of the merge.
 */
function mergeObjects(objects, uniqueArray = false) {
  /**
   * Recursive function for merging objects.
   *
   * @param target - The target object.
   * @param source - The source for merging.
   */
  function deepMerge(target, source) {
    // If source is arrays, merge with target:
    if (Array.isArray(source)) {
      const merged = Array.isArray(target) ? target.concat(source) : source;
      if (uniqueArray) {
        const seen = new Set();
        const deduped = [];
        for (const item of merged) {
          if (item === null || typeof item !== 'object' && typeof item !== 'function') {
            if (!seen.has(item)) {
              seen.add(item);
              deduped.push(item);
            }
          } else {
            deduped.push(item);
          }
        }
        return deduped;
      }
      return merged;
    }

    // If source is an object (but not an array)
    if (typeof source === 'object' && source !== null) {
      const result = typeof target !== 'object' || target === null || Array.isArray(target) ? {} : {
        ...target
      };
      for (const key of Object.keys(source)) {
        if (source[key] !== undefined) {
          if (Array.isArray(source[key])) {
            var _result$key;
            result[key] = deepMerge((_result$key = result[key]) !== null && _result$key !== void 0 ? _result$key : [], source[key]);
          } else if (typeof source[key] === 'object' && source[key] !== null) {
            var _result$key2;
            result[key] = deepMerge((_result$key2 = result[key]) !== null && _result$key2 !== void 0 ? _result$key2 : {}, source[key]);
          } else {
            result[key] = source[key];
          }
        }
      }
      return result;
    }
    return source;
  }

  // Initialize the result based on the type of the first element of the input array
  let result;
  if (objects.length > 0) {
    result = Array.isArray(objects[0]) ? [] : {};
  } else {
    result = {};
  }

  // Merge all passed objects
  for (const obj of objects) {
    result = deepMerge(result, obj);
  }
  return result;
}

/**
 * Deeply merges two objects, obj1 and obj2, based on the specified fieldsMerge.
 * The function returns a new object that combines the properties of obj1 and obj2.
 * If a property is present in both objects, the values are merged recursively.
 *
 * @param obj1 The first object to merge.
 * @param obj2 The second object to merge.
 * @param fieldsMerge An array of keys to merge recursively.
 * @returns A new object that combines the properties of obj1 and obj2.
 */
const deepMergeField = (obj1, obj2, fieldsMerge) => {
  const mergedFields = fieldsMerge.reduce((acc, v) => {
    var _obj1$v, _obj2$v;
    acc[v] = {
      ...((_obj1$v = obj1[v]) !== null && _obj1$v !== void 0 ? _obj1$v : {}),
      ...((_obj2$v = obj2[v]) !== null && _obj2$v !== void 0 ? _obj2$v : {})
    };
    return acc;
  }, {});
  const result = {
    ...obj1,
    ...obj2,
    ...mergedFields
  };
  return result;
};
const paintString = (str, color = 'sane') => {
  if (['sane', 'raw', 'timer', 'debug'].includes(color)) {
    return str;
  }
  return `\u001b[${colors[color] || 0}m${str}\u001b[0m`;
};
const blankSocket = {
  send: () => {
    // Do nothing
  },
  sendYAML: () => {
    // Do nothing
  }
};

/**
 * Returns an object with time information, including start and end times as a date and BigInt,
 * the difference between them in seconds, and a string representation of this difference.
 *
 * @param {Object} [options] - Optional parameters.
 * @param {bigint} [options.timeStartBigInt] - BigInt for the start of the time count.
 * @param {bigint} [options.timeEndBigInt] - BigInt for the end of the time count.
 * @param {Date} [options.timeStart] - Start date of the time count.
 * @param {Date} [options.timeEnd] - End date of the time count.
 * @returns {Object} - Object with time information.
 */
const getTimer = ({
  timeStartBigInt,
  timeEndBigInt,
  timeStart,
  timeEnd
} = {}) => {
  const timeStartBigIntResolved = timeStartBigInt !== null && timeStartBigInt !== void 0 ? timeStartBigInt : process.hrtime.bigint();
  const timeEndBigIntResolved = timeEndBigInt !== null && timeEndBigInt !== void 0 ? timeEndBigInt : process.hrtime.bigint();
  const timeStartResolved = timeStart !== null && timeStart !== void 0 ? timeStart : new Date();
  const timeEndResolved = timeEnd !== null && timeEnd !== void 0 ? timeEnd : new Date();
  const delta = Number(timeEndBigIntResolved - timeStartBigIntResolved) / 1e9;
  let deltaStr = `${delta.toFixed(3)} s.`;
  if (delta > 60) {
    deltaStr = `${Math.floor(delta / 60)} min. ${(delta % 60).toFixed(3)} s.`;
  }
  return {
    timeStart: timeStartResolved,
    timeEnd: timeEndResolved,
    timeStartBigInt: timeStartBigIntResolved,
    timeEndBigInt: timeEndBigIntResolved,
    deltaStr,
    delta
  };
};
const pick = (obj, fields) => Object.fromEntries(Object.entries(obj).filter(([key]) => fields.includes(key)));
const omit = (obj, fields) => Object.fromEntries(Object.entries(obj).filter(([key]) => !fields.includes(key)));
const getNowDateTime = (now = new Date(), format = 'YYYY-MM-DD_HH-mm-ss.SSS') => {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const milliseconds = String(now.getMilliseconds()).padStart(3, '0');
  const formatMap = {
    YYYY: year.toString(),
    MM: month,
    DD: day,
    HH: hours,
    mm: minutes,
    ss: seconds,
    SSS: milliseconds
  };
  return format.replace(/YYYY|MM|DD|HH|mm|ss|SSS/g, match => formatMap[match]);
};
const generateId = (length = 6) => external_crypto_default().randomBytes(length).toString('hex');
const runScriptInContext = (source, context, defaultValue = null) => {
  let result;
  if (source === '{}') {
    return {};
  }
  try {
    const script = new (external_vm_default()).Script(source);
    external_vm_default().createContext(context);
    result = script.runInContext(context);
  } catch (error) {
    if (defaultValue !== null && defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Can't evaluate ${source} = '${error.message}'`);
  }
  return result;
};
/**
 * Resolves aliases for a given key in the inputs object.
 *
 * @param alias The alias key to resolve.
 * @param inputs The inputs object to search for alias values.
 * @returns The resolved alias value.
 */

const resolveAliases = (alias, inputs) => {
  var _PPD_ALIASES$alias;
  const {
    PPD_ALIASES
  } = new Arguments().args;
  const allValues = [...Object.keys(PPD_ALIASES), ...Object.values(PPD_ALIASES)].flat();
  const duplicateValues = allValues.filter((value, index) => allValues.indexOf(value) !== index);
  if (duplicateValues.length) {
    throw new Error(`PPD_ALIASES contains duplicate keys: ${duplicateValues.join(', ')}`);
  }
  const variants = [...((_PPD_ALIASES$alias = PPD_ALIASES[alias]) !== null && _PPD_ALIASES$alias !== void 0 ? _PPD_ALIASES$alias : []), alias];
  const values = Object.values(pick(inputs, variants)).map(v => v || {});
  const result = values.length ? mergeObjects(values) : [];
  return result;
};
;// external "child_process"
const external_child_process_namespaceObject = require("child_process");
;// external "os"
const external_os_namespaceObject = require("os");
var external_os_default = /*#__PURE__*/__webpack_require__.n(external_os_namespaceObject);
;// ./src/AgentTree.ts
/* "It takes a stepIdParent, stepId, and payload, and then it either pushes a new step to the tree if there is no
stepIdParent, or it finds the stepIdParent and pushes a new step to its steps array."

The class has two public methods:

* `createStep`: It takes a stepIdParent, stepId, and payload, and then it either pushes a new step to the tree if there
is no stepIdParent, or it finds the stepIdParent and pushes a new step to its steps array.
* `updateStep`: It takes a stepId and a payload, finds the node in the tree with that stepId, and updates it with the
payload */
class AgentTree {
  tree = [];
  errorRoute = [];

  /**
   * It returns the tree
   * @returns The tree property of the class.
   */
  getTree(fieldsOnly) {
    if (!fieldsOnly) {
      return this.tree;
    }
    const filterFields = node => {
      const filteredNode = {
        stepId: node.stepId,
        stepIdParent: node.stepIdParent
      };
      fieldsOnly.forEach(field => {
        if (node[field] !== undefined) {
          filteredNode[field] = node[field];
        }
      });
      filteredNode.steps = node.steps ? node.steps.map(filterFields) : [];
      return filteredNode;
    };
    return this.tree.map(filterFields);
  }

  /**
   * "Find the node with the given stepId in the given tree."
   *
   * The function takes two parameters:
   *
   * * `tree`: The tree to search.
   * * `stepId`: The stepId to search for
   * @param {TreeEntryType[]} tree - The tree to search
   * @param {string} stepId - The stepId of the step you want to find.
   * @returns the first node that matches the stepId.
   */
  findNode(stepId, tree = this.tree) {
    for (const entry of tree) {
      if (entry.stepId === stepId) {
        return entry;
      }
      const found = this.findNode(stepId, entry.steps || []);
      if (found) {
        return found;
      }
    }
    return null;
  }

  /**
   * Finds the parent node of a given stepId in the tree.
   *
   * @param {string} stepId - The stepId to find the parent for.
   * @param {TreeEntryType[]} tree - The tree to search in. Defaults to the class's tree property.
   * @returns {(TreeEntryType | null)} The parent node if found, otherwise null.
   */
  findParent(stepId, tree = this.tree) {
    const node = this.findNode(stepId, tree);
    if (node) {
      return this.findNode(node.stepIdParent, tree);
    }
    return null;
  }

  /**
   * Finds the previous sibling of a node with the given stepId in the tree.
   *
   * @param {string} stepId - The stepId of the node to find the previous sibling for.
   * @param {TreeEntryType[]} tree - The tree to search in. Defaults to the class's tree property.
   * @returns {(TreeEntryType | null)} The previous sibling node if found, otherwise null.
   */
  findPreviousSibling(stepId, tree = this.tree) {
    const node = this.findParent(stepId, tree);
    let steps = [];
    if (!node) {
      steps = this.tree;
    } else {
      steps = node.steps || [];
    }
    const index = steps.findIndex(step => step.stepId === stepId);
    if (index !== -1 && index > 0) {
      return steps[index - 1];
    }
    return null;
  }

  /**
   * It takes a stepIdParent, stepId, and payload, and then it either pushes a new step to the tree if there is no
   * stepIdParent, or it finds the stepIdParent and pushes a new step to its steps array
   * @param {string | null} stepIdParent - The stepId of the parent step. If this is null, then the step is a top-level
   * step.
   * @param {string} stepId - The id of the step you want to create.
   * @param payload - Partial<TreeEntryDataType>
   * @returns The tree
   */
  createStep({
    stepIdParent = null,
    stepId,
    payload
  }) {
    if (this.findNode(stepId, this.tree)) {
      return this.updateStep({
        stepId,
        stepIdParent,
        payload
      });
    }

    // Top step
    if (!stepIdParent && stepId) {
      this.tree.push({
        stepId,
        ...payload
      });
    } else {
      const entry = this.findNode(stepIdParent, this.tree);
      if (entry) {
        var _entry$steps;
        (_entry$steps = entry.steps) !== null && _entry$steps !== void 0 ? _entry$steps : entry.steps = [];
        entry.steps.push({
          stepIdParent,
          stepId,
          ...payload
        });
      }
    }
    return this.getTree();
  }

  /**
   * It takes a stepId and a payload, finds the node in the tree with that stepId, and updates it with the payload
   * @param {string} stepId - The id of the step you want to update.
   * @param payload - Partial<TreeEntryDataType>
   * @returns The tree
   */
  updateStep({
    stepId,
    stepIdParent = null,
    payload
  }) {
    const entry = this.findNode(stepId, this.tree);
    if (entry) {
      for (const [key, value] of Object.entries(payload)) {
        entry[key] = value;
      }
      if (stepIdParent) {
        var _entry$stepIdParent;
        (_entry$stepIdParent = entry.stepIdParent) !== null && _entry$stepIdParent !== void 0 ? _entry$stepIdParent : entry.stepIdParent = stepIdParent;
      }
    } else {
      this.createStep({
        stepIdParent,
        stepId,
        payload
      });
    }
    return this.getTree();
  }

  /**
   * Adds an error to the error route.
   * @param {CreateStepParams} params - The parameters for creating a step.
   * @returns {TreeEntryType[]} The updated error route.
   */
  addError({
    stepId,
    payload
  }) {
    this.errorRoute.push({
      stepId,
      stepIdParent: null,
      ...payload
    });
    return this.errorRoute;
  }

  /**
   * Clears all errors from the error route.
   */
  clearErrors() {
    this.errorRoute = [];
  }

  /**
   * Gets all errors from the error route.
   * @returns {TreeEntryType[]} The current error route.
   */
  getErrors() {
    return this.errorRoute;
  }
}
;// ./src/Engines.ts




const DEFAULT_BROWSER = {
  type: 'browser',
  engine: 'playwright',
  runtime: 'run',
  browserName: 'chromium',
  headless: false,
  slowMo: 1
};
class Engines {
  static resolveBrowser(browserInput) {
    const ALLOW_BROWSER_TYPES = ['browser', 'electron'];
    const ALLOW_BROWSER_EGINES = ['puppeteer', 'playwright'];
    const ALLOW_BROWSER_MANES = ['chrome', 'chromium', 'firefox', 'webkit'];
    const browser = {
      ...DEFAULT_BROWSER,
      ...(browserInput || {})
    };
    if (!ALLOW_BROWSER_TYPES.includes(browser.type)) {
      throw new Error(`PuppeDo can't find this type of envitonment: "${browser.type}". Allow this types: ${ALLOW_BROWSER_TYPES}`);
    }
    if (!ALLOW_BROWSER_EGINES.includes(browser.engine) && (browser.type === 'browser' || browser.type === 'electron')) {
      throw new Error(`PuppeDo can't find engine: "${browser.engine}". Allow this engines: ${ALLOW_BROWSER_EGINES}`);
    }
    if (!ALLOW_BROWSER_MANES.includes(browser.browserName)) {
      throw new Error(`PuppeDo can't find this type of browser: "${browser.browserName}". Allow this types: ${ALLOW_BROWSER_MANES}`);
    }
    if (browser.type === 'browser' && browser.engine === 'playwright' && !['chromium', 'firefox', 'webkit'].includes(browser.browserName)) {
      throw new Error("Playwright supports only browsers: 'chromium', 'firefox', 'webkit'");
    }
    if (browser.type === 'browser' && browser.engine === 'puppeteer' && !['chrome', 'firefox'].includes(browser.browserName)) {
      throw new Error("Puppeteer supports only browsers: 'chrome', 'firefox'");
    }
    if (!['run', 'connect'].includes(browser.runtime)) {
      throw new Error('PuppeDo can run or connect to browser only');
    }
    if (browser.runtime === 'connect' && browser.type === 'browser') {
      throw new Error("PuppeDo can't connect to browser yet");
    }
    return browser;
  }
  static async runPlaywright(runnerData, state) {
    const {
      PPD_DEBUG_MODE = false
    } = new Arguments().args;
    const browserSettings = runnerData.browser;
    const {
      headless = true,
      slowMo = 0,
      args = [],
      browserName = 'chromium',
      windowSize = {},
      executablePath = '',
      timeout = 30000
    } = browserSettings || {};
    const {
      width = 1024,
      height = 768
    } = windowSize;
    const options = {
      headless,
      slowMo,
      args,
      executablePath,
      timeout
    };
    if (browserName === 'chromium') {
      options.devtools = PPD_DEBUG_MODE;
    }
    const playwright = require('playwright');
    const browser = await playwright[browserName].launch(options);
    const newState = {
      ...state,
      ...{
        browser
      }
    };
    const addedPageState = await Engines.addPage(newState, runnerData, {
      width,
      height
    });
    return {
      ...newState,
      ...addedPageState
    };
  }
  static async connectPlaywright(webSocketDebuggerUrl, slowMo, windowSize, timeout, browserName) {
    const playwright = require('playwright');
    const browser = await playwright[browserName].connect({
      wsEndpoint: webSocketDebuggerUrl,
      slowMo,
      timeout
    });
    const contexts = await browser.contexts({
      ignoreHTTPSErrors: true
    });
    const pagesRaw = await contexts.pages();
    if (!pagesRaw.length) {
      throw new Error('Can`t find any pages in connection');
    }
    const pages = {
      main: pagesRaw[0]
    };
    const {
      width,
      height
    } = windowSize;
    if (width && height) {
      await pages.main.setViewportSize({
        width,
        height
      });
    }
    return {
      browser,
      pages
    };
  }
  static async runElectron(browserSettings, envName, envsId) {
    const {
      runtimeEnv = {}
    } = browserSettings;
    const {
      runtimeExecutable,
      program = '',
      cwd = '',
      args: browserArgs = [],
      env: browserEnv = {},
      secondsToStartApp = 30,
      secondsDelayAfterStartApp = 0
    } = runtimeEnv;
    const runArgs = [program, ...browserArgs];
    if (runtimeExecutable) {
      process.env = {
        ...process.env,
        ...browserEnv
      };
      const prc = (0,external_child_process_namespaceObject.spawn)(runtimeExecutable, runArgs, {
        cwd,
        env: process.env,
        shell: true
      });
      if (prc) {
        new Environment().getLogger(envsId).exporter.saveToFile(`${envName}.log`, '');
        prc.stdout.on('data', data => {
          new Environment().getLogger(envsId).exporter.appendToFile(`${envName}.log`, String(data));
        });
      }
      let connectionTryes = 0;
      while (connectionTryes < secondsToStartApp) {
        try {
          const {
            browser,
            pages
          } = await Engines.connectElectron(browserSettings);
          await sleep(secondsDelayAfterStartApp * 1000);
          return {
            browser,
            pages,
            pid: prc.pid
          };
        } catch {
          await sleep(1000);
          connectionTryes += 1;
        }
      }
    }
    throw new Error(`Can't run Electron ${runtimeExecutable}`);
  }
  static async connectElectron(browserSettings) {
    const {
      urlDevtoolsJson,
      windowSize = {},
      slowMo = 0,
      engine = 'puppeteer',
      browserName,
      timeout = 30000
    } = browserSettings || {};
    if (urlDevtoolsJson) {
      const jsonPagesResponse = await fetch(`${urlDevtoolsJson}json`);
      if (!jsonPagesResponse.ok) {
        throw new Error(`Failed to fetch pages JSON: ${jsonPagesResponse.statusText}`);
      }
      const jsonBrowserResponse = await fetch(`${urlDevtoolsJson}json/version`);
      if (!jsonBrowserResponse.ok) {
        throw new Error(`Failed to fetch browser version JSON: ${jsonBrowserResponse.statusText}`);
      }
      const jsonPages = await jsonPagesResponse.json();
      const jsonBrowser = await jsonBrowserResponse.json();
      if (!jsonBrowser || !jsonPages) {
        throw new Error(`Can't connect to ${urlDevtoolsJson}`);
      }
      const {
        webSocketDebuggerUrl
      } = jsonBrowser;
      if (!webSocketDebuggerUrl) {
        throw new Error('webSocketDebuggerUrl empty. Possibly wrong Electron version running');
      }
      if (engine === 'puppeteer') {
        const {
          browser,
          pages
        } = await Engines.connectPuppeteer(webSocketDebuggerUrl, slowMo, windowSize, timeout);
        return {
          browser,
          pages
        };
      }
      if (engine === 'playwright') {
        const {
          browser,
          pages
        } = await Engines.connectPlaywright(webSocketDebuggerUrl, slowMo, windowSize, timeout, browserName);
        return {
          browser,
          pages
        };
      }
      throw new Error('Can`t find any supported browser engine in environment');
    }
    throw new Error(`Can't connect to Electron ${urlDevtoolsJson}`);
  }
  static async runPuppeteer(runnerData, state) {
    const {
      PPD_DEBUG_MODE = false
    } = new Arguments().args;
    const browserSettings = runnerData.browser;
    const {
      headless = true,
      slowMo = 0,
      args = [],
      windowSize = {},
      browserName: product = 'chrome',
      executablePath = '',
      timeout = 30000
    } = browserSettings;
    const {
      width = 1024,
      height = 768
    } = windowSize;
    const puppeteer = require('puppeteer');
    const browser = await puppeteer.launch({
      headless,
      slowMo,
      args,
      devtools: PPD_DEBUG_MODE,
      product,
      ignoreHTTPSErrors: true,
      defaultViewport: {
        width,
        height
      },
      executablePath,
      timeout
    });
    const pagesExists = await browser.pages();
    const pages = {
      main: pagesExists[0]
    };
    const newState = {
      ...state,
      ...{
        browser,
        pages
      }
    };
    return newState;
  }
  static async connectPuppeteer(webSocketDebuggerUrl, slowMo, windowSize, timeout) {
    const puppeteer = require('puppeteer');
    const browser = await puppeteer.connect({
      browserWSEndpoint: webSocketDebuggerUrl,
      ignoreHTTPSErrors: true,
      slowMo,
      timeout
    });
    const pagesRaw = await browser.pages();
    if (!pagesRaw.length) {
      throw new Error('Can`t find any pages in connection');
    }
    const pages = {
      main: pagesRaw[0]
    };
    const {
      width,
      height
    } = windowSize;
    if (width && height) {
      await pages.main.setViewport({
        width,
        height
      });
    }
    return {
      browser,
      pages
    };
  }
  static async addPage(state, runnerData, options = {}, name = 'main') {
    const {
      width = 1024,
      height = 768
    } = options;
    const {
      browser
    } = state;
    const browserSettings = runnerData.browser;
    let page = null;
    if (browserSettings.engine === 'puppeteer') {
      page = await browser.newPage();
      if (width && height) {
        await page.setViewport({
          width,
          height
        });
      }
    }
    if (browserSettings.engine === 'playwright') {
      page = await browser.newPage({
        viewport: {
          width,
          height
        },
        ignoreHTTPSErrors: true
      });
      // if (width && height) {
      //   await page.setViewportSize({ width, height });
      // }
    }
    if (!page) {
      throw new Error('Cant add new page');
    }
    const newState = {
      ...state
    };
    newState.pages = {
      ...newState.pages,
      ...{
        [name]: page
      }
    };
    return newState;
  }
}
// EXTERNAL MODULE: ./node_modules/@puppedo/walk-sync/dist/index.js
var dist = __webpack_require__(587);
// EXTERNAL MODULE: external "fs"
var external_fs_ = __webpack_require__(896);
var external_fs_default = /*#__PURE__*/__webpack_require__.n(external_fs_);
;// ./node_modules/js-yaml/dist/js-yaml.mjs

/*! js-yaml 4.1.1 https://github.com/nodeca/js-yaml @license MIT */
function isNothing(subject) {
  return (typeof subject === 'undefined') || (subject === null);
}


function isObject(subject) {
  return (typeof subject === 'object') && (subject !== null);
}


function toArray(sequence) {
  if (Array.isArray(sequence)) return sequence;
  else if (isNothing(sequence)) return [];

  return [ sequence ];
}


function extend(target, source) {
  var index, length, key, sourceKeys;

  if (source) {
    sourceKeys = Object.keys(source);

    for (index = 0, length = sourceKeys.length; index < length; index += 1) {
      key = sourceKeys[index];
      target[key] = source[key];
    }
  }

  return target;
}


function repeat(string, count) {
  var result = '', cycle;

  for (cycle = 0; cycle < count; cycle += 1) {
    result += string;
  }

  return result;
}


function isNegativeZero(number) {
  return (number === 0) && (Number.NEGATIVE_INFINITY === 1 / number);
}


var isNothing_1      = isNothing;
var isObject_1       = isObject;
var toArray_1        = toArray;
var repeat_1         = repeat;
var isNegativeZero_1 = isNegativeZero;
var extend_1         = extend;

var common = {
	isNothing: isNothing_1,
	isObject: isObject_1,
	toArray: toArray_1,
	repeat: repeat_1,
	isNegativeZero: isNegativeZero_1,
	extend: extend_1
};

// YAML error class. http://stackoverflow.com/questions/8458984


function formatError(exception, compact) {
  var where = '', message = exception.reason || '(unknown reason)';

  if (!exception.mark) return message;

  if (exception.mark.name) {
    where += 'in "' + exception.mark.name + '" ';
  }

  where += '(' + (exception.mark.line + 1) + ':' + (exception.mark.column + 1) + ')';

  if (!compact && exception.mark.snippet) {
    where += '\n\n' + exception.mark.snippet;
  }

  return message + ' ' + where;
}


function YAMLException$1(reason, mark) {
  // Super constructor
  Error.call(this);

  this.name = 'YAMLException';
  this.reason = reason;
  this.mark = mark;
  this.message = formatError(this, false);

  // Include stack trace in error object
  if (Error.captureStackTrace) {
    // Chrome and NodeJS
    Error.captureStackTrace(this, this.constructor);
  } else {
    // FF, IE 10+ and Safari 6+. Fallback for others
    this.stack = (new Error()).stack || '';
  }
}


// Inherit from Error
YAMLException$1.prototype = Object.create(Error.prototype);
YAMLException$1.prototype.constructor = YAMLException$1;


YAMLException$1.prototype.toString = function toString(compact) {
  return this.name + ': ' + formatError(this, compact);
};


var exception = YAMLException$1;

// get snippet for a single line, respecting maxLength
function getLine(buffer, lineStart, lineEnd, position, maxLineLength) {
  var head = '';
  var tail = '';
  var maxHalfLength = Math.floor(maxLineLength / 2) - 1;

  if (position - lineStart > maxHalfLength) {
    head = ' ... ';
    lineStart = position - maxHalfLength + head.length;
  }

  if (lineEnd - position > maxHalfLength) {
    tail = ' ...';
    lineEnd = position + maxHalfLength - tail.length;
  }

  return {
    str: head + buffer.slice(lineStart, lineEnd).replace(/\t/g, '→') + tail,
    pos: position - lineStart + head.length // relative position
  };
}


function padStart(string, max) {
  return common.repeat(' ', max - string.length) + string;
}


function makeSnippet(mark, options) {
  options = Object.create(options || null);

  if (!mark.buffer) return null;

  if (!options.maxLength) options.maxLength = 79;
  if (typeof options.indent      !== 'number') options.indent      = 1;
  if (typeof options.linesBefore !== 'number') options.linesBefore = 3;
  if (typeof options.linesAfter  !== 'number') options.linesAfter  = 2;

  var re = /\r?\n|\r|\0/g;
  var lineStarts = [ 0 ];
  var lineEnds = [];
  var match;
  var foundLineNo = -1;

  while ((match = re.exec(mark.buffer))) {
    lineEnds.push(match.index);
    lineStarts.push(match.index + match[0].length);

    if (mark.position <= match.index && foundLineNo < 0) {
      foundLineNo = lineStarts.length - 2;
    }
  }

  if (foundLineNo < 0) foundLineNo = lineStarts.length - 1;

  var result = '', i, line;
  var lineNoLength = Math.min(mark.line + options.linesAfter, lineEnds.length).toString().length;
  var maxLineLength = options.maxLength - (options.indent + lineNoLength + 3);

  for (i = 1; i <= options.linesBefore; i++) {
    if (foundLineNo - i < 0) break;
    line = getLine(
      mark.buffer,
      lineStarts[foundLineNo - i],
      lineEnds[foundLineNo - i],
      mark.position - (lineStarts[foundLineNo] - lineStarts[foundLineNo - i]),
      maxLineLength
    );
    result = common.repeat(' ', options.indent) + padStart((mark.line - i + 1).toString(), lineNoLength) +
      ' | ' + line.str + '\n' + result;
  }

  line = getLine(mark.buffer, lineStarts[foundLineNo], lineEnds[foundLineNo], mark.position, maxLineLength);
  result += common.repeat(' ', options.indent) + padStart((mark.line + 1).toString(), lineNoLength) +
    ' | ' + line.str + '\n';
  result += common.repeat('-', options.indent + lineNoLength + 3 + line.pos) + '^' + '\n';

  for (i = 1; i <= options.linesAfter; i++) {
    if (foundLineNo + i >= lineEnds.length) break;
    line = getLine(
      mark.buffer,
      lineStarts[foundLineNo + i],
      lineEnds[foundLineNo + i],
      mark.position - (lineStarts[foundLineNo] - lineStarts[foundLineNo + i]),
      maxLineLength
    );
    result += common.repeat(' ', options.indent) + padStart((mark.line + i + 1).toString(), lineNoLength) +
      ' | ' + line.str + '\n';
  }

  return result.replace(/\n$/, '');
}


var snippet = makeSnippet;

var TYPE_CONSTRUCTOR_OPTIONS = [
  'kind',
  'multi',
  'resolve',
  'construct',
  'instanceOf',
  'predicate',
  'represent',
  'representName',
  'defaultStyle',
  'styleAliases'
];

var YAML_NODE_KINDS = [
  'scalar',
  'sequence',
  'mapping'
];

function compileStyleAliases(map) {
  var result = {};

  if (map !== null) {
    Object.keys(map).forEach(function (style) {
      map[style].forEach(function (alias) {
        result[String(alias)] = style;
      });
    });
  }

  return result;
}

function Type$1(tag, options) {
  options = options || {};

  Object.keys(options).forEach(function (name) {
    if (TYPE_CONSTRUCTOR_OPTIONS.indexOf(name) === -1) {
      throw new exception('Unknown option "' + name + '" is met in definition of "' + tag + '" YAML type.');
    }
  });

  // TODO: Add tag format check.
  this.options       = options; // keep original options in case user wants to extend this type later
  this.tag           = tag;
  this.kind          = options['kind']          || null;
  this.resolve       = options['resolve']       || function () { return true; };
  this.construct     = options['construct']     || function (data) { return data; };
  this.instanceOf    = options['instanceOf']    || null;
  this.predicate     = options['predicate']     || null;
  this.represent     = options['represent']     || null;
  this.representName = options['representName'] || null;
  this.defaultStyle  = options['defaultStyle']  || null;
  this.multi         = options['multi']         || false;
  this.styleAliases  = compileStyleAliases(options['styleAliases'] || null);

  if (YAML_NODE_KINDS.indexOf(this.kind) === -1) {
    throw new exception('Unknown kind "' + this.kind + '" is specified for "' + tag + '" YAML type.');
  }
}

var type = Type$1;

/*eslint-disable max-len*/





function compileList(schema, name) {
  var result = [];

  schema[name].forEach(function (currentType) {
    var newIndex = result.length;

    result.forEach(function (previousType, previousIndex) {
      if (previousType.tag === currentType.tag &&
          previousType.kind === currentType.kind &&
          previousType.multi === currentType.multi) {

        newIndex = previousIndex;
      }
    });

    result[newIndex] = currentType;
  });

  return result;
}


function compileMap(/* lists... */) {
  var result = {
        scalar: {},
        sequence: {},
        mapping: {},
        fallback: {},
        multi: {
          scalar: [],
          sequence: [],
          mapping: [],
          fallback: []
        }
      }, index, length;

  function collectType(type) {
    if (type.multi) {
      result.multi[type.kind].push(type);
      result.multi['fallback'].push(type);
    } else {
      result[type.kind][type.tag] = result['fallback'][type.tag] = type;
    }
  }

  for (index = 0, length = arguments.length; index < length; index += 1) {
    arguments[index].forEach(collectType);
  }
  return result;
}


function Schema$1(definition) {
  return this.extend(definition);
}


Schema$1.prototype.extend = function extend(definition) {
  var implicit = [];
  var explicit = [];

  if (definition instanceof type) {
    // Schema.extend(type)
    explicit.push(definition);

  } else if (Array.isArray(definition)) {
    // Schema.extend([ type1, type2, ... ])
    explicit = explicit.concat(definition);

  } else if (definition && (Array.isArray(definition.implicit) || Array.isArray(definition.explicit))) {
    // Schema.extend({ explicit: [ type1, type2, ... ], implicit: [ type1, type2, ... ] })
    if (definition.implicit) implicit = implicit.concat(definition.implicit);
    if (definition.explicit) explicit = explicit.concat(definition.explicit);

  } else {
    throw new exception('Schema.extend argument should be a Type, [ Type ], ' +
      'or a schema definition ({ implicit: [...], explicit: [...] })');
  }

  implicit.forEach(function (type$1) {
    if (!(type$1 instanceof type)) {
      throw new exception('Specified list of YAML types (or a single Type object) contains a non-Type object.');
    }

    if (type$1.loadKind && type$1.loadKind !== 'scalar') {
      throw new exception('There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.');
    }

    if (type$1.multi) {
      throw new exception('There is a multi type in the implicit list of a schema. Multi tags can only be listed as explicit.');
    }
  });

  explicit.forEach(function (type$1) {
    if (!(type$1 instanceof type)) {
      throw new exception('Specified list of YAML types (or a single Type object) contains a non-Type object.');
    }
  });

  var result = Object.create(Schema$1.prototype);

  result.implicit = (this.implicit || []).concat(implicit);
  result.explicit = (this.explicit || []).concat(explicit);

  result.compiledImplicit = compileList(result, 'implicit');
  result.compiledExplicit = compileList(result, 'explicit');
  result.compiledTypeMap  = compileMap(result.compiledImplicit, result.compiledExplicit);

  return result;
};


var schema = Schema$1;

var str = new type('tag:yaml.org,2002:str', {
  kind: 'scalar',
  construct: function (data) { return data !== null ? data : ''; }
});

var seq = new type('tag:yaml.org,2002:seq', {
  kind: 'sequence',
  construct: function (data) { return data !== null ? data : []; }
});

var map = new type('tag:yaml.org,2002:map', {
  kind: 'mapping',
  construct: function (data) { return data !== null ? data : {}; }
});

var failsafe = new schema({
  explicit: [
    str,
    seq,
    map
  ]
});

function resolveYamlNull(data) {
  if (data === null) return true;

  var max = data.length;

  return (max === 1 && data === '~') ||
         (max === 4 && (data === 'null' || data === 'Null' || data === 'NULL'));
}

function constructYamlNull() {
  return null;
}

function isNull(object) {
  return object === null;
}

var _null = new type('tag:yaml.org,2002:null', {
  kind: 'scalar',
  resolve: resolveYamlNull,
  construct: constructYamlNull,
  predicate: isNull,
  represent: {
    canonical: function () { return '~';    },
    lowercase: function () { return 'null'; },
    uppercase: function () { return 'NULL'; },
    camelcase: function () { return 'Null'; },
    empty:     function () { return '';     }
  },
  defaultStyle: 'lowercase'
});

function resolveYamlBoolean(data) {
  if (data === null) return false;

  var max = data.length;

  return (max === 4 && (data === 'true' || data === 'True' || data === 'TRUE')) ||
         (max === 5 && (data === 'false' || data === 'False' || data === 'FALSE'));
}

function constructYamlBoolean(data) {
  return data === 'true' ||
         data === 'True' ||
         data === 'TRUE';
}

function isBoolean(object) {
  return Object.prototype.toString.call(object) === '[object Boolean]';
}

var bool = new type('tag:yaml.org,2002:bool', {
  kind: 'scalar',
  resolve: resolveYamlBoolean,
  construct: constructYamlBoolean,
  predicate: isBoolean,
  represent: {
    lowercase: function (object) { return object ? 'true' : 'false'; },
    uppercase: function (object) { return object ? 'TRUE' : 'FALSE'; },
    camelcase: function (object) { return object ? 'True' : 'False'; }
  },
  defaultStyle: 'lowercase'
});

function isHexCode(c) {
  return ((0x30/* 0 */ <= c) && (c <= 0x39/* 9 */)) ||
         ((0x41/* A */ <= c) && (c <= 0x46/* F */)) ||
         ((0x61/* a */ <= c) && (c <= 0x66/* f */));
}

function isOctCode(c) {
  return ((0x30/* 0 */ <= c) && (c <= 0x37/* 7 */));
}

function isDecCode(c) {
  return ((0x30/* 0 */ <= c) && (c <= 0x39/* 9 */));
}

function resolveYamlInteger(data) {
  if (data === null) return false;

  var max = data.length,
      index = 0,
      hasDigits = false,
      ch;

  if (!max) return false;

  ch = data[index];

  // sign
  if (ch === '-' || ch === '+') {
    ch = data[++index];
  }

  if (ch === '0') {
    // 0
    if (index + 1 === max) return true;
    ch = data[++index];

    // base 2, base 8, base 16

    if (ch === 'b') {
      // base 2
      index++;

      for (; index < max; index++) {
        ch = data[index];
        if (ch === '_') continue;
        if (ch !== '0' && ch !== '1') return false;
        hasDigits = true;
      }
      return hasDigits && ch !== '_';
    }


    if (ch === 'x') {
      // base 16
      index++;

      for (; index < max; index++) {
        ch = data[index];
        if (ch === '_') continue;
        if (!isHexCode(data.charCodeAt(index))) return false;
        hasDigits = true;
      }
      return hasDigits && ch !== '_';
    }


    if (ch === 'o') {
      // base 8
      index++;

      for (; index < max; index++) {
        ch = data[index];
        if (ch === '_') continue;
        if (!isOctCode(data.charCodeAt(index))) return false;
        hasDigits = true;
      }
      return hasDigits && ch !== '_';
    }
  }

  // base 10 (except 0)

  // value should not start with `_`;
  if (ch === '_') return false;

  for (; index < max; index++) {
    ch = data[index];
    if (ch === '_') continue;
    if (!isDecCode(data.charCodeAt(index))) {
      return false;
    }
    hasDigits = true;
  }

  // Should have digits and should not end with `_`
  if (!hasDigits || ch === '_') return false;

  return true;
}

function constructYamlInteger(data) {
  var value = data, sign = 1, ch;

  if (value.indexOf('_') !== -1) {
    value = value.replace(/_/g, '');
  }

  ch = value[0];

  if (ch === '-' || ch === '+') {
    if (ch === '-') sign = -1;
    value = value.slice(1);
    ch = value[0];
  }

  if (value === '0') return 0;

  if (ch === '0') {
    if (value[1] === 'b') return sign * parseInt(value.slice(2), 2);
    if (value[1] === 'x') return sign * parseInt(value.slice(2), 16);
    if (value[1] === 'o') return sign * parseInt(value.slice(2), 8);
  }

  return sign * parseInt(value, 10);
}

function isInteger(object) {
  return (Object.prototype.toString.call(object)) === '[object Number]' &&
         (object % 1 === 0 && !common.isNegativeZero(object));
}

var js_yaml_int = new type('tag:yaml.org,2002:int', {
  kind: 'scalar',
  resolve: resolveYamlInteger,
  construct: constructYamlInteger,
  predicate: isInteger,
  represent: {
    binary:      function (obj) { return obj >= 0 ? '0b' + obj.toString(2) : '-0b' + obj.toString(2).slice(1); },
    octal:       function (obj) { return obj >= 0 ? '0o'  + obj.toString(8) : '-0o'  + obj.toString(8).slice(1); },
    decimal:     function (obj) { return obj.toString(10); },
    /* eslint-disable max-len */
    hexadecimal: function (obj) { return obj >= 0 ? '0x' + obj.toString(16).toUpperCase() :  '-0x' + obj.toString(16).toUpperCase().slice(1); }
  },
  defaultStyle: 'decimal',
  styleAliases: {
    binary:      [ 2,  'bin' ],
    octal:       [ 8,  'oct' ],
    decimal:     [ 10, 'dec' ],
    hexadecimal: [ 16, 'hex' ]
  }
});

var YAML_FLOAT_PATTERN = new RegExp(
  // 2.5e4, 2.5 and integers
  '^(?:[-+]?(?:[0-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?' +
  // .2e4, .2
  // special case, seems not from spec
  '|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?' +
  // .inf
  '|[-+]?\\.(?:inf|Inf|INF)' +
  // .nan
  '|\\.(?:nan|NaN|NAN))$');

function resolveYamlFloat(data) {
  if (data === null) return false;

  if (!YAML_FLOAT_PATTERN.test(data) ||
      // Quick hack to not allow integers end with `_`
      // Probably should update regexp & check speed
      data[data.length - 1] === '_') {
    return false;
  }

  return true;
}

function constructYamlFloat(data) {
  var value, sign;

  value  = data.replace(/_/g, '').toLowerCase();
  sign   = value[0] === '-' ? -1 : 1;

  if ('+-'.indexOf(value[0]) >= 0) {
    value = value.slice(1);
  }

  if (value === '.inf') {
    return (sign === 1) ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;

  } else if (value === '.nan') {
    return NaN;
  }
  return sign * parseFloat(value, 10);
}


var SCIENTIFIC_WITHOUT_DOT = /^[-+]?[0-9]+e/;

function representYamlFloat(object, style) {
  var res;

  if (isNaN(object)) {
    switch (style) {
      case 'lowercase': return '.nan';
      case 'uppercase': return '.NAN';
      case 'camelcase': return '.NaN';
    }
  } else if (Number.POSITIVE_INFINITY === object) {
    switch (style) {
      case 'lowercase': return '.inf';
      case 'uppercase': return '.INF';
      case 'camelcase': return '.Inf';
    }
  } else if (Number.NEGATIVE_INFINITY === object) {
    switch (style) {
      case 'lowercase': return '-.inf';
      case 'uppercase': return '-.INF';
      case 'camelcase': return '-.Inf';
    }
  } else if (common.isNegativeZero(object)) {
    return '-0.0';
  }

  res = object.toString(10);

  // JS stringifier can build scientific format without dots: 5e-100,
  // while YAML requres dot: 5.e-100. Fix it with simple hack

  return SCIENTIFIC_WITHOUT_DOT.test(res) ? res.replace('e', '.e') : res;
}

function isFloat(object) {
  return (Object.prototype.toString.call(object) === '[object Number]') &&
         (object % 1 !== 0 || common.isNegativeZero(object));
}

var js_yaml_float = new type('tag:yaml.org,2002:float', {
  kind: 'scalar',
  resolve: resolveYamlFloat,
  construct: constructYamlFloat,
  predicate: isFloat,
  represent: representYamlFloat,
  defaultStyle: 'lowercase'
});

var json = failsafe.extend({
  implicit: [
    _null,
    bool,
    js_yaml_int,
    js_yaml_float
  ]
});

var core = json;

var YAML_DATE_REGEXP = new RegExp(
  '^([0-9][0-9][0-9][0-9])'          + // [1] year
  '-([0-9][0-9])'                    + // [2] month
  '-([0-9][0-9])$');                   // [3] day

var YAML_TIMESTAMP_REGEXP = new RegExp(
  '^([0-9][0-9][0-9][0-9])'          + // [1] year
  '-([0-9][0-9]?)'                   + // [2] month
  '-([0-9][0-9]?)'                   + // [3] day
  '(?:[Tt]|[ \\t]+)'                 + // ...
  '([0-9][0-9]?)'                    + // [4] hour
  ':([0-9][0-9])'                    + // [5] minute
  ':([0-9][0-9])'                    + // [6] second
  '(?:\\.([0-9]*))?'                 + // [7] fraction
  '(?:[ \\t]*(Z|([-+])([0-9][0-9]?)' + // [8] tz [9] tz_sign [10] tz_hour
  '(?::([0-9][0-9]))?))?$');           // [11] tz_minute

function resolveYamlTimestamp(data) {
  if (data === null) return false;
  if (YAML_DATE_REGEXP.exec(data) !== null) return true;
  if (YAML_TIMESTAMP_REGEXP.exec(data) !== null) return true;
  return false;
}

function constructYamlTimestamp(data) {
  var match, year, month, day, hour, minute, second, fraction = 0,
      delta = null, tz_hour, tz_minute, date;

  match = YAML_DATE_REGEXP.exec(data);
  if (match === null) match = YAML_TIMESTAMP_REGEXP.exec(data);

  if (match === null) throw new Error('Date resolve error');

  // match: [1] year [2] month [3] day

  year = +(match[1]);
  month = +(match[2]) - 1; // JS month starts with 0
  day = +(match[3]);

  if (!match[4]) { // no hour
    return new Date(Date.UTC(year, month, day));
  }

  // match: [4] hour [5] minute [6] second [7] fraction

  hour = +(match[4]);
  minute = +(match[5]);
  second = +(match[6]);

  if (match[7]) {
    fraction = match[7].slice(0, 3);
    while (fraction.length < 3) { // milli-seconds
      fraction += '0';
    }
    fraction = +fraction;
  }

  // match: [8] tz [9] tz_sign [10] tz_hour [11] tz_minute

  if (match[9]) {
    tz_hour = +(match[10]);
    tz_minute = +(match[11] || 0);
    delta = (tz_hour * 60 + tz_minute) * 60000; // delta in mili-seconds
    if (match[9] === '-') delta = -delta;
  }

  date = new Date(Date.UTC(year, month, day, hour, minute, second, fraction));

  if (delta) date.setTime(date.getTime() - delta);

  return date;
}

function representYamlTimestamp(object /*, style*/) {
  return object.toISOString();
}

var timestamp = new type('tag:yaml.org,2002:timestamp', {
  kind: 'scalar',
  resolve: resolveYamlTimestamp,
  construct: constructYamlTimestamp,
  instanceOf: Date,
  represent: representYamlTimestamp
});

function resolveYamlMerge(data) {
  return data === '<<' || data === null;
}

var merge = new type('tag:yaml.org,2002:merge', {
  kind: 'scalar',
  resolve: resolveYamlMerge
});

/*eslint-disable no-bitwise*/





// [ 64, 65, 66 ] -> [ padding, CR, LF ]
var BASE64_MAP = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=\n\r';


function resolveYamlBinary(data) {
  if (data === null) return false;

  var code, idx, bitlen = 0, max = data.length, map = BASE64_MAP;

  // Convert one by one.
  for (idx = 0; idx < max; idx++) {
    code = map.indexOf(data.charAt(idx));

    // Skip CR/LF
    if (code > 64) continue;

    // Fail on illegal characters
    if (code < 0) return false;

    bitlen += 6;
  }

  // If there are any bits left, source was corrupted
  return (bitlen % 8) === 0;
}

function constructYamlBinary(data) {
  var idx, tailbits,
      input = data.replace(/[\r\n=]/g, ''), // remove CR/LF & padding to simplify scan
      max = input.length,
      map = BASE64_MAP,
      bits = 0,
      result = [];

  // Collect by 6*4 bits (3 bytes)

  for (idx = 0; idx < max; idx++) {
    if ((idx % 4 === 0) && idx) {
      result.push((bits >> 16) & 0xFF);
      result.push((bits >> 8) & 0xFF);
      result.push(bits & 0xFF);
    }

    bits = (bits << 6) | map.indexOf(input.charAt(idx));
  }

  // Dump tail

  tailbits = (max % 4) * 6;

  if (tailbits === 0) {
    result.push((bits >> 16) & 0xFF);
    result.push((bits >> 8) & 0xFF);
    result.push(bits & 0xFF);
  } else if (tailbits === 18) {
    result.push((bits >> 10) & 0xFF);
    result.push((bits >> 2) & 0xFF);
  } else if (tailbits === 12) {
    result.push((bits >> 4) & 0xFF);
  }

  return new Uint8Array(result);
}

function representYamlBinary(object /*, style*/) {
  var result = '', bits = 0, idx, tail,
      max = object.length,
      map = BASE64_MAP;

  // Convert every three bytes to 4 ASCII characters.

  for (idx = 0; idx < max; idx++) {
    if ((idx % 3 === 0) && idx) {
      result += map[(bits >> 18) & 0x3F];
      result += map[(bits >> 12) & 0x3F];
      result += map[(bits >> 6) & 0x3F];
      result += map[bits & 0x3F];
    }

    bits = (bits << 8) + object[idx];
  }

  // Dump tail

  tail = max % 3;

  if (tail === 0) {
    result += map[(bits >> 18) & 0x3F];
    result += map[(bits >> 12) & 0x3F];
    result += map[(bits >> 6) & 0x3F];
    result += map[bits & 0x3F];
  } else if (tail === 2) {
    result += map[(bits >> 10) & 0x3F];
    result += map[(bits >> 4) & 0x3F];
    result += map[(bits << 2) & 0x3F];
    result += map[64];
  } else if (tail === 1) {
    result += map[(bits >> 2) & 0x3F];
    result += map[(bits << 4) & 0x3F];
    result += map[64];
    result += map[64];
  }

  return result;
}

function isBinary(obj) {
  return Object.prototype.toString.call(obj) ===  '[object Uint8Array]';
}

var binary = new type('tag:yaml.org,2002:binary', {
  kind: 'scalar',
  resolve: resolveYamlBinary,
  construct: constructYamlBinary,
  predicate: isBinary,
  represent: representYamlBinary
});

var _hasOwnProperty$3 = Object.prototype.hasOwnProperty;
var _toString$2       = Object.prototype.toString;

function resolveYamlOmap(data) {
  if (data === null) return true;

  var objectKeys = [], index, length, pair, pairKey, pairHasKey,
      object = data;

  for (index = 0, length = object.length; index < length; index += 1) {
    pair = object[index];
    pairHasKey = false;

    if (_toString$2.call(pair) !== '[object Object]') return false;

    for (pairKey in pair) {
      if (_hasOwnProperty$3.call(pair, pairKey)) {
        if (!pairHasKey) pairHasKey = true;
        else return false;
      }
    }

    if (!pairHasKey) return false;

    if (objectKeys.indexOf(pairKey) === -1) objectKeys.push(pairKey);
    else return false;
  }

  return true;
}

function constructYamlOmap(data) {
  return data !== null ? data : [];
}

var omap = new type('tag:yaml.org,2002:omap', {
  kind: 'sequence',
  resolve: resolveYamlOmap,
  construct: constructYamlOmap
});

var _toString$1 = Object.prototype.toString;

function resolveYamlPairs(data) {
  if (data === null) return true;

  var index, length, pair, keys, result,
      object = data;

  result = new Array(object.length);

  for (index = 0, length = object.length; index < length; index += 1) {
    pair = object[index];

    if (_toString$1.call(pair) !== '[object Object]') return false;

    keys = Object.keys(pair);

    if (keys.length !== 1) return false;

    result[index] = [ keys[0], pair[keys[0]] ];
  }

  return true;
}

function constructYamlPairs(data) {
  if (data === null) return [];

  var index, length, pair, keys, result,
      object = data;

  result = new Array(object.length);

  for (index = 0, length = object.length; index < length; index += 1) {
    pair = object[index];

    keys = Object.keys(pair);

    result[index] = [ keys[0], pair[keys[0]] ];
  }

  return result;
}

var pairs = new type('tag:yaml.org,2002:pairs', {
  kind: 'sequence',
  resolve: resolveYamlPairs,
  construct: constructYamlPairs
});

var _hasOwnProperty$2 = Object.prototype.hasOwnProperty;

function resolveYamlSet(data) {
  if (data === null) return true;

  var key, object = data;

  for (key in object) {
    if (_hasOwnProperty$2.call(object, key)) {
      if (object[key] !== null) return false;
    }
  }

  return true;
}

function constructYamlSet(data) {
  return data !== null ? data : {};
}

var set = new type('tag:yaml.org,2002:set', {
  kind: 'mapping',
  resolve: resolveYamlSet,
  construct: constructYamlSet
});

var _default = core.extend({
  implicit: [
    timestamp,
    merge
  ],
  explicit: [
    binary,
    omap,
    pairs,
    set
  ]
});

/*eslint-disable max-len,no-use-before-define*/







var _hasOwnProperty$1 = Object.prototype.hasOwnProperty;


var CONTEXT_FLOW_IN   = 1;
var CONTEXT_FLOW_OUT  = 2;
var CONTEXT_BLOCK_IN  = 3;
var CONTEXT_BLOCK_OUT = 4;


var CHOMPING_CLIP  = 1;
var CHOMPING_STRIP = 2;
var CHOMPING_KEEP  = 3;


var PATTERN_NON_PRINTABLE         = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/;
var PATTERN_NON_ASCII_LINE_BREAKS = /[\x85\u2028\u2029]/;
var PATTERN_FLOW_INDICATORS       = /[,\[\]\{\}]/;
var PATTERN_TAG_HANDLE            = /^(?:!|!!|![a-z\-]+!)$/i;
var PATTERN_TAG_URI               = /^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;


function _class(obj) { return Object.prototype.toString.call(obj); }

function is_EOL(c) {
  return (c === 0x0A/* LF */) || (c === 0x0D/* CR */);
}

function is_WHITE_SPACE(c) {
  return (c === 0x09/* Tab */) || (c === 0x20/* Space */);
}

function is_WS_OR_EOL(c) {
  return (c === 0x09/* Tab */) ||
         (c === 0x20/* Space */) ||
         (c === 0x0A/* LF */) ||
         (c === 0x0D/* CR */);
}

function is_FLOW_INDICATOR(c) {
  return c === 0x2C/* , */ ||
         c === 0x5B/* [ */ ||
         c === 0x5D/* ] */ ||
         c === 0x7B/* { */ ||
         c === 0x7D/* } */;
}

function fromHexCode(c) {
  var lc;

  if ((0x30/* 0 */ <= c) && (c <= 0x39/* 9 */)) {
    return c - 0x30;
  }

  /*eslint-disable no-bitwise*/
  lc = c | 0x20;

  if ((0x61/* a */ <= lc) && (lc <= 0x66/* f */)) {
    return lc - 0x61 + 10;
  }

  return -1;
}

function escapedHexLen(c) {
  if (c === 0x78/* x */) { return 2; }
  if (c === 0x75/* u */) { return 4; }
  if (c === 0x55/* U */) { return 8; }
  return 0;
}

function fromDecimalCode(c) {
  if ((0x30/* 0 */ <= c) && (c <= 0x39/* 9 */)) {
    return c - 0x30;
  }

  return -1;
}

function simpleEscapeSequence(c) {
  /* eslint-disable indent */
  return (c === 0x30/* 0 */) ? '\x00' :
        (c === 0x61/* a */) ? '\x07' :
        (c === 0x62/* b */) ? '\x08' :
        (c === 0x74/* t */) ? '\x09' :
        (c === 0x09/* Tab */) ? '\x09' :
        (c === 0x6E/* n */) ? '\x0A' :
        (c === 0x76/* v */) ? '\x0B' :
        (c === 0x66/* f */) ? '\x0C' :
        (c === 0x72/* r */) ? '\x0D' :
        (c === 0x65/* e */) ? '\x1B' :
        (c === 0x20/* Space */) ? ' ' :
        (c === 0x22/* " */) ? '\x22' :
        (c === 0x2F/* / */) ? '/' :
        (c === 0x5C/* \ */) ? '\x5C' :
        (c === 0x4E/* N */) ? '\x85' :
        (c === 0x5F/* _ */) ? '\xA0' :
        (c === 0x4C/* L */) ? '\u2028' :
        (c === 0x50/* P */) ? '\u2029' : '';
}

function charFromCodepoint(c) {
  if (c <= 0xFFFF) {
    return String.fromCharCode(c);
  }
  // Encode UTF-16 surrogate pair
  // https://en.wikipedia.org/wiki/UTF-16#Code_points_U.2B010000_to_U.2B10FFFF
  return String.fromCharCode(
    ((c - 0x010000) >> 10) + 0xD800,
    ((c - 0x010000) & 0x03FF) + 0xDC00
  );
}

// set a property of a literal object, while protecting against prototype pollution,
// see https://github.com/nodeca/js-yaml/issues/164 for more details
function setProperty(object, key, value) {
  // used for this specific key only because Object.defineProperty is slow
  if (key === '__proto__') {
    Object.defineProperty(object, key, {
      configurable: true,
      enumerable: true,
      writable: true,
      value: value
    });
  } else {
    object[key] = value;
  }
}

var simpleEscapeCheck = new Array(256); // integer, for fast access
var simpleEscapeMap = new Array(256);
for (var i = 0; i < 256; i++) {
  simpleEscapeCheck[i] = simpleEscapeSequence(i) ? 1 : 0;
  simpleEscapeMap[i] = simpleEscapeSequence(i);
}


function State$1(input, options) {
  this.input = input;

  this.filename  = options['filename']  || null;
  this.schema    = options['schema']    || _default;
  this.onWarning = options['onWarning'] || null;
  // (Hidden) Remove? makes the loader to expect YAML 1.1 documents
  // if such documents have no explicit %YAML directive
  this.legacy    = options['legacy']    || false;

  this.json      = options['json']      || false;
  this.listener  = options['listener']  || null;

  this.implicitTypes = this.schema.compiledImplicit;
  this.typeMap       = this.schema.compiledTypeMap;

  this.length     = input.length;
  this.position   = 0;
  this.line       = 0;
  this.lineStart  = 0;
  this.lineIndent = 0;

  // position of first leading tab in the current line,
  // used to make sure there are no tabs in the indentation
  this.firstTabInLine = -1;

  this.documents = [];

  /*
  this.version;
  this.checkLineBreaks;
  this.tagMap;
  this.anchorMap;
  this.tag;
  this.anchor;
  this.kind;
  this.result;*/

}


function generateError(state, message) {
  var mark = {
    name:     state.filename,
    buffer:   state.input.slice(0, -1), // omit trailing \0
    position: state.position,
    line:     state.line,
    column:   state.position - state.lineStart
  };

  mark.snippet = snippet(mark);

  return new exception(message, mark);
}

function throwError(state, message) {
  throw generateError(state, message);
}

function throwWarning(state, message) {
  if (state.onWarning) {
    state.onWarning.call(null, generateError(state, message));
  }
}


var directiveHandlers = {

  YAML: function handleYamlDirective(state, name, args) {

    var match, major, minor;

    if (state.version !== null) {
      throwError(state, 'duplication of %YAML directive');
    }

    if (args.length !== 1) {
      throwError(state, 'YAML directive accepts exactly one argument');
    }

    match = /^([0-9]+)\.([0-9]+)$/.exec(args[0]);

    if (match === null) {
      throwError(state, 'ill-formed argument of the YAML directive');
    }

    major = parseInt(match[1], 10);
    minor = parseInt(match[2], 10);

    if (major !== 1) {
      throwError(state, 'unacceptable YAML version of the document');
    }

    state.version = args[0];
    state.checkLineBreaks = (minor < 2);

    if (minor !== 1 && minor !== 2) {
      throwWarning(state, 'unsupported YAML version of the document');
    }
  },

  TAG: function handleTagDirective(state, name, args) {

    var handle, prefix;

    if (args.length !== 2) {
      throwError(state, 'TAG directive accepts exactly two arguments');
    }

    handle = args[0];
    prefix = args[1];

    if (!PATTERN_TAG_HANDLE.test(handle)) {
      throwError(state, 'ill-formed tag handle (first argument) of the TAG directive');
    }

    if (_hasOwnProperty$1.call(state.tagMap, handle)) {
      throwError(state, 'there is a previously declared suffix for "' + handle + '" tag handle');
    }

    if (!PATTERN_TAG_URI.test(prefix)) {
      throwError(state, 'ill-formed tag prefix (second argument) of the TAG directive');
    }

    try {
      prefix = decodeURIComponent(prefix);
    } catch (err) {
      throwError(state, 'tag prefix is malformed: ' + prefix);
    }

    state.tagMap[handle] = prefix;
  }
};


function captureSegment(state, start, end, checkJson) {
  var _position, _length, _character, _result;

  if (start < end) {
    _result = state.input.slice(start, end);

    if (checkJson) {
      for (_position = 0, _length = _result.length; _position < _length; _position += 1) {
        _character = _result.charCodeAt(_position);
        if (!(_character === 0x09 ||
              (0x20 <= _character && _character <= 0x10FFFF))) {
          throwError(state, 'expected valid JSON character');
        }
      }
    } else if (PATTERN_NON_PRINTABLE.test(_result)) {
      throwError(state, 'the stream contains non-printable characters');
    }

    state.result += _result;
  }
}

function mergeMappings(state, destination, source, overridableKeys) {
  var sourceKeys, key, index, quantity;

  if (!common.isObject(source)) {
    throwError(state, 'cannot merge mappings; the provided source object is unacceptable');
  }

  sourceKeys = Object.keys(source);

  for (index = 0, quantity = sourceKeys.length; index < quantity; index += 1) {
    key = sourceKeys[index];

    if (!_hasOwnProperty$1.call(destination, key)) {
      setProperty(destination, key, source[key]);
      overridableKeys[key] = true;
    }
  }
}

function storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode,
  startLine, startLineStart, startPos) {

  var index, quantity;

  // The output is a plain object here, so keys can only be strings.
  // We need to convert keyNode to a string, but doing so can hang the process
  // (deeply nested arrays that explode exponentially using aliases).
  if (Array.isArray(keyNode)) {
    keyNode = Array.prototype.slice.call(keyNode);

    for (index = 0, quantity = keyNode.length; index < quantity; index += 1) {
      if (Array.isArray(keyNode[index])) {
        throwError(state, 'nested arrays are not supported inside keys');
      }

      if (typeof keyNode === 'object' && _class(keyNode[index]) === '[object Object]') {
        keyNode[index] = '[object Object]';
      }
    }
  }

  // Avoid code execution in load() via toString property
  // (still use its own toString for arrays, timestamps,
  // and whatever user schema extensions happen to have @@toStringTag)
  if (typeof keyNode === 'object' && _class(keyNode) === '[object Object]') {
    keyNode = '[object Object]';
  }


  keyNode = String(keyNode);

  if (_result === null) {
    _result = {};
  }

  if (keyTag === 'tag:yaml.org,2002:merge') {
    if (Array.isArray(valueNode)) {
      for (index = 0, quantity = valueNode.length; index < quantity; index += 1) {
        mergeMappings(state, _result, valueNode[index], overridableKeys);
      }
    } else {
      mergeMappings(state, _result, valueNode, overridableKeys);
    }
  } else {
    if (!state.json &&
        !_hasOwnProperty$1.call(overridableKeys, keyNode) &&
        _hasOwnProperty$1.call(_result, keyNode)) {
      state.line = startLine || state.line;
      state.lineStart = startLineStart || state.lineStart;
      state.position = startPos || state.position;
      throwError(state, 'duplicated mapping key');
    }

    setProperty(_result, keyNode, valueNode);
    delete overridableKeys[keyNode];
  }

  return _result;
}

function readLineBreak(state) {
  var ch;

  ch = state.input.charCodeAt(state.position);

  if (ch === 0x0A/* LF */) {
    state.position++;
  } else if (ch === 0x0D/* CR */) {
    state.position++;
    if (state.input.charCodeAt(state.position) === 0x0A/* LF */) {
      state.position++;
    }
  } else {
    throwError(state, 'a line break is expected');
  }

  state.line += 1;
  state.lineStart = state.position;
  state.firstTabInLine = -1;
}

function skipSeparationSpace(state, allowComments, checkIndent) {
  var lineBreaks = 0,
      ch = state.input.charCodeAt(state.position);

  while (ch !== 0) {
    while (is_WHITE_SPACE(ch)) {
      if (ch === 0x09/* Tab */ && state.firstTabInLine === -1) {
        state.firstTabInLine = state.position;
      }
      ch = state.input.charCodeAt(++state.position);
    }

    if (allowComments && ch === 0x23/* # */) {
      do {
        ch = state.input.charCodeAt(++state.position);
      } while (ch !== 0x0A/* LF */ && ch !== 0x0D/* CR */ && ch !== 0);
    }

    if (is_EOL(ch)) {
      readLineBreak(state);

      ch = state.input.charCodeAt(state.position);
      lineBreaks++;
      state.lineIndent = 0;

      while (ch === 0x20/* Space */) {
        state.lineIndent++;
        ch = state.input.charCodeAt(++state.position);
      }
    } else {
      break;
    }
  }

  if (checkIndent !== -1 && lineBreaks !== 0 && state.lineIndent < checkIndent) {
    throwWarning(state, 'deficient indentation');
  }

  return lineBreaks;
}

function testDocumentSeparator(state) {
  var _position = state.position,
      ch;

  ch = state.input.charCodeAt(_position);

  // Condition state.position === state.lineStart is tested
  // in parent on each call, for efficiency. No needs to test here again.
  if ((ch === 0x2D/* - */ || ch === 0x2E/* . */) &&
      ch === state.input.charCodeAt(_position + 1) &&
      ch === state.input.charCodeAt(_position + 2)) {

    _position += 3;

    ch = state.input.charCodeAt(_position);

    if (ch === 0 || is_WS_OR_EOL(ch)) {
      return true;
    }
  }

  return false;
}

function writeFoldedLines(state, count) {
  if (count === 1) {
    state.result += ' ';
  } else if (count > 1) {
    state.result += common.repeat('\n', count - 1);
  }
}


function readPlainScalar(state, nodeIndent, withinFlowCollection) {
  var preceding,
      following,
      captureStart,
      captureEnd,
      hasPendingContent,
      _line,
      _lineStart,
      _lineIndent,
      _kind = state.kind,
      _result = state.result,
      ch;

  ch = state.input.charCodeAt(state.position);

  if (is_WS_OR_EOL(ch)      ||
      is_FLOW_INDICATOR(ch) ||
      ch === 0x23/* # */    ||
      ch === 0x26/* & */    ||
      ch === 0x2A/* * */    ||
      ch === 0x21/* ! */    ||
      ch === 0x7C/* | */    ||
      ch === 0x3E/* > */    ||
      ch === 0x27/* ' */    ||
      ch === 0x22/* " */    ||
      ch === 0x25/* % */    ||
      ch === 0x40/* @ */    ||
      ch === 0x60/* ` */) {
    return false;
  }

  if (ch === 0x3F/* ? */ || ch === 0x2D/* - */) {
    following = state.input.charCodeAt(state.position + 1);

    if (is_WS_OR_EOL(following) ||
        withinFlowCollection && is_FLOW_INDICATOR(following)) {
      return false;
    }
  }

  state.kind = 'scalar';
  state.result = '';
  captureStart = captureEnd = state.position;
  hasPendingContent = false;

  while (ch !== 0) {
    if (ch === 0x3A/* : */) {
      following = state.input.charCodeAt(state.position + 1);

      if (is_WS_OR_EOL(following) ||
          withinFlowCollection && is_FLOW_INDICATOR(following)) {
        break;
      }

    } else if (ch === 0x23/* # */) {
      preceding = state.input.charCodeAt(state.position - 1);

      if (is_WS_OR_EOL(preceding)) {
        break;
      }

    } else if ((state.position === state.lineStart && testDocumentSeparator(state)) ||
               withinFlowCollection && is_FLOW_INDICATOR(ch)) {
      break;

    } else if (is_EOL(ch)) {
      _line = state.line;
      _lineStart = state.lineStart;
      _lineIndent = state.lineIndent;
      skipSeparationSpace(state, false, -1);

      if (state.lineIndent >= nodeIndent) {
        hasPendingContent = true;
        ch = state.input.charCodeAt(state.position);
        continue;
      } else {
        state.position = captureEnd;
        state.line = _line;
        state.lineStart = _lineStart;
        state.lineIndent = _lineIndent;
        break;
      }
    }

    if (hasPendingContent) {
      captureSegment(state, captureStart, captureEnd, false);
      writeFoldedLines(state, state.line - _line);
      captureStart = captureEnd = state.position;
      hasPendingContent = false;
    }

    if (!is_WHITE_SPACE(ch)) {
      captureEnd = state.position + 1;
    }

    ch = state.input.charCodeAt(++state.position);
  }

  captureSegment(state, captureStart, captureEnd, false);

  if (state.result) {
    return true;
  }

  state.kind = _kind;
  state.result = _result;
  return false;
}

function readSingleQuotedScalar(state, nodeIndent) {
  var ch,
      captureStart, captureEnd;

  ch = state.input.charCodeAt(state.position);

  if (ch !== 0x27/* ' */) {
    return false;
  }

  state.kind = 'scalar';
  state.result = '';
  state.position++;
  captureStart = captureEnd = state.position;

  while ((ch = state.input.charCodeAt(state.position)) !== 0) {
    if (ch === 0x27/* ' */) {
      captureSegment(state, captureStart, state.position, true);
      ch = state.input.charCodeAt(++state.position);

      if (ch === 0x27/* ' */) {
        captureStart = state.position;
        state.position++;
        captureEnd = state.position;
      } else {
        return true;
      }

    } else if (is_EOL(ch)) {
      captureSegment(state, captureStart, captureEnd, true);
      writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
      captureStart = captureEnd = state.position;

    } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
      throwError(state, 'unexpected end of the document within a single quoted scalar');

    } else {
      state.position++;
      captureEnd = state.position;
    }
  }

  throwError(state, 'unexpected end of the stream within a single quoted scalar');
}

function readDoubleQuotedScalar(state, nodeIndent) {
  var captureStart,
      captureEnd,
      hexLength,
      hexResult,
      tmp,
      ch;

  ch = state.input.charCodeAt(state.position);

  if (ch !== 0x22/* " */) {
    return false;
  }

  state.kind = 'scalar';
  state.result = '';
  state.position++;
  captureStart = captureEnd = state.position;

  while ((ch = state.input.charCodeAt(state.position)) !== 0) {
    if (ch === 0x22/* " */) {
      captureSegment(state, captureStart, state.position, true);
      state.position++;
      return true;

    } else if (ch === 0x5C/* \ */) {
      captureSegment(state, captureStart, state.position, true);
      ch = state.input.charCodeAt(++state.position);

      if (is_EOL(ch)) {
        skipSeparationSpace(state, false, nodeIndent);

        // TODO: rework to inline fn with no type cast?
      } else if (ch < 256 && simpleEscapeCheck[ch]) {
        state.result += simpleEscapeMap[ch];
        state.position++;

      } else if ((tmp = escapedHexLen(ch)) > 0) {
        hexLength = tmp;
        hexResult = 0;

        for (; hexLength > 0; hexLength--) {
          ch = state.input.charCodeAt(++state.position);

          if ((tmp = fromHexCode(ch)) >= 0) {
            hexResult = (hexResult << 4) + tmp;

          } else {
            throwError(state, 'expected hexadecimal character');
          }
        }

        state.result += charFromCodepoint(hexResult);

        state.position++;

      } else {
        throwError(state, 'unknown escape sequence');
      }

      captureStart = captureEnd = state.position;

    } else if (is_EOL(ch)) {
      captureSegment(state, captureStart, captureEnd, true);
      writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
      captureStart = captureEnd = state.position;

    } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
      throwError(state, 'unexpected end of the document within a double quoted scalar');

    } else {
      state.position++;
      captureEnd = state.position;
    }
  }

  throwError(state, 'unexpected end of the stream within a double quoted scalar');
}

function readFlowCollection(state, nodeIndent) {
  var readNext = true,
      _line,
      _lineStart,
      _pos,
      _tag     = state.tag,
      _result,
      _anchor  = state.anchor,
      following,
      terminator,
      isPair,
      isExplicitPair,
      isMapping,
      overridableKeys = Object.create(null),
      keyNode,
      keyTag,
      valueNode,
      ch;

  ch = state.input.charCodeAt(state.position);

  if (ch === 0x5B/* [ */) {
    terminator = 0x5D;/* ] */
    isMapping = false;
    _result = [];
  } else if (ch === 0x7B/* { */) {
    terminator = 0x7D;/* } */
    isMapping = true;
    _result = {};
  } else {
    return false;
  }

  if (state.anchor !== null) {
    state.anchorMap[state.anchor] = _result;
  }

  ch = state.input.charCodeAt(++state.position);

  while (ch !== 0) {
    skipSeparationSpace(state, true, nodeIndent);

    ch = state.input.charCodeAt(state.position);

    if (ch === terminator) {
      state.position++;
      state.tag = _tag;
      state.anchor = _anchor;
      state.kind = isMapping ? 'mapping' : 'sequence';
      state.result = _result;
      return true;
    } else if (!readNext) {
      throwError(state, 'missed comma between flow collection entries');
    } else if (ch === 0x2C/* , */) {
      // "flow collection entries can never be completely empty", as per YAML 1.2, section 7.4
      throwError(state, "expected the node content, but found ','");
    }

    keyTag = keyNode = valueNode = null;
    isPair = isExplicitPair = false;

    if (ch === 0x3F/* ? */) {
      following = state.input.charCodeAt(state.position + 1);

      if (is_WS_OR_EOL(following)) {
        isPair = isExplicitPair = true;
        state.position++;
        skipSeparationSpace(state, true, nodeIndent);
      }
    }

    _line = state.line; // Save the current line.
    _lineStart = state.lineStart;
    _pos = state.position;
    composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
    keyTag = state.tag;
    keyNode = state.result;
    skipSeparationSpace(state, true, nodeIndent);

    ch = state.input.charCodeAt(state.position);

    if ((isExplicitPair || state.line === _line) && ch === 0x3A/* : */) {
      isPair = true;
      ch = state.input.charCodeAt(++state.position);
      skipSeparationSpace(state, true, nodeIndent);
      composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
      valueNode = state.result;
    }

    if (isMapping) {
      storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, _line, _lineStart, _pos);
    } else if (isPair) {
      _result.push(storeMappingPair(state, null, overridableKeys, keyTag, keyNode, valueNode, _line, _lineStart, _pos));
    } else {
      _result.push(keyNode);
    }

    skipSeparationSpace(state, true, nodeIndent);

    ch = state.input.charCodeAt(state.position);

    if (ch === 0x2C/* , */) {
      readNext = true;
      ch = state.input.charCodeAt(++state.position);
    } else {
      readNext = false;
    }
  }

  throwError(state, 'unexpected end of the stream within a flow collection');
}

function readBlockScalar(state, nodeIndent) {
  var captureStart,
      folding,
      chomping       = CHOMPING_CLIP,
      didReadContent = false,
      detectedIndent = false,
      textIndent     = nodeIndent,
      emptyLines     = 0,
      atMoreIndented = false,
      tmp,
      ch;

  ch = state.input.charCodeAt(state.position);

  if (ch === 0x7C/* | */) {
    folding = false;
  } else if (ch === 0x3E/* > */) {
    folding = true;
  } else {
    return false;
  }

  state.kind = 'scalar';
  state.result = '';

  while (ch !== 0) {
    ch = state.input.charCodeAt(++state.position);

    if (ch === 0x2B/* + */ || ch === 0x2D/* - */) {
      if (CHOMPING_CLIP === chomping) {
        chomping = (ch === 0x2B/* + */) ? CHOMPING_KEEP : CHOMPING_STRIP;
      } else {
        throwError(state, 'repeat of a chomping mode identifier');
      }

    } else if ((tmp = fromDecimalCode(ch)) >= 0) {
      if (tmp === 0) {
        throwError(state, 'bad explicit indentation width of a block scalar; it cannot be less than one');
      } else if (!detectedIndent) {
        textIndent = nodeIndent + tmp - 1;
        detectedIndent = true;
      } else {
        throwError(state, 'repeat of an indentation width identifier');
      }

    } else {
      break;
    }
  }

  if (is_WHITE_SPACE(ch)) {
    do { ch = state.input.charCodeAt(++state.position); }
    while (is_WHITE_SPACE(ch));

    if (ch === 0x23/* # */) {
      do { ch = state.input.charCodeAt(++state.position); }
      while (!is_EOL(ch) && (ch !== 0));
    }
  }

  while (ch !== 0) {
    readLineBreak(state);
    state.lineIndent = 0;

    ch = state.input.charCodeAt(state.position);

    while ((!detectedIndent || state.lineIndent < textIndent) &&
           (ch === 0x20/* Space */)) {
      state.lineIndent++;
      ch = state.input.charCodeAt(++state.position);
    }

    if (!detectedIndent && state.lineIndent > textIndent) {
      textIndent = state.lineIndent;
    }

    if (is_EOL(ch)) {
      emptyLines++;
      continue;
    }

    // End of the scalar.
    if (state.lineIndent < textIndent) {

      // Perform the chomping.
      if (chomping === CHOMPING_KEEP) {
        state.result += common.repeat('\n', didReadContent ? 1 + emptyLines : emptyLines);
      } else if (chomping === CHOMPING_CLIP) {
        if (didReadContent) { // i.e. only if the scalar is not empty.
          state.result += '\n';
        }
      }

      // Break this `while` cycle and go to the funciton's epilogue.
      break;
    }

    // Folded style: use fancy rules to handle line breaks.
    if (folding) {

      // Lines starting with white space characters (more-indented lines) are not folded.
      if (is_WHITE_SPACE(ch)) {
        atMoreIndented = true;
        // except for the first content line (cf. Example 8.1)
        state.result += common.repeat('\n', didReadContent ? 1 + emptyLines : emptyLines);

      // End of more-indented block.
      } else if (atMoreIndented) {
        atMoreIndented = false;
        state.result += common.repeat('\n', emptyLines + 1);

      // Just one line break - perceive as the same line.
      } else if (emptyLines === 0) {
        if (didReadContent) { // i.e. only if we have already read some scalar content.
          state.result += ' ';
        }

      // Several line breaks - perceive as different lines.
      } else {
        state.result += common.repeat('\n', emptyLines);
      }

    // Literal style: just add exact number of line breaks between content lines.
    } else {
      // Keep all line breaks except the header line break.
      state.result += common.repeat('\n', didReadContent ? 1 + emptyLines : emptyLines);
    }

    didReadContent = true;
    detectedIndent = true;
    emptyLines = 0;
    captureStart = state.position;

    while (!is_EOL(ch) && (ch !== 0)) {
      ch = state.input.charCodeAt(++state.position);
    }

    captureSegment(state, captureStart, state.position, false);
  }

  return true;
}

function readBlockSequence(state, nodeIndent) {
  var _line,
      _tag      = state.tag,
      _anchor   = state.anchor,
      _result   = [],
      following,
      detected  = false,
      ch;

  // there is a leading tab before this token, so it can't be a block sequence/mapping;
  // it can still be flow sequence/mapping or a scalar
  if (state.firstTabInLine !== -1) return false;

  if (state.anchor !== null) {
    state.anchorMap[state.anchor] = _result;
  }

  ch = state.input.charCodeAt(state.position);

  while (ch !== 0) {
    if (state.firstTabInLine !== -1) {
      state.position = state.firstTabInLine;
      throwError(state, 'tab characters must not be used in indentation');
    }

    if (ch !== 0x2D/* - */) {
      break;
    }

    following = state.input.charCodeAt(state.position + 1);

    if (!is_WS_OR_EOL(following)) {
      break;
    }

    detected = true;
    state.position++;

    if (skipSeparationSpace(state, true, -1)) {
      if (state.lineIndent <= nodeIndent) {
        _result.push(null);
        ch = state.input.charCodeAt(state.position);
        continue;
      }
    }

    _line = state.line;
    composeNode(state, nodeIndent, CONTEXT_BLOCK_IN, false, true);
    _result.push(state.result);
    skipSeparationSpace(state, true, -1);

    ch = state.input.charCodeAt(state.position);

    if ((state.line === _line || state.lineIndent > nodeIndent) && (ch !== 0)) {
      throwError(state, 'bad indentation of a sequence entry');
    } else if (state.lineIndent < nodeIndent) {
      break;
    }
  }

  if (detected) {
    state.tag = _tag;
    state.anchor = _anchor;
    state.kind = 'sequence';
    state.result = _result;
    return true;
  }
  return false;
}

function readBlockMapping(state, nodeIndent, flowIndent) {
  var following,
      allowCompact,
      _line,
      _keyLine,
      _keyLineStart,
      _keyPos,
      _tag          = state.tag,
      _anchor       = state.anchor,
      _result       = {},
      overridableKeys = Object.create(null),
      keyTag        = null,
      keyNode       = null,
      valueNode     = null,
      atExplicitKey = false,
      detected      = false,
      ch;

  // there is a leading tab before this token, so it can't be a block sequence/mapping;
  // it can still be flow sequence/mapping or a scalar
  if (state.firstTabInLine !== -1) return false;

  if (state.anchor !== null) {
    state.anchorMap[state.anchor] = _result;
  }

  ch = state.input.charCodeAt(state.position);

  while (ch !== 0) {
    if (!atExplicitKey && state.firstTabInLine !== -1) {
      state.position = state.firstTabInLine;
      throwError(state, 'tab characters must not be used in indentation');
    }

    following = state.input.charCodeAt(state.position + 1);
    _line = state.line; // Save the current line.

    //
    // Explicit notation case. There are two separate blocks:
    // first for the key (denoted by "?") and second for the value (denoted by ":")
    //
    if ((ch === 0x3F/* ? */ || ch === 0x3A/* : */) && is_WS_OR_EOL(following)) {

      if (ch === 0x3F/* ? */) {
        if (atExplicitKey) {
          storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
          keyTag = keyNode = valueNode = null;
        }

        detected = true;
        atExplicitKey = true;
        allowCompact = true;

      } else if (atExplicitKey) {
        // i.e. 0x3A/* : */ === character after the explicit key.
        atExplicitKey = false;
        allowCompact = true;

      } else {
        throwError(state, 'incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line');
      }

      state.position += 1;
      ch = following;

    //
    // Implicit notation case. Flow-style node as the key first, then ":", and the value.
    //
    } else {
      _keyLine = state.line;
      _keyLineStart = state.lineStart;
      _keyPos = state.position;

      if (!composeNode(state, flowIndent, CONTEXT_FLOW_OUT, false, true)) {
        // Neither implicit nor explicit notation.
        // Reading is done. Go to the epilogue.
        break;
      }

      if (state.line === _line) {
        ch = state.input.charCodeAt(state.position);

        while (is_WHITE_SPACE(ch)) {
          ch = state.input.charCodeAt(++state.position);
        }

        if (ch === 0x3A/* : */) {
          ch = state.input.charCodeAt(++state.position);

          if (!is_WS_OR_EOL(ch)) {
            throwError(state, 'a whitespace character is expected after the key-value separator within a block mapping');
          }

          if (atExplicitKey) {
            storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
            keyTag = keyNode = valueNode = null;
          }

          detected = true;
          atExplicitKey = false;
          allowCompact = false;
          keyTag = state.tag;
          keyNode = state.result;

        } else if (detected) {
          throwError(state, 'can not read an implicit mapping pair; a colon is missed');

        } else {
          state.tag = _tag;
          state.anchor = _anchor;
          return true; // Keep the result of `composeNode`.
        }

      } else if (detected) {
        throwError(state, 'can not read a block mapping entry; a multiline key may not be an implicit key');

      } else {
        state.tag = _tag;
        state.anchor = _anchor;
        return true; // Keep the result of `composeNode`.
      }
    }

    //
    // Common reading code for both explicit and implicit notations.
    //
    if (state.line === _line || state.lineIndent > nodeIndent) {
      if (atExplicitKey) {
        _keyLine = state.line;
        _keyLineStart = state.lineStart;
        _keyPos = state.position;
      }

      if (composeNode(state, nodeIndent, CONTEXT_BLOCK_OUT, true, allowCompact)) {
        if (atExplicitKey) {
          keyNode = state.result;
        } else {
          valueNode = state.result;
        }
      }

      if (!atExplicitKey) {
        storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, _keyLine, _keyLineStart, _keyPos);
        keyTag = keyNode = valueNode = null;
      }

      skipSeparationSpace(state, true, -1);
      ch = state.input.charCodeAt(state.position);
    }

    if ((state.line === _line || state.lineIndent > nodeIndent) && (ch !== 0)) {
      throwError(state, 'bad indentation of a mapping entry');
    } else if (state.lineIndent < nodeIndent) {
      break;
    }
  }

  //
  // Epilogue.
  //

  // Special case: last mapping's node contains only the key in explicit notation.
  if (atExplicitKey) {
    storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
  }

  // Expose the resulting mapping.
  if (detected) {
    state.tag = _tag;
    state.anchor = _anchor;
    state.kind = 'mapping';
    state.result = _result;
  }

  return detected;
}

function readTagProperty(state) {
  var _position,
      isVerbatim = false,
      isNamed    = false,
      tagHandle,
      tagName,
      ch;

  ch = state.input.charCodeAt(state.position);

  if (ch !== 0x21/* ! */) return false;

  if (state.tag !== null) {
    throwError(state, 'duplication of a tag property');
  }

  ch = state.input.charCodeAt(++state.position);

  if (ch === 0x3C/* < */) {
    isVerbatim = true;
    ch = state.input.charCodeAt(++state.position);

  } else if (ch === 0x21/* ! */) {
    isNamed = true;
    tagHandle = '!!';
    ch = state.input.charCodeAt(++state.position);

  } else {
    tagHandle = '!';
  }

  _position = state.position;

  if (isVerbatim) {
    do { ch = state.input.charCodeAt(++state.position); }
    while (ch !== 0 && ch !== 0x3E/* > */);

    if (state.position < state.length) {
      tagName = state.input.slice(_position, state.position);
      ch = state.input.charCodeAt(++state.position);
    } else {
      throwError(state, 'unexpected end of the stream within a verbatim tag');
    }
  } else {
    while (ch !== 0 && !is_WS_OR_EOL(ch)) {

      if (ch === 0x21/* ! */) {
        if (!isNamed) {
          tagHandle = state.input.slice(_position - 1, state.position + 1);

          if (!PATTERN_TAG_HANDLE.test(tagHandle)) {
            throwError(state, 'named tag handle cannot contain such characters');
          }

          isNamed = true;
          _position = state.position + 1;
        } else {
          throwError(state, 'tag suffix cannot contain exclamation marks');
        }
      }

      ch = state.input.charCodeAt(++state.position);
    }

    tagName = state.input.slice(_position, state.position);

    if (PATTERN_FLOW_INDICATORS.test(tagName)) {
      throwError(state, 'tag suffix cannot contain flow indicator characters');
    }
  }

  if (tagName && !PATTERN_TAG_URI.test(tagName)) {
    throwError(state, 'tag name cannot contain such characters: ' + tagName);
  }

  try {
    tagName = decodeURIComponent(tagName);
  } catch (err) {
    throwError(state, 'tag name is malformed: ' + tagName);
  }

  if (isVerbatim) {
    state.tag = tagName;

  } else if (_hasOwnProperty$1.call(state.tagMap, tagHandle)) {
    state.tag = state.tagMap[tagHandle] + tagName;

  } else if (tagHandle === '!') {
    state.tag = '!' + tagName;

  } else if (tagHandle === '!!') {
    state.tag = 'tag:yaml.org,2002:' + tagName;

  } else {
    throwError(state, 'undeclared tag handle "' + tagHandle + '"');
  }

  return true;
}

function readAnchorProperty(state) {
  var _position,
      ch;

  ch = state.input.charCodeAt(state.position);

  if (ch !== 0x26/* & */) return false;

  if (state.anchor !== null) {
    throwError(state, 'duplication of an anchor property');
  }

  ch = state.input.charCodeAt(++state.position);
  _position = state.position;

  while (ch !== 0 && !is_WS_OR_EOL(ch) && !is_FLOW_INDICATOR(ch)) {
    ch = state.input.charCodeAt(++state.position);
  }

  if (state.position === _position) {
    throwError(state, 'name of an anchor node must contain at least one character');
  }

  state.anchor = state.input.slice(_position, state.position);
  return true;
}

function readAlias(state) {
  var _position, alias,
      ch;

  ch = state.input.charCodeAt(state.position);

  if (ch !== 0x2A/* * */) return false;

  ch = state.input.charCodeAt(++state.position);
  _position = state.position;

  while (ch !== 0 && !is_WS_OR_EOL(ch) && !is_FLOW_INDICATOR(ch)) {
    ch = state.input.charCodeAt(++state.position);
  }

  if (state.position === _position) {
    throwError(state, 'name of an alias node must contain at least one character');
  }

  alias = state.input.slice(_position, state.position);

  if (!_hasOwnProperty$1.call(state.anchorMap, alias)) {
    throwError(state, 'unidentified alias "' + alias + '"');
  }

  state.result = state.anchorMap[alias];
  skipSeparationSpace(state, true, -1);
  return true;
}

function composeNode(state, parentIndent, nodeContext, allowToSeek, allowCompact) {
  var allowBlockStyles,
      allowBlockScalars,
      allowBlockCollections,
      indentStatus = 1, // 1: this>parent, 0: this=parent, -1: this<parent
      atNewLine  = false,
      hasContent = false,
      typeIndex,
      typeQuantity,
      typeList,
      type,
      flowIndent,
      blockIndent;

  if (state.listener !== null) {
    state.listener('open', state);
  }

  state.tag    = null;
  state.anchor = null;
  state.kind   = null;
  state.result = null;

  allowBlockStyles = allowBlockScalars = allowBlockCollections =
    CONTEXT_BLOCK_OUT === nodeContext ||
    CONTEXT_BLOCK_IN  === nodeContext;

  if (allowToSeek) {
    if (skipSeparationSpace(state, true, -1)) {
      atNewLine = true;

      if (state.lineIndent > parentIndent) {
        indentStatus = 1;
      } else if (state.lineIndent === parentIndent) {
        indentStatus = 0;
      } else if (state.lineIndent < parentIndent) {
        indentStatus = -1;
      }
    }
  }

  if (indentStatus === 1) {
    while (readTagProperty(state) || readAnchorProperty(state)) {
      if (skipSeparationSpace(state, true, -1)) {
        atNewLine = true;
        allowBlockCollections = allowBlockStyles;

        if (state.lineIndent > parentIndent) {
          indentStatus = 1;
        } else if (state.lineIndent === parentIndent) {
          indentStatus = 0;
        } else if (state.lineIndent < parentIndent) {
          indentStatus = -1;
        }
      } else {
        allowBlockCollections = false;
      }
    }
  }

  if (allowBlockCollections) {
    allowBlockCollections = atNewLine || allowCompact;
  }

  if (indentStatus === 1 || CONTEXT_BLOCK_OUT === nodeContext) {
    if (CONTEXT_FLOW_IN === nodeContext || CONTEXT_FLOW_OUT === nodeContext) {
      flowIndent = parentIndent;
    } else {
      flowIndent = parentIndent + 1;
    }

    blockIndent = state.position - state.lineStart;

    if (indentStatus === 1) {
      if (allowBlockCollections &&
          (readBlockSequence(state, blockIndent) ||
           readBlockMapping(state, blockIndent, flowIndent)) ||
          readFlowCollection(state, flowIndent)) {
        hasContent = true;
      } else {
        if ((allowBlockScalars && readBlockScalar(state, flowIndent)) ||
            readSingleQuotedScalar(state, flowIndent) ||
            readDoubleQuotedScalar(state, flowIndent)) {
          hasContent = true;

        } else if (readAlias(state)) {
          hasContent = true;

          if (state.tag !== null || state.anchor !== null) {
            throwError(state, 'alias node should not have any properties');
          }

        } else if (readPlainScalar(state, flowIndent, CONTEXT_FLOW_IN === nodeContext)) {
          hasContent = true;

          if (state.tag === null) {
            state.tag = '?';
          }
        }

        if (state.anchor !== null) {
          state.anchorMap[state.anchor] = state.result;
        }
      }
    } else if (indentStatus === 0) {
      // Special case: block sequences are allowed to have same indentation level as the parent.
      // http://www.yaml.org/spec/1.2/spec.html#id2799784
      hasContent = allowBlockCollections && readBlockSequence(state, blockIndent);
    }
  }

  if (state.tag === null) {
    if (state.anchor !== null) {
      state.anchorMap[state.anchor] = state.result;
    }

  } else if (state.tag === '?') {
    // Implicit resolving is not allowed for non-scalar types, and '?'
    // non-specific tag is only automatically assigned to plain scalars.
    //
    // We only need to check kind conformity in case user explicitly assigns '?'
    // tag, for example like this: "!<?> [0]"
    //
    if (state.result !== null && state.kind !== 'scalar') {
      throwError(state, 'unacceptable node kind for !<?> tag; it should be "scalar", not "' + state.kind + '"');
    }

    for (typeIndex = 0, typeQuantity = state.implicitTypes.length; typeIndex < typeQuantity; typeIndex += 1) {
      type = state.implicitTypes[typeIndex];

      if (type.resolve(state.result)) { // `state.result` updated in resolver if matched
        state.result = type.construct(state.result);
        state.tag = type.tag;
        if (state.anchor !== null) {
          state.anchorMap[state.anchor] = state.result;
        }
        break;
      }
    }
  } else if (state.tag !== '!') {
    if (_hasOwnProperty$1.call(state.typeMap[state.kind || 'fallback'], state.tag)) {
      type = state.typeMap[state.kind || 'fallback'][state.tag];
    } else {
      // looking for multi type
      type = null;
      typeList = state.typeMap.multi[state.kind || 'fallback'];

      for (typeIndex = 0, typeQuantity = typeList.length; typeIndex < typeQuantity; typeIndex += 1) {
        if (state.tag.slice(0, typeList[typeIndex].tag.length) === typeList[typeIndex].tag) {
          type = typeList[typeIndex];
          break;
        }
      }
    }

    if (!type) {
      throwError(state, 'unknown tag !<' + state.tag + '>');
    }

    if (state.result !== null && type.kind !== state.kind) {
      throwError(state, 'unacceptable node kind for !<' + state.tag + '> tag; it should be "' + type.kind + '", not "' + state.kind + '"');
    }

    if (!type.resolve(state.result, state.tag)) { // `state.result` updated in resolver if matched
      throwError(state, 'cannot resolve a node with !<' + state.tag + '> explicit tag');
    } else {
      state.result = type.construct(state.result, state.tag);
      if (state.anchor !== null) {
        state.anchorMap[state.anchor] = state.result;
      }
    }
  }

  if (state.listener !== null) {
    state.listener('close', state);
  }
  return state.tag !== null ||  state.anchor !== null || hasContent;
}

function readDocument(state) {
  var documentStart = state.position,
      _position,
      directiveName,
      directiveArgs,
      hasDirectives = false,
      ch;

  state.version = null;
  state.checkLineBreaks = state.legacy;
  state.tagMap = Object.create(null);
  state.anchorMap = Object.create(null);

  while ((ch = state.input.charCodeAt(state.position)) !== 0) {
    skipSeparationSpace(state, true, -1);

    ch = state.input.charCodeAt(state.position);

    if (state.lineIndent > 0 || ch !== 0x25/* % */) {
      break;
    }

    hasDirectives = true;
    ch = state.input.charCodeAt(++state.position);
    _position = state.position;

    while (ch !== 0 && !is_WS_OR_EOL(ch)) {
      ch = state.input.charCodeAt(++state.position);
    }

    directiveName = state.input.slice(_position, state.position);
    directiveArgs = [];

    if (directiveName.length < 1) {
      throwError(state, 'directive name must not be less than one character in length');
    }

    while (ch !== 0) {
      while (is_WHITE_SPACE(ch)) {
        ch = state.input.charCodeAt(++state.position);
      }

      if (ch === 0x23/* # */) {
        do { ch = state.input.charCodeAt(++state.position); }
        while (ch !== 0 && !is_EOL(ch));
        break;
      }

      if (is_EOL(ch)) break;

      _position = state.position;

      while (ch !== 0 && !is_WS_OR_EOL(ch)) {
        ch = state.input.charCodeAt(++state.position);
      }

      directiveArgs.push(state.input.slice(_position, state.position));
    }

    if (ch !== 0) readLineBreak(state);

    if (_hasOwnProperty$1.call(directiveHandlers, directiveName)) {
      directiveHandlers[directiveName](state, directiveName, directiveArgs);
    } else {
      throwWarning(state, 'unknown document directive "' + directiveName + '"');
    }
  }

  skipSeparationSpace(state, true, -1);

  if (state.lineIndent === 0 &&
      state.input.charCodeAt(state.position)     === 0x2D/* - */ &&
      state.input.charCodeAt(state.position + 1) === 0x2D/* - */ &&
      state.input.charCodeAt(state.position + 2) === 0x2D/* - */) {
    state.position += 3;
    skipSeparationSpace(state, true, -1);

  } else if (hasDirectives) {
    throwError(state, 'directives end mark is expected');
  }

  composeNode(state, state.lineIndent - 1, CONTEXT_BLOCK_OUT, false, true);
  skipSeparationSpace(state, true, -1);

  if (state.checkLineBreaks &&
      PATTERN_NON_ASCII_LINE_BREAKS.test(state.input.slice(documentStart, state.position))) {
    throwWarning(state, 'non-ASCII line breaks are interpreted as content');
  }

  state.documents.push(state.result);

  if (state.position === state.lineStart && testDocumentSeparator(state)) {

    if (state.input.charCodeAt(state.position) === 0x2E/* . */) {
      state.position += 3;
      skipSeparationSpace(state, true, -1);
    }
    return;
  }

  if (state.position < (state.length - 1)) {
    throwError(state, 'end of the stream or a document separator is expected');
  } else {
    return;
  }
}


function loadDocuments(input, options) {
  input = String(input);
  options = options || {};

  if (input.length !== 0) {

    // Add tailing `\n` if not exists
    if (input.charCodeAt(input.length - 1) !== 0x0A/* LF */ &&
        input.charCodeAt(input.length - 1) !== 0x0D/* CR */) {
      input += '\n';
    }

    // Strip BOM
    if (input.charCodeAt(0) === 0xFEFF) {
      input = input.slice(1);
    }
  }

  var state = new State$1(input, options);

  var nullpos = input.indexOf('\0');

  if (nullpos !== -1) {
    state.position = nullpos;
    throwError(state, 'null byte is not allowed in input');
  }

  // Use 0 as string terminator. That significantly simplifies bounds check.
  state.input += '\0';

  while (state.input.charCodeAt(state.position) === 0x20/* Space */) {
    state.lineIndent += 1;
    state.position += 1;
  }

  while (state.position < (state.length - 1)) {
    readDocument(state);
  }

  return state.documents;
}


function loadAll$1(input, iterator, options) {
  if (iterator !== null && typeof iterator === 'object' && typeof options === 'undefined') {
    options = iterator;
    iterator = null;
  }

  var documents = loadDocuments(input, options);

  if (typeof iterator !== 'function') {
    return documents;
  }

  for (var index = 0, length = documents.length; index < length; index += 1) {
    iterator(documents[index]);
  }
}


function load$1(input, options) {
  var documents = loadDocuments(input, options);

  if (documents.length === 0) {
    /*eslint-disable no-undefined*/
    return undefined;
  } else if (documents.length === 1) {
    return documents[0];
  }
  throw new exception('expected a single document in the stream, but found more');
}


var loadAll_1 = loadAll$1;
var load_1    = load$1;

var loader = {
	loadAll: loadAll_1,
	load: load_1
};

/*eslint-disable no-use-before-define*/





var _toString       = Object.prototype.toString;
var _hasOwnProperty = Object.prototype.hasOwnProperty;

var CHAR_BOM                  = 0xFEFF;
var CHAR_TAB                  = 0x09; /* Tab */
var CHAR_LINE_FEED            = 0x0A; /* LF */
var CHAR_CARRIAGE_RETURN      = 0x0D; /* CR */
var CHAR_SPACE                = 0x20; /* Space */
var CHAR_EXCLAMATION          = 0x21; /* ! */
var CHAR_DOUBLE_QUOTE         = 0x22; /* " */
var CHAR_SHARP                = 0x23; /* # */
var CHAR_PERCENT              = 0x25; /* % */
var CHAR_AMPERSAND            = 0x26; /* & */
var CHAR_SINGLE_QUOTE         = 0x27; /* ' */
var CHAR_ASTERISK             = 0x2A; /* * */
var CHAR_COMMA                = 0x2C; /* , */
var CHAR_MINUS                = 0x2D; /* - */
var CHAR_COLON                = 0x3A; /* : */
var CHAR_EQUALS               = 0x3D; /* = */
var CHAR_GREATER_THAN         = 0x3E; /* > */
var CHAR_QUESTION             = 0x3F; /* ? */
var CHAR_COMMERCIAL_AT        = 0x40; /* @ */
var CHAR_LEFT_SQUARE_BRACKET  = 0x5B; /* [ */
var CHAR_RIGHT_SQUARE_BRACKET = 0x5D; /* ] */
var CHAR_GRAVE_ACCENT         = 0x60; /* ` */
var CHAR_LEFT_CURLY_BRACKET   = 0x7B; /* { */
var CHAR_VERTICAL_LINE        = 0x7C; /* | */
var CHAR_RIGHT_CURLY_BRACKET  = 0x7D; /* } */

var ESCAPE_SEQUENCES = {};

ESCAPE_SEQUENCES[0x00]   = '\\0';
ESCAPE_SEQUENCES[0x07]   = '\\a';
ESCAPE_SEQUENCES[0x08]   = '\\b';
ESCAPE_SEQUENCES[0x09]   = '\\t';
ESCAPE_SEQUENCES[0x0A]   = '\\n';
ESCAPE_SEQUENCES[0x0B]   = '\\v';
ESCAPE_SEQUENCES[0x0C]   = '\\f';
ESCAPE_SEQUENCES[0x0D]   = '\\r';
ESCAPE_SEQUENCES[0x1B]   = '\\e';
ESCAPE_SEQUENCES[0x22]   = '\\"';
ESCAPE_SEQUENCES[0x5C]   = '\\\\';
ESCAPE_SEQUENCES[0x85]   = '\\N';
ESCAPE_SEQUENCES[0xA0]   = '\\_';
ESCAPE_SEQUENCES[0x2028] = '\\L';
ESCAPE_SEQUENCES[0x2029] = '\\P';

var DEPRECATED_BOOLEANS_SYNTAX = [
  'y', 'Y', 'yes', 'Yes', 'YES', 'on', 'On', 'ON',
  'n', 'N', 'no', 'No', 'NO', 'off', 'Off', 'OFF'
];

var DEPRECATED_BASE60_SYNTAX = /^[-+]?[0-9_]+(?::[0-9_]+)+(?:\.[0-9_]*)?$/;

function compileStyleMap(schema, map) {
  var result, keys, index, length, tag, style, type;

  if (map === null) return {};

  result = {};
  keys = Object.keys(map);

  for (index = 0, length = keys.length; index < length; index += 1) {
    tag = keys[index];
    style = String(map[tag]);

    if (tag.slice(0, 2) === '!!') {
      tag = 'tag:yaml.org,2002:' + tag.slice(2);
    }
    type = schema.compiledTypeMap['fallback'][tag];

    if (type && _hasOwnProperty.call(type.styleAliases, style)) {
      style = type.styleAliases[style];
    }

    result[tag] = style;
  }

  return result;
}

function encodeHex(character) {
  var string, handle, length;

  string = character.toString(16).toUpperCase();

  if (character <= 0xFF) {
    handle = 'x';
    length = 2;
  } else if (character <= 0xFFFF) {
    handle = 'u';
    length = 4;
  } else if (character <= 0xFFFFFFFF) {
    handle = 'U';
    length = 8;
  } else {
    throw new exception('code point within a string may not be greater than 0xFFFFFFFF');
  }

  return '\\' + handle + common.repeat('0', length - string.length) + string;
}


var QUOTING_TYPE_SINGLE = 1,
    QUOTING_TYPE_DOUBLE = 2;

function State(options) {
  this.schema        = options['schema'] || _default;
  this.indent        = Math.max(1, (options['indent'] || 2));
  this.noArrayIndent = options['noArrayIndent'] || false;
  this.skipInvalid   = options['skipInvalid'] || false;
  this.flowLevel     = (common.isNothing(options['flowLevel']) ? -1 : options['flowLevel']);
  this.styleMap      = compileStyleMap(this.schema, options['styles'] || null);
  this.sortKeys      = options['sortKeys'] || false;
  this.lineWidth     = options['lineWidth'] || 80;
  this.noRefs        = options['noRefs'] || false;
  this.noCompatMode  = options['noCompatMode'] || false;
  this.condenseFlow  = options['condenseFlow'] || false;
  this.quotingType   = options['quotingType'] === '"' ? QUOTING_TYPE_DOUBLE : QUOTING_TYPE_SINGLE;
  this.forceQuotes   = options['forceQuotes'] || false;
  this.replacer      = typeof options['replacer'] === 'function' ? options['replacer'] : null;

  this.implicitTypes = this.schema.compiledImplicit;
  this.explicitTypes = this.schema.compiledExplicit;

  this.tag = null;
  this.result = '';

  this.duplicates = [];
  this.usedDuplicates = null;
}

// Indents every line in a string. Empty lines (\n only) are not indented.
function indentString(string, spaces) {
  var ind = common.repeat(' ', spaces),
      position = 0,
      next = -1,
      result = '',
      line,
      length = string.length;

  while (position < length) {
    next = string.indexOf('\n', position);
    if (next === -1) {
      line = string.slice(position);
      position = length;
    } else {
      line = string.slice(position, next + 1);
      position = next + 1;
    }

    if (line.length && line !== '\n') result += ind;

    result += line;
  }

  return result;
}

function generateNextLine(state, level) {
  return '\n' + common.repeat(' ', state.indent * level);
}

function testImplicitResolving(state, str) {
  var index, length, type;

  for (index = 0, length = state.implicitTypes.length; index < length; index += 1) {
    type = state.implicitTypes[index];

    if (type.resolve(str)) {
      return true;
    }
  }

  return false;
}

// [33] s-white ::= s-space | s-tab
function isWhitespace(c) {
  return c === CHAR_SPACE || c === CHAR_TAB;
}

// Returns true if the character can be printed without escaping.
// From YAML 1.2: "any allowed characters known to be non-printable
// should also be escaped. [However,] This isn’t mandatory"
// Derived from nb-char - \t - #x85 - #xA0 - #x2028 - #x2029.
function isPrintable(c) {
  return  (0x00020 <= c && c <= 0x00007E)
      || ((0x000A1 <= c && c <= 0x00D7FF) && c !== 0x2028 && c !== 0x2029)
      || ((0x0E000 <= c && c <= 0x00FFFD) && c !== CHAR_BOM)
      ||  (0x10000 <= c && c <= 0x10FFFF);
}

// [34] ns-char ::= nb-char - s-white
// [27] nb-char ::= c-printable - b-char - c-byte-order-mark
// [26] b-char  ::= b-line-feed | b-carriage-return
// Including s-white (for some reason, examples doesn't match specs in this aspect)
// ns-char ::= c-printable - b-line-feed - b-carriage-return - c-byte-order-mark
function isNsCharOrWhitespace(c) {
  return isPrintable(c)
    && c !== CHAR_BOM
    // - b-char
    && c !== CHAR_CARRIAGE_RETURN
    && c !== CHAR_LINE_FEED;
}

// [127]  ns-plain-safe(c) ::= c = flow-out  ⇒ ns-plain-safe-out
//                             c = flow-in   ⇒ ns-plain-safe-in
//                             c = block-key ⇒ ns-plain-safe-out
//                             c = flow-key  ⇒ ns-plain-safe-in
// [128] ns-plain-safe-out ::= ns-char
// [129]  ns-plain-safe-in ::= ns-char - c-flow-indicator
// [130]  ns-plain-char(c) ::=  ( ns-plain-safe(c) - “:” - “#” )
//                            | ( /* An ns-char preceding */ “#” )
//                            | ( “:” /* Followed by an ns-plain-safe(c) */ )
function isPlainSafe(c, prev, inblock) {
  var cIsNsCharOrWhitespace = isNsCharOrWhitespace(c);
  var cIsNsChar = cIsNsCharOrWhitespace && !isWhitespace(c);
  return (
    // ns-plain-safe
    inblock ? // c = flow-in
      cIsNsCharOrWhitespace
      : cIsNsCharOrWhitespace
        // - c-flow-indicator
        && c !== CHAR_COMMA
        && c !== CHAR_LEFT_SQUARE_BRACKET
        && c !== CHAR_RIGHT_SQUARE_BRACKET
        && c !== CHAR_LEFT_CURLY_BRACKET
        && c !== CHAR_RIGHT_CURLY_BRACKET
  )
    // ns-plain-char
    && c !== CHAR_SHARP // false on '#'
    && !(prev === CHAR_COLON && !cIsNsChar) // false on ': '
    || (isNsCharOrWhitespace(prev) && !isWhitespace(prev) && c === CHAR_SHARP) // change to true on '[^ ]#'
    || (prev === CHAR_COLON && cIsNsChar); // change to true on ':[^ ]'
}

// Simplified test for values allowed as the first character in plain style.
function isPlainSafeFirst(c) {
  // Uses a subset of ns-char - c-indicator
  // where ns-char = nb-char - s-white.
  // No support of ( ( “?” | “:” | “-” ) /* Followed by an ns-plain-safe(c)) */ ) part
  return isPrintable(c) && c !== CHAR_BOM
    && !isWhitespace(c) // - s-white
    // - (c-indicator ::=
    // “-” | “?” | “:” | “,” | “[” | “]” | “{” | “}”
    && c !== CHAR_MINUS
    && c !== CHAR_QUESTION
    && c !== CHAR_COLON
    && c !== CHAR_COMMA
    && c !== CHAR_LEFT_SQUARE_BRACKET
    && c !== CHAR_RIGHT_SQUARE_BRACKET
    && c !== CHAR_LEFT_CURLY_BRACKET
    && c !== CHAR_RIGHT_CURLY_BRACKET
    // | “#” | “&” | “*” | “!” | “|” | “=” | “>” | “'” | “"”
    && c !== CHAR_SHARP
    && c !== CHAR_AMPERSAND
    && c !== CHAR_ASTERISK
    && c !== CHAR_EXCLAMATION
    && c !== CHAR_VERTICAL_LINE
    && c !== CHAR_EQUALS
    && c !== CHAR_GREATER_THAN
    && c !== CHAR_SINGLE_QUOTE
    && c !== CHAR_DOUBLE_QUOTE
    // | “%” | “@” | “`”)
    && c !== CHAR_PERCENT
    && c !== CHAR_COMMERCIAL_AT
    && c !== CHAR_GRAVE_ACCENT;
}

// Simplified test for values allowed as the last character in plain style.
function isPlainSafeLast(c) {
  // just not whitespace or colon, it will be checked to be plain character later
  return !isWhitespace(c) && c !== CHAR_COLON;
}

// Same as 'string'.codePointAt(pos), but works in older browsers.
function codePointAt(string, pos) {
  var first = string.charCodeAt(pos), second;
  if (first >= 0xD800 && first <= 0xDBFF && pos + 1 < string.length) {
    second = string.charCodeAt(pos + 1);
    if (second >= 0xDC00 && second <= 0xDFFF) {
      // https://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
      return (first - 0xD800) * 0x400 + second - 0xDC00 + 0x10000;
    }
  }
  return first;
}

// Determines whether block indentation indicator is required.
function needIndentIndicator(string) {
  var leadingSpaceRe = /^\n* /;
  return leadingSpaceRe.test(string);
}

var STYLE_PLAIN   = 1,
    STYLE_SINGLE  = 2,
    STYLE_LITERAL = 3,
    STYLE_FOLDED  = 4,
    STYLE_DOUBLE  = 5;

// Determines which scalar styles are possible and returns the preferred style.
// lineWidth = -1 => no limit.
// Pre-conditions: str.length > 0.
// Post-conditions:
//    STYLE_PLAIN or STYLE_SINGLE => no \n are in the string.
//    STYLE_LITERAL => no lines are suitable for folding (or lineWidth is -1).
//    STYLE_FOLDED => a line > lineWidth and can be folded (and lineWidth != -1).
function chooseScalarStyle(string, singleLineOnly, indentPerLevel, lineWidth,
  testAmbiguousType, quotingType, forceQuotes, inblock) {

  var i;
  var char = 0;
  var prevChar = null;
  var hasLineBreak = false;
  var hasFoldableLine = false; // only checked if shouldTrackWidth
  var shouldTrackWidth = lineWidth !== -1;
  var previousLineBreak = -1; // count the first line correctly
  var plain = isPlainSafeFirst(codePointAt(string, 0))
          && isPlainSafeLast(codePointAt(string, string.length - 1));

  if (singleLineOnly || forceQuotes) {
    // Case: no block styles.
    // Check for disallowed characters to rule out plain and single.
    for (i = 0; i < string.length; char >= 0x10000 ? i += 2 : i++) {
      char = codePointAt(string, i);
      if (!isPrintable(char)) {
        return STYLE_DOUBLE;
      }
      plain = plain && isPlainSafe(char, prevChar, inblock);
      prevChar = char;
    }
  } else {
    // Case: block styles permitted.
    for (i = 0; i < string.length; char >= 0x10000 ? i += 2 : i++) {
      char = codePointAt(string, i);
      if (char === CHAR_LINE_FEED) {
        hasLineBreak = true;
        // Check if any line can be folded.
        if (shouldTrackWidth) {
          hasFoldableLine = hasFoldableLine ||
            // Foldable line = too long, and not more-indented.
            (i - previousLineBreak - 1 > lineWidth &&
             string[previousLineBreak + 1] !== ' ');
          previousLineBreak = i;
        }
      } else if (!isPrintable(char)) {
        return STYLE_DOUBLE;
      }
      plain = plain && isPlainSafe(char, prevChar, inblock);
      prevChar = char;
    }
    // in case the end is missing a \n
    hasFoldableLine = hasFoldableLine || (shouldTrackWidth &&
      (i - previousLineBreak - 1 > lineWidth &&
       string[previousLineBreak + 1] !== ' '));
  }
  // Although every style can represent \n without escaping, prefer block styles
  // for multiline, since they're more readable and they don't add empty lines.
  // Also prefer folding a super-long line.
  if (!hasLineBreak && !hasFoldableLine) {
    // Strings interpretable as another type have to be quoted;
    // e.g. the string 'true' vs. the boolean true.
    if (plain && !forceQuotes && !testAmbiguousType(string)) {
      return STYLE_PLAIN;
    }
    return quotingType === QUOTING_TYPE_DOUBLE ? STYLE_DOUBLE : STYLE_SINGLE;
  }
  // Edge case: block indentation indicator can only have one digit.
  if (indentPerLevel > 9 && needIndentIndicator(string)) {
    return STYLE_DOUBLE;
  }
  // At this point we know block styles are valid.
  // Prefer literal style unless we want to fold.
  if (!forceQuotes) {
    return hasFoldableLine ? STYLE_FOLDED : STYLE_LITERAL;
  }
  return quotingType === QUOTING_TYPE_DOUBLE ? STYLE_DOUBLE : STYLE_SINGLE;
}

// Note: line breaking/folding is implemented for only the folded style.
// NB. We drop the last trailing newline (if any) of a returned block scalar
//  since the dumper adds its own newline. This always works:
//    • No ending newline => unaffected; already using strip "-" chomping.
//    • Ending newline    => removed then restored.
//  Importantly, this keeps the "+" chomp indicator from gaining an extra line.
function writeScalar(state, string, level, iskey, inblock) {
  state.dump = (function () {
    if (string.length === 0) {
      return state.quotingType === QUOTING_TYPE_DOUBLE ? '""' : "''";
    }
    if (!state.noCompatMode) {
      if (DEPRECATED_BOOLEANS_SYNTAX.indexOf(string) !== -1 || DEPRECATED_BASE60_SYNTAX.test(string)) {
        return state.quotingType === QUOTING_TYPE_DOUBLE ? ('"' + string + '"') : ("'" + string + "'");
      }
    }

    var indent = state.indent * Math.max(1, level); // no 0-indent scalars
    // As indentation gets deeper, let the width decrease monotonically
    // to the lower bound min(state.lineWidth, 40).
    // Note that this implies
    //  state.lineWidth ≤ 40 + state.indent: width is fixed at the lower bound.
    //  state.lineWidth > 40 + state.indent: width decreases until the lower bound.
    // This behaves better than a constant minimum width which disallows narrower options,
    // or an indent threshold which causes the width to suddenly increase.
    var lineWidth = state.lineWidth === -1
      ? -1 : Math.max(Math.min(state.lineWidth, 40), state.lineWidth - indent);

    // Without knowing if keys are implicit/explicit, assume implicit for safety.
    var singleLineOnly = iskey
      // No block styles in flow mode.
      || (state.flowLevel > -1 && level >= state.flowLevel);
    function testAmbiguity(string) {
      return testImplicitResolving(state, string);
    }

    switch (chooseScalarStyle(string, singleLineOnly, state.indent, lineWidth,
      testAmbiguity, state.quotingType, state.forceQuotes && !iskey, inblock)) {

      case STYLE_PLAIN:
        return string;
      case STYLE_SINGLE:
        return "'" + string.replace(/'/g, "''") + "'";
      case STYLE_LITERAL:
        return '|' + blockHeader(string, state.indent)
          + dropEndingNewline(indentString(string, indent));
      case STYLE_FOLDED:
        return '>' + blockHeader(string, state.indent)
          + dropEndingNewline(indentString(foldString(string, lineWidth), indent));
      case STYLE_DOUBLE:
        return '"' + escapeString(string) + '"';
      default:
        throw new exception('impossible error: invalid scalar style');
    }
  }());
}

// Pre-conditions: string is valid for a block scalar, 1 <= indentPerLevel <= 9.
function blockHeader(string, indentPerLevel) {
  var indentIndicator = needIndentIndicator(string) ? String(indentPerLevel) : '';

  // note the special case: the string '\n' counts as a "trailing" empty line.
  var clip =          string[string.length - 1] === '\n';
  var keep = clip && (string[string.length - 2] === '\n' || string === '\n');
  var chomp = keep ? '+' : (clip ? '' : '-');

  return indentIndicator + chomp + '\n';
}

// (See the note for writeScalar.)
function dropEndingNewline(string) {
  return string[string.length - 1] === '\n' ? string.slice(0, -1) : string;
}

// Note: a long line without a suitable break point will exceed the width limit.
// Pre-conditions: every char in str isPrintable, str.length > 0, width > 0.
function foldString(string, width) {
  // In folded style, $k$ consecutive newlines output as $k+1$ newlines—
  // unless they're before or after a more-indented line, or at the very
  // beginning or end, in which case $k$ maps to $k$.
  // Therefore, parse each chunk as newline(s) followed by a content line.
  var lineRe = /(\n+)([^\n]*)/g;

  // first line (possibly an empty line)
  var result = (function () {
    var nextLF = string.indexOf('\n');
    nextLF = nextLF !== -1 ? nextLF : string.length;
    lineRe.lastIndex = nextLF;
    return foldLine(string.slice(0, nextLF), width);
  }());
  // If we haven't reached the first content line yet, don't add an extra \n.
  var prevMoreIndented = string[0] === '\n' || string[0] === ' ';
  var moreIndented;

  // rest of the lines
  var match;
  while ((match = lineRe.exec(string))) {
    var prefix = match[1], line = match[2];
    moreIndented = (line[0] === ' ');
    result += prefix
      + (!prevMoreIndented && !moreIndented && line !== ''
        ? '\n' : '')
      + foldLine(line, width);
    prevMoreIndented = moreIndented;
  }

  return result;
}

// Greedy line breaking.
// Picks the longest line under the limit each time,
// otherwise settles for the shortest line over the limit.
// NB. More-indented lines *cannot* be folded, as that would add an extra \n.
function foldLine(line, width) {
  if (line === '' || line[0] === ' ') return line;

  // Since a more-indented line adds a \n, breaks can't be followed by a space.
  var breakRe = / [^ ]/g; // note: the match index will always be <= length-2.
  var match;
  // start is an inclusive index. end, curr, and next are exclusive.
  var start = 0, end, curr = 0, next = 0;
  var result = '';

  // Invariants: 0 <= start <= length-1.
  //   0 <= curr <= next <= max(0, length-2). curr - start <= width.
  // Inside the loop:
  //   A match implies length >= 2, so curr and next are <= length-2.
  while ((match = breakRe.exec(line))) {
    next = match.index;
    // maintain invariant: curr - start <= width
    if (next - start > width) {
      end = (curr > start) ? curr : next; // derive end <= length-2
      result += '\n' + line.slice(start, end);
      // skip the space that was output as \n
      start = end + 1;                    // derive start <= length-1
    }
    curr = next;
  }

  // By the invariants, start <= length-1, so there is something left over.
  // It is either the whole string or a part starting from non-whitespace.
  result += '\n';
  // Insert a break if the remainder is too long and there is a break available.
  if (line.length - start > width && curr > start) {
    result += line.slice(start, curr) + '\n' + line.slice(curr + 1);
  } else {
    result += line.slice(start);
  }

  return result.slice(1); // drop extra \n joiner
}

// Escapes a double-quoted string.
function escapeString(string) {
  var result = '';
  var char = 0;
  var escapeSeq;

  for (var i = 0; i < string.length; char >= 0x10000 ? i += 2 : i++) {
    char = codePointAt(string, i);
    escapeSeq = ESCAPE_SEQUENCES[char];

    if (!escapeSeq && isPrintable(char)) {
      result += string[i];
      if (char >= 0x10000) result += string[i + 1];
    } else {
      result += escapeSeq || encodeHex(char);
    }
  }

  return result;
}

function writeFlowSequence(state, level, object) {
  var _result = '',
      _tag    = state.tag,
      index,
      length,
      value;

  for (index = 0, length = object.length; index < length; index += 1) {
    value = object[index];

    if (state.replacer) {
      value = state.replacer.call(object, String(index), value);
    }

    // Write only valid elements, put null instead of invalid elements.
    if (writeNode(state, level, value, false, false) ||
        (typeof value === 'undefined' &&
         writeNode(state, level, null, false, false))) {

      if (_result !== '') _result += ',' + (!state.condenseFlow ? ' ' : '');
      _result += state.dump;
    }
  }

  state.tag = _tag;
  state.dump = '[' + _result + ']';
}

function writeBlockSequence(state, level, object, compact) {
  var _result = '',
      _tag    = state.tag,
      index,
      length,
      value;

  for (index = 0, length = object.length; index < length; index += 1) {
    value = object[index];

    if (state.replacer) {
      value = state.replacer.call(object, String(index), value);
    }

    // Write only valid elements, put null instead of invalid elements.
    if (writeNode(state, level + 1, value, true, true, false, true) ||
        (typeof value === 'undefined' &&
         writeNode(state, level + 1, null, true, true, false, true))) {

      if (!compact || _result !== '') {
        _result += generateNextLine(state, level);
      }

      if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
        _result += '-';
      } else {
        _result += '- ';
      }

      _result += state.dump;
    }
  }

  state.tag = _tag;
  state.dump = _result || '[]'; // Empty sequence if no valid values.
}

function writeFlowMapping(state, level, object) {
  var _result       = '',
      _tag          = state.tag,
      objectKeyList = Object.keys(object),
      index,
      length,
      objectKey,
      objectValue,
      pairBuffer;

  for (index = 0, length = objectKeyList.length; index < length; index += 1) {

    pairBuffer = '';
    if (_result !== '') pairBuffer += ', ';

    if (state.condenseFlow) pairBuffer += '"';

    objectKey = objectKeyList[index];
    objectValue = object[objectKey];

    if (state.replacer) {
      objectValue = state.replacer.call(object, objectKey, objectValue);
    }

    if (!writeNode(state, level, objectKey, false, false)) {
      continue; // Skip this pair because of invalid key;
    }

    if (state.dump.length > 1024) pairBuffer += '? ';

    pairBuffer += state.dump + (state.condenseFlow ? '"' : '') + ':' + (state.condenseFlow ? '' : ' ');

    if (!writeNode(state, level, objectValue, false, false)) {
      continue; // Skip this pair because of invalid value.
    }

    pairBuffer += state.dump;

    // Both key and value are valid.
    _result += pairBuffer;
  }

  state.tag = _tag;
  state.dump = '{' + _result + '}';
}

function writeBlockMapping(state, level, object, compact) {
  var _result       = '',
      _tag          = state.tag,
      objectKeyList = Object.keys(object),
      index,
      length,
      objectKey,
      objectValue,
      explicitPair,
      pairBuffer;

  // Allow sorting keys so that the output file is deterministic
  if (state.sortKeys === true) {
    // Default sorting
    objectKeyList.sort();
  } else if (typeof state.sortKeys === 'function') {
    // Custom sort function
    objectKeyList.sort(state.sortKeys);
  } else if (state.sortKeys) {
    // Something is wrong
    throw new exception('sortKeys must be a boolean or a function');
  }

  for (index = 0, length = objectKeyList.length; index < length; index += 1) {
    pairBuffer = '';

    if (!compact || _result !== '') {
      pairBuffer += generateNextLine(state, level);
    }

    objectKey = objectKeyList[index];
    objectValue = object[objectKey];

    if (state.replacer) {
      objectValue = state.replacer.call(object, objectKey, objectValue);
    }

    if (!writeNode(state, level + 1, objectKey, true, true, true)) {
      continue; // Skip this pair because of invalid key.
    }

    explicitPair = (state.tag !== null && state.tag !== '?') ||
                   (state.dump && state.dump.length > 1024);

    if (explicitPair) {
      if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
        pairBuffer += '?';
      } else {
        pairBuffer += '? ';
      }
    }

    pairBuffer += state.dump;

    if (explicitPair) {
      pairBuffer += generateNextLine(state, level);
    }

    if (!writeNode(state, level + 1, objectValue, true, explicitPair)) {
      continue; // Skip this pair because of invalid value.
    }

    if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
      pairBuffer += ':';
    } else {
      pairBuffer += ': ';
    }

    pairBuffer += state.dump;

    // Both key and value are valid.
    _result += pairBuffer;
  }

  state.tag = _tag;
  state.dump = _result || '{}'; // Empty mapping if no valid pairs.
}

function detectType(state, object, explicit) {
  var _result, typeList, index, length, type, style;

  typeList = explicit ? state.explicitTypes : state.implicitTypes;

  for (index = 0, length = typeList.length; index < length; index += 1) {
    type = typeList[index];

    if ((type.instanceOf  || type.predicate) &&
        (!type.instanceOf || ((typeof object === 'object') && (object instanceof type.instanceOf))) &&
        (!type.predicate  || type.predicate(object))) {

      if (explicit) {
        if (type.multi && type.representName) {
          state.tag = type.representName(object);
        } else {
          state.tag = type.tag;
        }
      } else {
        state.tag = '?';
      }

      if (type.represent) {
        style = state.styleMap[type.tag] || type.defaultStyle;

        if (_toString.call(type.represent) === '[object Function]') {
          _result = type.represent(object, style);
        } else if (_hasOwnProperty.call(type.represent, style)) {
          _result = type.represent[style](object, style);
        } else {
          throw new exception('!<' + type.tag + '> tag resolver accepts not "' + style + '" style');
        }

        state.dump = _result;
      }

      return true;
    }
  }

  return false;
}

// Serializes `object` and writes it to global `result`.
// Returns true on success, or false on invalid object.
//
function writeNode(state, level, object, block, compact, iskey, isblockseq) {
  state.tag = null;
  state.dump = object;

  if (!detectType(state, object, false)) {
    detectType(state, object, true);
  }

  var type = _toString.call(state.dump);
  var inblock = block;
  var tagStr;

  if (block) {
    block = (state.flowLevel < 0 || state.flowLevel > level);
  }

  var objectOrArray = type === '[object Object]' || type === '[object Array]',
      duplicateIndex,
      duplicate;

  if (objectOrArray) {
    duplicateIndex = state.duplicates.indexOf(object);
    duplicate = duplicateIndex !== -1;
  }

  if ((state.tag !== null && state.tag !== '?') || duplicate || (state.indent !== 2 && level > 0)) {
    compact = false;
  }

  if (duplicate && state.usedDuplicates[duplicateIndex]) {
    state.dump = '*ref_' + duplicateIndex;
  } else {
    if (objectOrArray && duplicate && !state.usedDuplicates[duplicateIndex]) {
      state.usedDuplicates[duplicateIndex] = true;
    }
    if (type === '[object Object]') {
      if (block && (Object.keys(state.dump).length !== 0)) {
        writeBlockMapping(state, level, state.dump, compact);
        if (duplicate) {
          state.dump = '&ref_' + duplicateIndex + state.dump;
        }
      } else {
        writeFlowMapping(state, level, state.dump);
        if (duplicate) {
          state.dump = '&ref_' + duplicateIndex + ' ' + state.dump;
        }
      }
    } else if (type === '[object Array]') {
      if (block && (state.dump.length !== 0)) {
        if (state.noArrayIndent && !isblockseq && level > 0) {
          writeBlockSequence(state, level - 1, state.dump, compact);
        } else {
          writeBlockSequence(state, level, state.dump, compact);
        }
        if (duplicate) {
          state.dump = '&ref_' + duplicateIndex + state.dump;
        }
      } else {
        writeFlowSequence(state, level, state.dump);
        if (duplicate) {
          state.dump = '&ref_' + duplicateIndex + ' ' + state.dump;
        }
      }
    } else if (type === '[object String]') {
      if (state.tag !== '?') {
        writeScalar(state, state.dump, level, iskey, inblock);
      }
    } else if (type === '[object Undefined]') {
      return false;
    } else {
      if (state.skipInvalid) return false;
      throw new exception('unacceptable kind of an object to dump ' + type);
    }

    if (state.tag !== null && state.tag !== '?') {
      // Need to encode all characters except those allowed by the spec:
      //
      // [35] ns-dec-digit    ::=  [#x30-#x39] /* 0-9 */
      // [36] ns-hex-digit    ::=  ns-dec-digit
      //                         | [#x41-#x46] /* A-F */ | [#x61-#x66] /* a-f */
      // [37] ns-ascii-letter ::=  [#x41-#x5A] /* A-Z */ | [#x61-#x7A] /* a-z */
      // [38] ns-word-char    ::=  ns-dec-digit | ns-ascii-letter | “-”
      // [39] ns-uri-char     ::=  “%” ns-hex-digit ns-hex-digit | ns-word-char | “#”
      //                         | “;” | “/” | “?” | “:” | “@” | “&” | “=” | “+” | “$” | “,”
      //                         | “_” | “.” | “!” | “~” | “*” | “'” | “(” | “)” | “[” | “]”
      //
      // Also need to encode '!' because it has special meaning (end of tag prefix).
      //
      tagStr = encodeURI(
        state.tag[0] === '!' ? state.tag.slice(1) : state.tag
      ).replace(/!/g, '%21');

      if (state.tag[0] === '!') {
        tagStr = '!' + tagStr;
      } else if (tagStr.slice(0, 18) === 'tag:yaml.org,2002:') {
        tagStr = '!!' + tagStr.slice(18);
      } else {
        tagStr = '!<' + tagStr + '>';
      }

      state.dump = tagStr + ' ' + state.dump;
    }
  }

  return true;
}

function getDuplicateReferences(object, state) {
  var objects = [],
      duplicatesIndexes = [],
      index,
      length;

  inspectNode(object, objects, duplicatesIndexes);

  for (index = 0, length = duplicatesIndexes.length; index < length; index += 1) {
    state.duplicates.push(objects[duplicatesIndexes[index]]);
  }
  state.usedDuplicates = new Array(length);
}

function inspectNode(object, objects, duplicatesIndexes) {
  var objectKeyList,
      index,
      length;

  if (object !== null && typeof object === 'object') {
    index = objects.indexOf(object);
    if (index !== -1) {
      if (duplicatesIndexes.indexOf(index) === -1) {
        duplicatesIndexes.push(index);
      }
    } else {
      objects.push(object);

      if (Array.isArray(object)) {
        for (index = 0, length = object.length; index < length; index += 1) {
          inspectNode(object[index], objects, duplicatesIndexes);
        }
      } else {
        objectKeyList = Object.keys(object);

        for (index = 0, length = objectKeyList.length; index < length; index += 1) {
          inspectNode(object[objectKeyList[index]], objects, duplicatesIndexes);
        }
      }
    }
  }
}

function dump$1(input, options) {
  options = options || {};

  var state = new State(options);

  if (!state.noRefs) getDuplicateReferences(input, state);

  var value = input;

  if (state.replacer) {
    value = state.replacer.call({ '': value }, '', value);
  }

  if (writeNode(state, 0, value, true, true)) return state.dump + '\n';

  return '';
}

var dump_1 = dump$1;

var dumper = {
	dump: dump_1
};

function renamed(from, to) {
  return function () {
    throw new Error('Function yaml.' + from + ' is removed in js-yaml 4. ' +
      'Use yaml.' + to + ' instead, which is now safe by default.');
  };
}


var Type                = type;
var Schema              = schema;
var FAILSAFE_SCHEMA     = failsafe;
var JSON_SCHEMA         = json;
var CORE_SCHEMA         = core;
var DEFAULT_SCHEMA      = _default;
var load                = loader.load;
var loadAll             = loader.loadAll;
var dump                = dumper.dump;
var YAMLException       = exception;

// Re-export all types in case user wants to create custom schema
var types = {
  binary:    binary,
  float:     js_yaml_float,
  map:       map,
  null:      _null,
  pairs:     pairs,
  set:       set,
  timestamp: timestamp,
  bool:      bool,
  int:       js_yaml_int,
  merge:     merge,
  omap:      omap,
  seq:       seq,
  str:       str
};

// Removed functions from JS-YAML 3.0.x
var safeLoad            = renamed('safeLoad', 'load');
var safeLoadAll         = renamed('safeLoadAll', 'loadAll');
var safeDump            = renamed('safeDump', 'dump');

var jsYaml = {
	Type: Type,
	Schema: Schema,
	FAILSAFE_SCHEMA: FAILSAFE_SCHEMA,
	JSON_SCHEMA: JSON_SCHEMA,
	CORE_SCHEMA: CORE_SCHEMA,
	DEFAULT_SCHEMA: DEFAULT_SCHEMA,
	load: load,
	loadAll: loadAll,
	dump: dump,
	YAMLException: YAMLException,
	types: types,
	safeLoad: safeLoad,
	safeLoadAll: safeLoadAll,
	safeDump: safeDump
};



;// ./src/Singleton.ts
// https://gist.github.com/ilfroloff/76fa55d041b6a1cd2dbe

const singleton = Symbol('singleton');
class Singleton {
  constructor() {
    const Class = new.target; // or this.constructor

    if (!Class[singleton]) {
      Class[singleton] = this;
    }
    return Class[singleton];
  }
}
;// ./src/TestContent.ts








const resolveTest = test => {
  const {
    PPD_LIFE_CYCLE_FUNCTIONS
  } = new Arguments().args;

  // todo: e2e test
  const duplicateKeys = PPD_LIFE_CYCLE_FUNCTIONS.filter(key => Object.keys(BLANK_AGENT).includes(key));
  if (duplicateKeys.length) {
    throw new Error(`PPD_LIFE_CYCLE_FUNCTIONS contains keys that duplicate BLANK_AGENT keys: ${duplicateKeys.join(', ')}`);
  }
  const result = {
    ...BLANK_AGENT,
    ...PPD_LIFE_CYCLE_FUNCTIONS.reduce((s, v) => ({
      ...s,
      [v]: []
    }), {}),
    ...test
  };
  return result;
};
class AgentContent extends Singleton {
  // TODO: Сделать геттер а это поле приватным

  constructor(reInit = false) {
    super();
    if (reInit || !this.allData) {
      this.allData = this.getAllData();
    }
  }
  static getPaths() {
    const {
      PPD_ROOT,
      PPD_ROOT_ADDITIONAL,
      PPD_ROOT_IGNORE,
      PPD_FILES_IGNORE,
      PPD_FILES_EXTENSIONS_AVAILABLE
    } = new Arguments().args;
    const rootFolder = external_path_default().normalize(PPD_ROOT);
    const additionalFolders = PPD_ROOT_ADDITIONAL.map(v => external_path_default().normalize(v));
    const ignoreFolders = PPD_ROOT_IGNORE.map(v => external_path_default().normalize(v));
    const ignoreFiles = PPD_FILES_IGNORE.map(v => external_path_default().join(rootFolder, external_path_default().normalize(v)));
    const folders = [rootFolder, ...additionalFolders].map(v => external_path_default().normalize(v));
    const paths = folders.flatMap(folder => {
      if (external_fs_default().existsSync(folder)) {
        return (0,dist.walkSync)(folder, {
          ignoreFolders,
          ignoreFiles,
          includeExtensions: PPD_FILES_EXTENSIONS_AVAILABLE
        });
      }
      return [];
    });
    return paths;
  }

  /**
   * Checks array of agents for duplicates and empty names
   *
   * @param agents Array of agents to check
   * @returns Original array of agents if no duplicates found
   * @throws {Error} If empty names or duplicates are found
   */
  static checkDuplicates(agents) {
    const blankNames = agents.filter(v => !v.name);
    if (blankNames.length) {
      throw new Error(`There is blank 'name' value in files:\n${blankNames.map(v => v.testFile).join('\n')}`);
    }
    const dubs = {};
    agents.forEach(test => {
      if (test.testFile) {
        const arr = dubs[test.name] || [];
        arr.push(test.testFile);
        dubs[test.name] = arr;
      }
    });
    if (Object.values(dubs).some(v => v.length > 1)) {
      const key = agents[0].type;
      const files = Object.entries(dubs).filter(([, valueDub]) => valueDub.length > 1).map(([keyDub, valueDub]) => `- Name: '${keyDub}'.\n${valueDub.map(v => `    * '${v}'\n`).join('')}`).join('\n');
      const message = `There is duplicates of '${key}':\n${files}`;
      throw new Error(message);
    }
    return agents;
  }

  /**
   * Reads the file and returns its content as an array of partially typed agents.
   *
   * @param filePath - The path to the file.
   * @returns An array of partially typed agents.
   */
  static readFile = filePath => {
    let agentData = [];
    try {
      const fileContent = external_fs_default().readFileSync(filePath, 'utf8');
      if (filePath.endsWith('.json')) {
        agentData = JSON.parse(fileContent);
      } else {
        agentData = jsYaml.loadAll(fileContent);
      }
    } catch {
      const errorType = filePath.endsWith('.json') ? 'JSON' : 'YAML';
      const errorLink = filePath.endsWith('.json') ? 'https://jsonlint.com/' : 'https://yamlchecker.com/';
      console.log(`\u001B[41mError ${errorType} read. File: '${filePath}'. Try to check it on ${errorLink}
          or add this file into PPD_FILES_IGNORE of folder into PPD_ROOT_IGNORE`);
    }
    if (!Array.isArray(agentData)) {
      return [agentData];
    }
    return agentData;
  };

  /**
   * Resolving the agent file, checking for the presence of a name.
   *
   * @param agentContent - Partial YAML agent type.
   * @param filePath - Path to the agent file.
   * @returns Returns the full YAML agent type, Runner type, or Data type.
   */
  static fileResolver = (agentContent, filePath) => {
    const {
      PPD_IGNORE_AGENTS_WITHOUT_NAME
    } = new Arguments().args;
    const {
      name
    } = agentContent;
    if (!name && !PPD_IGNORE_AGENTS_WITHOUT_NAME) {
      throw new Error('Every agent need name');
    }
    if (!name) {
      return;
    }
    const collect = {
      ...{
        name
      },
      ...agentContent,
      ...{
        testFile: filePath
      }
    };
    if (!(collect.testFile || collect.inlineJS)) {
      return resolveTest(collect);
    }
    return collect;
  };

  /**
   * Merges content from files and raw sources, prioritizing raw content over file content for duplicates.
   * Maintains the order of first appearance.
   *
   * @param allContentFromFiles - Array of content loaded from files.
   * @param allContentFromRaw - Array of content from raw arguments.
   * @returns Merged array of content with duplicates resolved.
   */
  static mergeContentWithRaw(allContentFromFiles, allContentFromRaw) {
    const getContentKey = item => {
      if (!(item !== null && item !== void 0 && item.name)) return null;
      const type = ['data', 'selectors', 'runner'].includes(item.type) ? item.type : 'agent';
      return `${type}:${item.name}`;
    };
    const orderedKeys = [];
    const contentMap = new Map();
    const upsert = item => {
      const key = getContentKey(item);
      if (!key) return;
      if (!contentMap.has(key)) {
        orderedKeys.push(key);
      }
      contentMap.set(key, item);
    };
    allContentFromFiles.forEach(upsert);
    allContentFromRaw.forEach(upsert);
    return orderedKeys.map(key => contentMap.get(key)).filter(Boolean);
  }

  /**
   * Normalizes raw entries from PPD_TESTS_RAW, parsing YAML/JSON strings and flattening arrays.
   * @param raw - The raw entries array from arguments.
   * @returns An array of partial TestTypeYaml objects.
   */
  static normalizeRawEntries = raw => {
    const rawArray = (raw !== null && raw !== void 0 ? raw : []).flatMap(v => Array.isArray(v) ? v : [v]);
    const result = [];
    const pushParsed = parsed => {
      if (Array.isArray(parsed)) {
        parsed.forEach(item => {
          if (item && typeof item === 'object') {
            result.push(item);
          } else {
            throw new Error('PPD_TESTS_RAW contains non-object entry in array');
          }
        });
        return;
      }
      if (parsed && typeof parsed === 'object') {
        result.push(parsed);
        return;
      }
      throw new Error('PPD_TESTS_RAW contains invalid YAML/JSON content');
    };
    rawArray.forEach(entry => {
      if (!entry) return;
      if (typeof entry === 'string') {
        const trimmed = entry.trim();
        let parsed;
        if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
          try {
            parsed = JSON.parse(trimmed);
            pushParsed(parsed);
            return;
          } catch {
            // fallback to YAML
          }
        }
        try {
          parsed = jsYaml.loadAll(entry);
          pushParsed(parsed);
        } catch {
          throw new Error('PPD_TESTS_RAW contains invalid YAML/JSON string');
        }
        return;
      }
      if (typeof entry === 'object') {
        result.push(entry);
      }
    });
    return result.filter(v => v && typeof v === 'object');
  };

  /**
   * Retrieves all data, including files, content, agents, runners, data, and selectors.
   * If force is true, the data will be retrieved anew; otherwise, it will be returned from the cache.
   *
   * @param force - A flag indicating whether to retrieve the data anew.
   * @returns An object containing all retrieved data.
   */
  getAllData(force = false) {
    if (force || !this.allData) {
      const {
        PPD_TESTS_RAW
      } = new Arguments().args;
      const allFiles = AgentContent.getPaths();
      const allContentFromFiles = allFiles.flatMap(filePath => AgentContent.readFile(filePath).map(v => AgentContent.fileResolver(v, filePath)));
      const allContentFromRaw = AgentContent.normalizeRawEntries(PPD_TESTS_RAW).map(v => {
        const rawTestFile = typeof v.testFile === 'string' && v.testFile ? v.testFile : 'PPD_TESTS_RAW';
        return AgentContent.fileResolver(v, rawTestFile);
      }).filter(Boolean);
      const allContent = AgentContent.mergeContentWithRaw(allContentFromFiles, allContentFromRaw);
      const agents = AgentContent.checkDuplicates(allContent.filter(v => !['data', 'selectors', 'runner'].includes(v.type)));
      const data = AgentContent.checkDuplicates(allContent.filter(v => v.type === 'data'));
      const selectors = AgentContent.checkDuplicates(allContent.filter(v => v.type === 'selectors'));
      const runners = AgentContent.checkDuplicates(allContent.filter(v => v.type === 'runner'));
      const runnersResolved = AgentContent.resolveRunners(runners, data, selectors);
      this.allData = {
        allFiles,
        allContent,
        agents,
        runners: runnersResolved,
        data,
        selectors
      };
    }
    return this.allData;
  }

  /**
   * Resolves and merges extensions for runners.
   *
   * @param runnersAll - Array of all runners
   * @param dataAll - Array of all data
   * @param selectorsAll - Array of all selectors
   * @returns Array of resolved runners with merged extensions
   *
   * Function handles three types of extensions:
   * 1. runnersExt - Extension from other runners (inherits browser, log, data, selectors, description)
   * 2. dataExt - Extension of data from external files
   * 3. selectorsExt - Extension of selectors from external files
   *
   * When resolving extensions:
   * - Checks existence of extended resources
   * - Merges properties considering priorities
   * - Updates description to reflect inheritance chain
   * - Throws error if extended resource is not found
   */
  static resolveRunners(runnersAll, dataAll, selectorsAll) {
    return runnersAll.map(runner => {
      const runnerResult = runner;
      const {
        dataExt = [],
        selectorsExt = [],
        runnersExt = [],
        data: dataRunner = {},
        selectors: selectorsRunner = {}
      } = runner;
      runnersExt.forEach(runnerExtName => {
        const runnerExt = runnersAll.find(r => r.name === runnerExtName);
        if (runnerExt) {
          var _runnerResult$descrip, _runnerExt$descriptio;
          if (runnerExt.browser) {
            runnerResult.browser = mergeObjects([runnerResult.browser, runnerExt.browser]);
          }
          ['log', 'data', 'selectors'].forEach(key => {
            var _runnerResult$key, _runnerExt$key;
            runnerResult[key] = {
              ...((_runnerResult$key = runnerResult[key]) !== null && _runnerResult$key !== void 0 ? _runnerResult$key : {}),
              ...((_runnerExt$key = runnerExt[key]) !== null && _runnerExt$key !== void 0 ? _runnerExt$key : {})
            };
          });
          runnerResult.description = `${(_runnerResult$descrip = runnerResult.description) !== null && _runnerResult$descrip !== void 0 ? _runnerResult$descrip : ''} -> ${(_runnerExt$descriptio = runnerExt.description) !== null && _runnerExt$descriptio !== void 0 ? _runnerExt$descriptio : ''}`;
        } else {
          throw new Error(`PuppeDo can't resolve extended runner '${runnerExtName}' in runner '${runnerResult.name}'`);
        }
      });
      const resolveExtensions = (extNames, collection, type, runnerValues) => {
        extNames.forEach(extName => {
          var _runnerResult$type, _collectionExt$data;
          const collectionExt = collection.find(item => item.name === extName);
          if (!collectionExt) {
            throw new Error(`PuppeDo can't resolve extended ${type} '${extName}' in runner '${runner.name}'`);
          }
          Object.assign(runnerResult, {
            [type]: {
              ...((_runnerResult$type = runnerResult[type]) !== null && _runnerResult$type !== void 0 ? _runnerResult$type : {}),
              ...((_collectionExt$data = collectionExt.data) !== null && _collectionExt$data !== void 0 ? _collectionExt$data : {}),
              ...runnerValues
            }
          });
        });
      };
      resolveExtensions(dataExt, dataAll, 'data', dataRunner);
      resolveExtensions(selectorsExt, selectorsAll, 'selectors', selectorsRunner);
      return runnerResult;
    });
  }
}
;// ./src/FlowStructure.ts



class FlowStructure {
  static generateFlowDescription(flowJSON, indentLength = 3) {
    const {
      PPD_LIFE_CYCLE_FUNCTIONS
    } = new Arguments().args;
    const {
      description,
      name,
      todo,
      levelIndent = 0
    } = flowJSON;
    const descriptionString = [' '.repeat(levelIndent * indentLength), todo ? `TODO: ${todo}== ` : '', description ? `${description} ` : '', name ? `(${name})` : ''].join('');
    const blocks = PPD_LIFE_CYCLE_FUNCTIONS.flatMap(v => flowJSON[v] || []).filter(v => typeof v !== 'function').map(v => FlowStructure.generateFlowDescription(v)).join('');
    const result = `${descriptionString}\n${blocks}`;
    return result;
  }
  static getFlowRaw(name) {
    const {
      agents
    } = new AgentContent().allData;
    const agentSource = agents.find(v => v.name === name);
    if (!agentSource) {
      return resolveTest({
        name: String(name)
      });
    }
    return JSON.parse(JSON.stringify(agentSource));
  }
  static getFlowFullJSON(flowName, flowBody = null, levelIndent = 0, resolved = true) {
    var _fullJSON$stepId;
    const rawTest = FlowStructure.getFlowRaw(flowName);

    // TODO: 2025-03-11 S.Starodubov logOptions
    const fullJSON = resolved ? deepMergeField(rawTest, flowBody !== null && flowBody !== void 0 ? flowBody : {}, ['logOptions']) : JSON.parse(JSON.stringify({
      ...flowBody,
      ...rawTest
    }));
    fullJSON.breadcrumbs = fullJSON.breadcrumbs || [flowName];
    fullJSON.breadcrumbsDescriptions = fullJSON.breadcrumbsDescriptions || [];
    fullJSON.levelIndent = levelIndent;
    fullJSON.stepId = (_fullJSON$stepId = fullJSON.stepId) !== null && _fullJSON$stepId !== void 0 ? _fullJSON$stepId : generateId();
    fullJSON.source = JSON.stringify(fullJSON, null, 2);
    const {
      PPD_LIFE_CYCLE_FUNCTIONS
    } = new Arguments().args;
    PPD_LIFE_CYCLE_FUNCTIONS.forEach(lifeCycleFunctionName => {
      const lifeCycleFunctionValue = fullJSON[lifeCycleFunctionName] || [];
      if (!Array.isArray(lifeCycleFunctionValue)) {
        const errorString = `Block '${lifeCycleFunctionName}' in agent '${fullJSON.name}' in file '${fullJSON.testFile}' must be array of agents`;
        throw new Error(errorString);
      }
      lifeCycleFunctionValue.forEach((runnerValue, runnerNum) => {
        var _Object$values$;
        if (Object.keys(runnerValue).length !== 1) {
          const errorString = `Block '${lifeCycleFunctionName}' in agent '${fullJSON.name}' in file '${fullJSON.testFile}' must be array of agents with one key each`;
          throw new Error(errorString);
        }
        const name = Object.keys(runnerValue)[0];
        const runner = (_Object$values$ = Object.values(runnerValue)[0]) !== null && _Object$values$ !== void 0 ? _Object$values$ : resolveTest({
          name
        });
        runner.name = name;
        runner.breadcrumbs = [...fullJSON.breadcrumbs, `${lifeCycleFunctionName}[${runnerNum}].${name}`];
        runner.breadcrumbsDescriptions = [...fullJSON.breadcrumbsDescriptions, fullJSON.description];
        const fullJSONResponce = FlowStructure.getFlowFullJSON(name, runner, levelIndent + 1, !!Object.values(runnerValue)[0]);
        fullJSON[lifeCycleFunctionName][runnerNum] = fullJSONResponce;
      });
    });
    return fullJSON;
  }
}
;// ./src/Screenshot.ts




class Screenshot {
  constructor(envsId) {
    this.envsId = envsId;
  }
  static async copyScreenshotToFolder(pathScreenshot, folder, name = '') {
    const fileName = name ? name + external_path_default().extname(pathScreenshot) : external_path_default().basename(pathScreenshot);
    const pathScreenshotNew = external_path_default().join(folder, fileName);
    if (!external_fs_default().existsSync(folder)) {
      external_fs_default().mkdirSync(folder, {
        recursive: true
      });
    }
    if (external_fs_default().existsSync(pathScreenshot)) {
      external_fs_default().copyFileSync(pathScreenshot, pathScreenshotNew);
    }
  }
  async copyScreenshotToLatest(pathScreenshot) {
    const {
      folderLatest = '.'
    } = new Environment().getOutput(this.envsId);
    await Screenshot.copyScreenshotToFolder(pathScreenshot, folderLatest);
  }
  getScreenshotName(nameIncome) {
    // TODO: 2022-10-21 S.Starodubov todo
    const {
      folder = '.'
    } = new Environment().getOutput(this.envsId);
    const name = `${nameIncome || getNowDateTime()}.png`;
    return external_path_default().resolve(external_path_default().join(folder, name));
  }
  async saveScreenshotElement(element, name, copyToLatest = true) {
    const pathScreenshot = this.getScreenshotName(name);
    try {
      if (element) {
        await element.screenshot({
          path: pathScreenshot
        });
        if (copyToLatest) {
          await this.copyScreenshotToLatest(pathScreenshot);
        }
        return pathScreenshot;
      }
    } catch {
      // Nothing to do
    }
    return '';
  }
  async saveScreenshotFull(nameIncome, copyToLatest = true) {
    const name = `${nameIncome || getNowDateTime()}_full.png`;
    const pathScreenshot = this.getScreenshotName(name);
    try {
      const page = new Environment().getEnvRunners(this.envsId).getActivePage();
      if (page) {
        await page.screenshot({
          path: pathScreenshot,
          fullPage: true
        });
        if (copyToLatest) {
          await this.copyScreenshotToLatest(pathScreenshot);
        }
        return pathScreenshot;
      }
    } catch {
      // Nothing to do
    }
    return '';
  }
  async getScreenshotsLogEntry(isFullpage, isScreenshot, element, fullpageName, screenshotName) {
    const fullPageScreenshot = isFullpage ? await this.saveScreenshotFull(fullpageName) : [];
    const elementsScreenshots = isScreenshot ? await this.saveScreenshotElement(element, screenshotName) : [];
    const screenshots = [fullPageScreenshot, elementsScreenshots].flat().filter(v => !!v);
    return screenshots;
  }
}
;// ./src/Log.ts
var __webpack_dirname__ = "src";







const LEVELS = ['raw', 'timer', 'debug', 'info', 'test', 'warn', 'error', 'env'];
class LogExports {
  constructor(envsId) {
    this.envsId = envsId;
  }
  saveToFile(fileName, text) {
    const {
      folderLatest,
      folder
    } = new Environment().getOutput(this.envsId);
    external_fs_default().writeFileSync(external_path_default().join(folder, fileName), text);
    external_fs_default().writeFileSync(external_path_default().join(folderLatest, fileName), text);
  }
  appendToFile(fileName, text) {
    const {
      folderLatest,
      folder
    } = new Environment().getOutput(this.envsId);
    external_fs_default().appendFileSync(external_path_default().join(folder, fileName), text);
    external_fs_default().appendFileSync(external_path_default().join(folderLatest, fileName), text);
  }
  static resolveOutputHtmlFile() {
    const outputSourceRaw = external_path_default().resolve(external_path_default().join('dist', 'output.html'));
    const outputSourceModule = external_path_default().resolve(external_path_default().join(__webpack_dirname__, '..', 'node_modules', '@puppedo', 'core', 'dist', 'output.html'));
    const outputSource = external_fs_default().existsSync(outputSourceRaw) ? outputSourceRaw : outputSourceModule;
    return outputSource;
  }
  static initOutput(envsId) {
    const {
      PPD_OUTPUT: output
    } = new Arguments().args;
    const now = getNowDateTime();
    if (!external_fs_default().existsSync(output)) {
      external_fs_default().mkdirSync(output);
    }
    const folder = external_path_default().join(output, `${now}_${envsId}`);
    const folderLatest = external_path_default().join(output, 'latest');
    if (!external_fs_default().existsSync(folder)) {
      external_fs_default().mkdirSync(folder);
    }

    // Create latest log path
    if (!external_fs_default().existsSync(folderLatest)) {
      external_fs_default().mkdirSync(folderLatest);
    } else {
      const filesExists = external_fs_default().readdirSync(folderLatest);
      for (const fileExists of filesExists) {
        external_fs_default().unlinkSync(external_path_default().join(folderLatest, fileExists));
      }
    }
    try {
      external_fs_default().copyFileSync(LogExports.resolveOutputHtmlFile(), external_path_default().join(folderLatest, 'output.html'));
      external_fs_default().copyFileSync(LogExports.resolveOutputHtmlFile(), external_path_default().join(folder, 'output.html'));
    } catch {
      // Handle error if needed
    }
    return {
      output,
      name: envsId,
      folder,
      folderFull: external_path_default().resolve(folder),
      folderLatest,
      folderLatestFull: external_path_default().resolve(folderLatest)
    };
  }
}
class LogOptions extends Singleton {
  constructor(options = {}, reInit = false) {
    super();
    if (reInit || !this.options) {
      this.options = options;
      if (!this.options.loggerPipes) {
        this.options.loggerPipes = [];
      }
    }
  }
  bindOptions(data = {}) {
    this.options = {
      ...this.options,
      ...data
    };
  }
  addLogPipe(pipe) {
    this.options.loggerPipes.push(pipe);
  }
}
class Log {
  constructor(envsId) {
    this.envsId = envsId;
    this.output = LogExports.initOutput(envsId);
    this.exporter = new LogExports(envsId);
  }
  static checkLevel(level) {
    const {
      PPD_LOG_LEVEL_TYPE_IGNORE
    } = new Arguments().args;
    return !(PPD_LOG_LEVEL_TYPE_IGNORE.includes(level) || !LEVELS.includes(level));
  }
  static isManualSkipEntry(level, logThis, logShowFlag, levelIndent) {
    const {
      PPD_LOG_DISABLED,
      PPD_LOG_LEVEL_NESTED
    } = new Arguments().args;
    const manualSkipEntry = !Log.checkLevel(level) || !logThis || level !== 'error' && !logShowFlag || level !== 'error' && PPD_LOG_LEVEL_NESTED && levelIndent > PPD_LOG_LEVEL_NESTED ||
    // SKIP LOG BY LEVELS
    level !== 'error' && PPD_LOG_DISABLED; // NO LOG FILES ONLY STDOUT
    return manualSkipEntry;
  }
  async getScreenshots(logOptions, level, levelIndent, extendInfo, element) {
    const {
      PPD_LOG_SCREENSHOT,
      PPD_LOG_FULLPAGE
    } = new Arguments().args;
    const {
      screenshot = false,
      fullpage = false,
      fullpageName,
      screenshotName
    } = logOptions;
    if (!Log.checkLevel(level)) {
      return [];
    }

    // TODO: 2020-02-05 S.Starodubov get values from env.yaml
    let isScreenshot = PPD_LOG_SCREENSHOT ? screenshot : false;
    let isFullpage = PPD_LOG_FULLPAGE ? fullpage : false;

    // SCREENSHOT ON ERROR ONLY ONES
    if (level === 'error' && levelIndent === 0) {
      [isScreenshot, isFullpage] = [true, true];
    }
    const screenshots = await new Screenshot(this.envsId).getScreenshotsLogEntry(isFullpage && !extendInfo, isScreenshot && !extendInfo, element, fullpageName, screenshotName);
    return screenshots;
  }
  async bulkLog(data) {
    for (const entry of data) {
      await this.log(entry);
    }
  }
  async runPipes(logEntries, manualSkipEntry = false) {
    const {
      loggerPipes,
      stdOut = true
    } = new LogOptions().options;
    for (const logEntry of logEntries) {
      for (const pipe of loggerPipes) {
        try {
          const transformedEntry = await pipe.transformer(logEntry);
          const formatedEntry = await pipe.formatter(logEntry, transformedEntry);
          await pipe.exporter(logEntry, formatedEntry, formatedEntry, {
            envsId: this.envsId,
            skipThis: !stdOut || manualSkipEntry
          });
        } catch (e) {
          console.log(`Error in logger pipe: ${e.message}`);
        }
      }
    }
  }
  updateTree(logEntries) {
    const {
      testTree
    } = new Environment().getEnvInstance(this.envsId);
    for (const logEntry of logEntries) {
      const payload = {};
      if (logEntry.level === 'timer') {
        var _logEntry$logMeta, _logEntry$logMeta2;
        payload.timeStart = (_logEntry$logMeta = logEntry.logMeta) === null || _logEntry$logMeta === void 0 ? void 0 : _logEntry$logMeta.timeStart;
        payload.timeEnd = (_logEntry$logMeta2 = logEntry.logMeta) === null || _logEntry$logMeta2 === void 0 ? void 0 : _logEntry$logMeta2.timeEnd;
      }
      testTree.updateStep({
        stepId: logEntry.stepId,
        payload
      });
    }
  }
  async log({
    text = '',
    level = 'raw',
    levelIndent = 0,
    element,
    error = null,
    stepId = '',
    logMeta = {},
    logOptions = {}
  }) {
    const texts = [text].flat();
    const {
      textColor = 'sane',
      backgroundColor = 'sane',
      logThis = true,
      logShowFlag = true
    } = logOptions;
    const {
      funcFile = '',
      testFile = '',
      extendInfo = false
    } = logMeta;
    const manualSkipEntry = Log.isManualSkipEntry(level, logThis, logShowFlag, levelIndent);
    const screenshots = await this.getScreenshots(logOptions, level, levelIndent, extendInfo, element);
    try {
      const logEntries = texts.map(textString => {
        var _logMeta$breadcrumbs, _logMeta$repeat;
        const logEntry = {
          text: textString,
          level: level !== null && level !== void 0 ? level : 'raw',
          levelIndent,
          time: new Date(),
          screenshots,
          funcFile,
          testFile,
          extendInfo,
          error,
          textColor,
          backgroundColor: level === 'error' ? 'sane' : backgroundColor,
          stepId,
          breadcrumbs: (_logMeta$breadcrumbs = logMeta.breadcrumbs) !== null && _logMeta$breadcrumbs !== void 0 ? _logMeta$breadcrumbs : [],
          repeat: (_logMeta$repeat = logMeta.repeat) !== null && _logMeta$repeat !== void 0 ? _logMeta$repeat : 1,
          logMeta
        };
        return logEntry;
      });
      this.updateTree(logEntries);
      await this.runPipes(logEntries, manualSkipEntry);
    } catch (err) {
      const {
        PPD_DEBUG_MODE
      } = new Arguments().args;
      const socket = new Environment().getSocket(this.envsId);
      err.message += ' || error in log';
      err.socket = socket;
      err.debug = PPD_DEBUG_MODE;
      err.stepId = stepId !== null && stepId !== void 0 ? stepId : '';
      throw err;
    }
  }
}
;// ./src/Plugins/argsRedefine/argsRedefine.ts


function setValue({
  inputs,
  stepId
}) {
  this.setValues(stepId, inputs);
}
const argsRedefine_plugin = plugins => {
  const pluginInstance = new Plugin({
    name: argsRedefine_name,
    defaultValues: {
      argsRedefine: new Arguments().args
    },
    propogation: {
      argsRedefine: {
        type: 'lastParent'
      }
    },
    hooks: {
      initValues: setValue,
      runLogic: setValue
    },
    plugins
  });
  return pluginInstance;
};
// todo: переименовать в args
const argsRedefine_name = 'argsRedefine';
const documentation = {
  description: {
    ru: ['Переопределение агрументов ENV для конкретного кейса.', 'Все аргументы описаны в ArgumentsType'],
    en: ['TODO']
  },
  examples: [{
    test: 'src/Plugins/argsRedefine/argsRedefine.yaml',
    result: 'src.tests.e2e/snapshots/argsRedefine.log'
  }],
  name: argsRedefine_name,
  type: 'plugin',
  propogation: false
};
const order = 100;
const depends = [];
const pluginModule = {
  name: argsRedefine_name,
  documentation,
  plugin: argsRedefine_plugin,
  order,
  depends
};
/* harmony default export */ const argsRedefine = (pluginModule);

;// ./src/Plugins/continueOnError/continueOnError.ts

function continueOnError_setValue({
  inputs,
  stepId
}) {
  const {
    PPD_CONTINUE_ON_ERROR_ENABLED
  } = this.plugins.getPlugins('argsRedefine').getValue(stepId, 'argsRedefine');
  this.setValues(stepId, {
    continueOnError: PPD_CONTINUE_ON_ERROR_ENABLED && (inputs.continueOnError || false)
  });
}
const continueOnError_plugin = plugins => {
  const pluginInstance = new Plugin({
    name: continueOnError_name,
    defaultValues: {
      continueOnError: false
    },
    propogation: {
      continueOnError: {
        type: 'lastParent'
      }
    },
    hooks: {
      initValues: continueOnError_setValue,
      resolveValues: continueOnError_setValue
    },
    plugins
  });
  return pluginInstance;
};
const continueOnError_name = 'continueOnError';
const continueOnError_documentation = {
  description: {
    ru: ['Булевое значение. Отвечает за поведение блока при ошибке.', 'Управление происходит с помощью глобальной переменной [PPD_CONTINUE_ON_ERROR_ENABLED](#PPD_CONTINUE_ON_ERROR_ENABLED) уоторая включает и выключает данную функцию.', 'При [PPD_CONTINUE_ON_ERROR_ENABLED](#PPD_CONTINUE_ON_ERROR_ENABLED) === false "continueOnError" игнорируется.', 'Если continueOnError === true, то при ошибке в блоке он пропустится и пойдет следующий', 'Если continueOnError === false, то при ошибке в блоке он выдаст ошибку'],
    en: ['TODO']
  },
  examples: [{
    test: 'src/Plugins/continueOnError/continueOnError.yaml',
    result: 'src.tests.e2e/snapshots/continueOnError.log'
  }],
  name: continueOnError_name,
  type: 'plugin',
  propogation: false
};
const continueOnError_order = 200;
const continueOnError_depends = ['argsRedefine'];
const continueOnError_pluginModule = {
  name: continueOnError_name,
  documentation: continueOnError_documentation,
  plugin: continueOnError_plugin,
  order: continueOnError_order,
  depends: continueOnError_depends
};
/* harmony default export */ const continueOnError = (continueOnError_pluginModule);

;// ./src/Plugins/debug/debug.ts

function debug_setValue({
  inputs,
  stepId
}) {
  this.setValues(stepId, inputs);
}
const debug_plugin = plugins => {
  const pluginInstance = new Plugin({
    name: debug_name,
    defaultValues: {
      debug: false
    },
    propogation: {
      debug: {
        type: 'lastParent'
      }
    },
    plugins,
    hooks: {
      initValues: debug_setValue,
      runLogic: debug_setValue
    },
    isActive: ({
      stepId
    }) => {
      const {
        PPD_DEBUG_MODE
      } = plugins.getPlugins('argsRedefine').getValue(stepId, 'argsRedefine');
      return PPD_DEBUG_MODE;
    }
  });
  return pluginInstance;
};
const debug_name = 'debug';
const debug_documentation = {
  description: {
    ru: ['Дебаггер для остановки агента в нужном месте'],
    en: ['Debugger for stopping the agent at the desired location']
  },
  examples: [{
    test: 'src/Plugins/debug/debug.yaml',
    result: 'src.tests.e2e/snapshots/debug.log'
  }],
  name: debug_name,
  type: 'plugin',
  propogation: false
};
const debug_depends = ['argsRedefine'];
const debug_pluginModule = {
  name: debug_name,
  documentation: debug_documentation,
  plugin: debug_plugin,
  depends: debug_depends
};
/* harmony default export */ const debug = (debug_pluginModule);

;// ./src/Plugins/descriptionError/descriptionError.ts


function descriptionError_setValue({
  inputs,
  stepId
}) {
  this.setValues(stepId, inputs);
}
const descriptionError_plugin = plugins => {
  const pluginInstance = new Plugin({
    name: descriptionError_name,
    defaultValues: {
      descriptionError: ''
    },
    hooks: {
      initValues: descriptionError_setValue,
      runLogic: descriptionError_setValue,
      afterResults: ({
        inputs,
        stepId
      }) => {
        try {
          const newValue = runScriptInContext(pluginInstance.getValue(stepId, 'descriptionError'), inputs, pluginInstance.getValue(stepId, 'descriptionError'));
          if (newValue) {
            pluginInstance.setValues(stepId, {
              descriptionError: String(newValue)
            });
          }
        } catch {
          // Nothng to do
        }
      }
    },
    plugins
  });
  return pluginInstance;
};
const descriptionError_name = 'descriptionError';
const descriptionError_documentation = {
  description: {
    ru: ['При падении тестов в логи выводится информация из этого поля', 'Поле является исполняемым в контексте данных'],
    en: ['TODO']
  },
  examples: [{
    test: 'src/Plugins/descriptionError/descriptionError.yaml',
    result: 'src.tests.e2e/snapshots/descriptionError.log'
  }, {
    test: 'src/Plugins/descriptionError/descriptionErrorNested.yaml',
    result: 'src.tests.e2e/snapshots/descriptionErrorNested.log'
  }, {
    test: 'src/Plugins/descriptionError/descriptionErrorDynamic.yaml',
    result: 'src.tests.e2e/snapshots/descriptionErrorDynamic.log'
  }],
  name: descriptionError_name,
  type: 'plugin',
  propogation: false
};
const descriptionError_order = 300;
const descriptionError_depends = [];
const descriptionError_pluginModule = {
  name: descriptionError_name,
  documentation: descriptionError_documentation,
  plugin: descriptionError_plugin,
  order: descriptionError_order,
  depends: descriptionError_depends
};
/* harmony default export */ const descriptionError = (descriptionError_pluginModule);

;// ./src/Plugins/engineSupports/engineSupports.ts


function engineSupports_setValue({
  inputs,
  stepId
}) {
  this.setValues(stepId, inputs);
}
const engineSupports_plugin = plugins => {
  const pluginInstance = new Plugin({
    name: engineSupports_name,
    defaultValues: {
      engineSupports: []
    },
    hooks: {
      initValues: engineSupports_setValue,
      runLogic: engineSupports_setValue,
      resolveValues: ({
        inputs,
        stepId
      }) => {
        const {
          allRunners
        } = new Environment().getEnvInstance(plugins.envsId);
        const current = new Environment().getCurrent(plugins.envsId);
        const runner = allRunners.getRunnerByName(current.name || '');
        const {
          engineSupports
        } = pluginInstance.setValues(stepId, inputs);
        if (engineSupports.length) {
          var _runner$getRunnerData;
          const {
            engine
          } = (runner === null || runner === void 0 || (_runner$getRunnerData = runner.getRunnerData()) === null || _runner$getRunnerData === void 0 ? void 0 : _runner$getRunnerData.browser) || {};
          if (engine && !engineSupports.includes(engine)) {
            throw new Error(`Current engine: '${engine}' not supported with this agent. You need to use: ${engineSupports}`);
          }
        }
      }
    },
    plugins
  });
  return pluginInstance;
};
const engineSupports_name = 'engineSupports';
const engineSupports_documentation = {
  description: {
    ru: ['Плагин для проверки поддержки браузерных движков, с помощью которых работают агенты'],
    en: ['Plugin for checking browser engine support, with which agents work']
  },
  examples: [{
    test: 'src/Plugins/engineSupports/engineSupports.yaml',
    result: 'src.tests.e2e/snapshots/engineSupports.log'
  }],
  name: engineSupports_name,
  type: 'plugin',
  propogation: false
};
const engineSupports_order = 500;
const engineSupports_depends = [];
const engineSupports_pluginModule = {
  name: engineSupports_name,
  documentation: engineSupports_documentation,
  plugin: engineSupports_plugin,
  order: engineSupports_order,
  depends: engineSupports_depends
};
/* harmony default export */ const engineSupports = (engineSupports_pluginModule);

;// ./src/Plugins/frame/frame.ts

function frame_setValue({
  inputs,
  stepId
}) {
  this.setValues(stepId, inputs);
}
const frame_plugin = plugins => {
  const pluginInstance = new Plugin({
    name: frame_name,
    defaultValues: {
      frame: ''
    },
    propogation: {
      frame: {
        type: 'lastParent'
      }
    },
    hooks: {
      initValues: frame_setValue,
      runLogic: frame_setValue
    },
    plugins
  });
  return pluginInstance;
};
const frame_name = 'frame';
const frame_documentation = {
  description: {
    ru: ['Поддержка работы с фреймами. Позволяет указать целевой фрейм для выполнения действий.'],
    en: ['Frame support. Allows to specify target frame for actions.']
  },
  examples: [{
    test: 'src/Plugins/frame/frame.yaml',
    result: 'src.tests.e2e/snapshots/frame.log'
  }],
  name: frame_name,
  type: 'plugin',
  propogation: true
};
const frame_order = 150;
const frame_depends = [];
const frame_pluginModule = {
  name: frame_name,
  documentation: frame_documentation,
  plugin: frame_plugin,
  order: frame_order,
  depends: frame_depends
};
/* harmony default export */ const frame_frame = (frame_pluginModule);

;// ./src/Plugins/logOptions/logOptions.ts

function logOptions_setValue({
  inputs,
  stepId
}) {
  var _ref, _ref2, _logOptionsParent$log;
  this.setValues(stepId, inputs);
  const {
    logOptions
  } = this.getValues(stepId);
  const {
    logOptions: logOptionsParent
  } = this.getValuesParent(stepId);
  const {
    PPD_LOG_IGNORE_HIDE_LOG
  } = this.plugins.getPlugins('argsRedefine').getValue(stepId, 'argsRedefine');
  const logShowFlag = (_ref = (_ref2 = PPD_LOG_IGNORE_HIDE_LOG || logOptions.logThis) !== null && _ref2 !== void 0 ? _ref2 : logOptionsParent.logChildren) !== null && _ref !== void 0 ? _ref : true;
  this.setValues(stepId, {
    logOptions: {
      logThis: PPD_LOG_IGNORE_HIDE_LOG ? true : (_logOptionsParent$log = logOptionsParent.logChildren) !== null && _logOptionsParent$log !== void 0 ? _logOptionsParent$log : true,
      ...logOptions,
      logShowFlag
    }
  });
}
const logOptions_plugin = plugins => {
  const pluginInstance = new Plugin({
    name: logOptions_name,
    defaultValues: {
      logOptions: {
        textColor: 'sane',
        backgroundColor: 'sane',
        logChildren: true,
        logShowFlag: true
      }
    },
    hooks: {
      initValues: logOptions_setValue,
      runLogic: logOptions_setValue,
      resolveValues: logOptions_setValue
    },
    propogation: {
      logOptions: {
        type: 'lastParent',
        fieldsOnly: ['logChildren']
      }
    },
    plugins
  });
  return pluginInstance;
};
const logOptions_name = 'logOptions';
const logOptions_documentation = {
  description: {
    ru: ['Управление настройками логирования для отдельных агентов.'],
    en: ['Control logging options for individual agents.']
  },
  examples: [{
    test: 'src/Plugins/logOptions/logOptions.yaml',
    result: 'src.tests.e2e/snapshots/logOptions.log'
  }],
  name: logOptions_name,
  type: 'plugin',
  propogation: true
};
const logOptions_order = 700;
const logOptions_depends = ['argsRedefine'];
const logOptions_pluginModule = {
  name: logOptions_name,
  documentation: logOptions_documentation,
  plugin: logOptions_plugin,
  order: logOptions_order,
  depends: logOptions_depends
};
/* harmony default export */ const logOptions = (logOptions_pluginModule);

;// ./src/Plugins/options/options.ts


function options_setValue({
  inputs,
  stepId
}) {
  this.setValues(stepId, inputs);
  const {
    options,
    allowOptions
  } = this.getValues(stepId);
  const {
    options: optionsParent
  } = this.getValuesParent(stepId);
  const result = {
    options: {
      ...options,
      ...resolveAliases('options', inputs),
      ...optionsParent
    },
    allowOptions
  };

  // Merge parent options with current options
  this.setValues(stepId, result);
}
const options_plugin = plugins => {
  const pluginInstance = new Plugin({
    name: options_name,
    defaultValues: {
      options: {},
      allowOptions: []
    },
    propogation: {
      options: {
        type: 'lastParent'
      }
    },
    hooks: {
      initValues: options_setValue,
      runLogic: options_setValue,
      resolveValues: options_setValue
    },
    plugins
  });
  return pluginInstance;
};
const options_name = 'options';
const options_documentation = {
  description: {
    ru: ['Плагин для управления опциями агентов.', 'Опции наследуются от родительского агента к дочерним.', 'Дочерние агенты могут переопределять унаследованные опции.', 'Позволяет агентам указывать, какие опции разрешены для использования.', 'Опции, указанные в allowOptions, могут быть использованы в дочерних агентах.'],
    en: ['Plugin for managing agent options.', 'Options are inherited from the parent agent to the child agents.', 'Child agents can override inherited options.', 'Allows agents to specify which options are permitted for use.', 'Options specified in allowOptions can be used in child agents.']
  },
  examples: [{
    test: 'src/Plugins/options/options.yaml',
    result: 'src.tests.e2e/snapshots/options.log'
  }],
  name: options_name,
  type: 'plugin',
  propogation: true
};
const options_order = 150;
const options_depends = [];
const options_pluginModule = {
  name: options_name,
  documentation: options_documentation,
  plugin: options_plugin,
  order: options_order,
  depends: options_depends
};
/* harmony default export */ const options = (options_pluginModule);

;// ./src/Plugins/selectors/selectors.ts


function selectors_setValue({
  inputs,
  stepId
}) {
  this.setValues(stepId, inputs);
  const {
    selectors
  } = this.getValues(stepId);
  const {
    selectors: selectorsParent
  } = this.getValuesParent(stepId);
  const result = {
    selectors: {
      ...selectors,
      ...resolveAliases('selectors', inputs),
      ...selectorsParent
    }
  };

  // Merge parent selectors with current selectors
  this.setValues(stepId, result);
}
const selectors_plugin = plugins => {
  const pluginInstance = new Plugin({
    name: selectors_name,
    defaultValues: {
      selectors: {}
    },
    propogation: {
      selectors: {
        type: 'lastParent'
      }
    },
    hooks: {
      initValues: selectors_setValue,
      runLogic: selectors_setValue,
      beforeFunctions({
        inputs,
        stepId
      }) {
        this.setValues(stepId, inputs);
      }
    },
    plugins
  });
  return pluginInstance;
};
const selectors_name = 'selectors';
const selectors_documentation = {
  description: {
    ru: ['Плагин для управления селекторами. Позволяет использовать селекторы из родительских блоков.', 'Селекторы доступны в дочерних блоках и передаются вниз по дереву агентов.'],
    en: ['Plugin for managing selectors. Allows using selectors from parent blocks.', 'Selectors are available in child blocks and are passed down the agent tree.']
  },
  examples: [{
    test: 'src/Plugins/selectors/selectors.yaml',
    result: 'src.tests.e2e/snapshots/selectors.log'
  }],
  name: selectors_name,
  type: 'plugin',
  propogation: true
};
const selectors_order = 170;
const selectors_depends = [];
const selectors_pluginModule = {
  name: selectors_name,
  documentation: selectors_documentation,
  plugin: selectors_plugin,
  order: selectors_order,
  depends: selectors_depends
};
/* harmony default export */ const selectors = (selectors_pluginModule);

;// ./src/Plugins/skipSublingIfResult/skipSublingIfResult.ts


function skipSublingIfResult_setValue({
  inputs,
  stepId
}) {
  this.setValues(stepId, inputs);
}
const skipSublingIfResult_plugin = plugins => {
  const pluginInstance = new Plugin({
    name: skipSublingIfResult_name,
    defaultValues: {
      skipSublingIfResult: '',
      skipMeBecausePrevSublingResults: false
    },
    propogation: {
      skipMeBecausePrevSublingResults: {
        type: 'lastSubling'
      }
    },
    hooks: {
      initValues: skipSublingIfResult_setValue,
      runLogic: skipSublingIfResult_setValue,
      afterRepeat({
        inputs,
        stepId
      }) {
        const {
          skipSublingIfResult,
          skipMeBecausePrevSublingResults
        } = pluginInstance.getValues(stepId);
        try {
          const skipMeBecausePrevSublingResultsResolved = skipSublingIfResult ? runScriptInContext(skipSublingIfResult, inputs) : skipMeBecausePrevSublingResults;
          pluginInstance.setValues(stepId, {
            skipSublingIfResult,
            skipMeBecausePrevSublingResults: Boolean(skipMeBecausePrevSublingResultsResolved)
          });
        } catch {
          pluginInstance.setValues(stepId, {
            skipSublingIfResult,
            skipMeBecausePrevSublingResults: false
          });
        }
      }
    },
    plugins
  });
  return pluginInstance;
};
const skipSublingIfResult_name = 'skipSublingIfResult';
const skipSublingIfResult_documentation = {
  description: {
    ru: ['Валидное JS выражение. Которое переводится в контексте конкретного блока в Boolean.', 'На основании этого результата принимается решение:', '1. Если результат === true, то все последующие блоки на этом уровне пропускаются.', '2. Если false, то все последующие блоки игнорируют эту инструкцию.'],
    en: ['TODO']
  },
  examples: [{
    test: 'src/Plugins/skipSublingIfResult/skipSublingIfResult.yaml',
    result: 'src.tests.e2e/snapshots/skipSublingIfResult.log'
  }],
  name: skipSublingIfResult_name,
  type: 'plugin',
  propogation: false
};
const skipSublingIfResult_order = 400;
const skipSublingIfResult_depends = [];
const skipSublingIfResult_pluginModule = {
  name: skipSublingIfResult_name,
  documentation: skipSublingIfResult_documentation,
  plugin: skipSublingIfResult_plugin,
  order: skipSublingIfResult_order,
  depends: skipSublingIfResult_depends
};
/* harmony default export */ const skipSublingIfResult = (skipSublingIfResult_pluginModule);

;// ./src/Plugins/index.ts










/* harmony default export */ const Plugins = ({
  continueOnError: continueOnError,
  debug: debug,
  skipSublingIfResult: skipSublingIfResult,
  argsRedefine: argsRedefine,
  descriptionError: descriptionError,
  engineSupports: engineSupports,
  frame: frame_frame,
  logOptions: logOptions,
  options: options,
  selectors: selectors
});
const pluginsListDefault = {
  argsRedefine: {
    plugin: 'argsRedefine',
    order: 100
  },
  logOptions: {
    plugin: 'logOptions',
    order: 150
  },
  options: {
    plugin: 'options',
    order: 160
  },
  selectors: {
    plugin: 'selectors',
    order: 170
  },
  descriptionError: {
    plugin: 'descriptionError',
    order: 200
  },
  continueOnError: {
    plugin: 'continueOnError',
    order: 300
  },
  skipSublingIfResult: {
    plugin: 'skipSublingIfResult',
    order: 400
  },
  engineSupports: {
    plugin: 'engineSupports',
    order: 500
  },
  frame: {
    plugin: 'frame',
    order: 600
  },
  debug: {
    plugin: 'debug'
  }
};
;// ./src/PluginsCore.ts






/**
 * A class for managing plugins.
 * Extends Singleton.
 */
class PluginsFabric extends Singleton {
  /**
   * An object to store plugin functions.
   * Key - plugin name, value - plugin function.
   */

  /**
   * An object to store plugin documentation.
   * Key - plugin name, value - plugin documentation.
   */

  /**
   * An object to store the order of plugin execution.
   * Key - plugin name, value - order of execution or null.
   */

  /**
   * An object to store plugin dependencies.
   * Key - plugin name, value - array of dependent plugin names.
   */

  /**
   * Constructor.
   * @param plugins List of plugins for initialization.
   * @param reInit Flag for reinitialization.
   */
  constructor(plugins = {}, reInit = false) {
    super();
    if (!this.plugins || reInit) {
      this.plugins = {};
      this.documentation = {};
      this.orders = {};
      this.depends = {};
      for (const plugin of Object.values(plugins)) {
        this.addPlugin(plugin.plugin, plugin.order);
      }
      this.normalizeOrders();
      this.checkDepends();
      const {
        PPD_DEBUG_MODE
      } = new Arguments().args;
      if (PPD_DEBUG_MODE) {
        console.log(JSON.stringify(this.getPluginsOrder(), null, 2));
      }
    }
  }

  /**
   * Returns all registered plugins.
   * @returns Object with functions of all registered plugins.
   */
  getAllPluginsScratch() {
    return this.plugins;
  }

  /**
   * Returns documentation for all registered plugins.
   * @returns Array of documentation for all registered plugins.
   */
  getDocs() {
    return Object.values(this.documentation);
  }

  /**
   * Returns the function of a specific plugin.
   * @param name Plugin name.
   * @returns Plugin function.
   */
  getPlugin(name) {
    return this.plugins[name];
  }

  /**
   * Registers a plugin.
   * If the plugin is passed as a string, it will be found in DefaultPlugins.
   * If the order is not passed, the order from the plugin will be used.
   * @param plugin Plugin or plugin name.
   * @param order Order of plugin execution.
   */
  addPlugin(plugin, order) {
    var _ref;
    const resolvPlugin = typeof plugin === 'string' ? Plugins[plugin] : plugin;
    this.plugins[resolvPlugin.name] = resolvPlugin.plugin;
    this.documentation[resolvPlugin.name] = resolvPlugin.documentation;
    this.depends[resolvPlugin.name] = resolvPlugin.depends;
    this.orders[resolvPlugin.name] = (_ref = order !== null && order !== void 0 ? order : resolvPlugin.order) !== null && _ref !== void 0 ? _ref : null;
  }

  /**
   * Returns an object with the order of plugin execution.
   * @returns Object with plugin names as keys and their orders as values.
   */
  getPluginsOrder() {
    const newOrders = {};
    const orders = this.getPluginsOrderedNames();
    for (const order of orders) {
      newOrders[order] = this.orders[order];
    }
    return newOrders;
  }

  /**
   * Returns the names of plugins in the order of their execution.
   * @returns Array of plugin names in the order of their execution.
   */
  getPluginsOrderedNames() {
    const valuesNull = Object.entries(this.orders).filter(v => !v[1]).map(v => v[0]);
    const valuesOrdered = Object.entries(this.orders).sort((a, b) => a[1] - b[1]).filter(v => !!v[1]).map(v => v[0]);
    return [...valuesOrdered, ...valuesNull];
  }

  /**
   * Checks plugin dependencies.
   * Throws an error if the order of plugin execution is not followed.
   */
  checkDepends() {
    const {
      depends,
      orders
    } = this;
    Object.keys(depends).forEach(plugin => {
      if (!orders[plugin]) {
        throw new Error(`Plugin ${plugin} not found in the execution order`);
      }
      for (const dependency of depends[plugin]) {
        if (!orders[dependency] || orders[dependency] > orders[plugin]) {
          throw new Error(`Plugin ${dependency}, required for ${plugin}, not found or loaded after`);
        }
      }
    });
  }

  /**
   * Normalizes the order of plugin execution by assigning sequential numbers to plugins with undefined order.
   */
  normalizeOrders() {
    let maxOrder = Math.max(...Object.values(this.orders).filter(order => order !== null));
    Object.keys(this.orders).forEach(plugin => {
      if (this.orders[plugin] === null) {
        this.orders[plugin] = maxOrder + 1;
        maxOrder += 1;
      }
    });
  }
}
class PluginsCore_Plugins {
  plugins = [];
  constructor(envsId, agentTree) {
    const plugins = new PluginsFabric().getAllPluginsScratch();
    this.envsId = envsId;
    this.agentTree = agentTree;
    for (const plugin of Object.values(plugins)) {
      this.plugins.push(plugin(this));
    }
  }

  // TODO: 2022-10-18 S.Starodubov сделать так чтобы хук мог возвращать данные
  // TODO: 2022-10-03 S.Starodubov async hook
  hook(name, args) {
    const pluginsNames = new PluginsFabric().getPluginsOrderedNames();
    for (const pluginName of pluginsNames) {
      this.plugins.find(v => v.name === pluginName).hook(name)(args);
    }
  }
  getPlugins(pluginName) {
    const plugin = this.plugins.find(v => v.name === pluginName);
    if (!plugin) {
      throw new Error(`Can't find plugin ${pluginName}`);
    }
    return plugin;
  }
}
class Plugin {
  // NodeJS > v14.17.0 randomUUID supports. https://nodejs.org/api/crypto.html#cryptorandomuuidoptions
  id = external_crypto_namespaceObject.randomUUID ? (0,external_crypto_namespaceObject.randomUUID)() : external_crypto_default().randomBytes(20).toString('hex');
  hooks = {};
  /**
   * Constructor for the Plugin class.
   * @param {string} name - The name of the plugin.
   * @param {T} defaultValues - Default values for the plugin.
   * @param {Partial<PluginPropogations<T>>} [propogation] - Rules for value propagation.
   * @param {Plugins} plugins - Instance of the Plugins class.
   * @param {PluginHooks} [hooks={}] - Hooks for the plugin.
   */
  constructor({
    name,
    defaultValues,
    propogation,
    plugins,
    hooks = {},
    isActive = () => true
  }) {
    this.name = name;
    this.defaultValues = {
      ...defaultValues
    };
    this.propogation = propogation;
    this.plugins = plugins;
    this.hooks = {
      ...this.hooks,
      ...hooks
    };
    this.isActive = isActive;
    this.agentTree = plugins.agentTree;
  }

  /**
   * Executes a hook with the given name.
   * @param {keyof PluginHooks} name - The name of the hook.
   * @returns {Function} - The hook function.
   */
  hook(name) {
    try {
      if (Object.keys(this.hooks).includes(name)) {
        return this.hooks[name].bind(this);
      }
      return () => {};
    } catch (error) {
      console.log(error);
      /* istanbul ignore next */
      if (!process.env.JEST_WORKER_ID) {
        // biome-ignore lint/suspicious/noDebugger: need debug this
        debugger;
      }
    }
    return () => {};
  }

  /**
   * Retrieves a value by key for a given step.
   * @param {string} stepId - The step identifier.
   * @param {keyof T} value - The key of the value.
   * @returns {T[keyof T]} - The value associated with the key.
   */
  getValue(stepId, value) {
    return this.getValues(stepId)[value];
  }

  /**
   * Retrieves all values for a parent step.
   * @param {string} stepId - The step identifier.
   * @returns {T} - All values for the step.
   */
  getValuesParent(stepId) {
    var _this$agentTree$findP, _pick;
    const step = (_this$agentTree$findP = this.agentTree.findParent(stepId)) !== null && _this$agentTree$findP !== void 0 ? _this$agentTree$findP : {};
    return {
      ...this.defaultValues,
      ...((_pick = pick(step, Object.keys(this.defaultValues))) !== null && _pick !== void 0 ? _pick : {})
    };
  }

  /**
   * Retrieves all values for a given step.
   * @param {string} stepId - The step identifier.
   * @returns {T} - All values for the step.
   */
  getValues(stepId) {
    var _this$agentTree$findN, _pick2;
    const step = (_this$agentTree$findN = this.agentTree.findNode(stepId)) !== null && _this$agentTree$findN !== void 0 ? _this$agentTree$findN : {};
    return {
      ...this.defaultValues,
      ...((_pick2 = pick(step, Object.keys(this.defaultValues))) !== null && _pick2 !== void 0 ? _pick2 : {})
    };
  }

  /**
   * Sets values for a given step.
   * @param {string} stepId - The step identifier.
   * @param {Partial<T>} [values={}] - The values to set.
   * @returns {T} - The new values for the step.
   */
  setValues(stepId, inputs = {}) {
    if (!this.isActive({
      stepId,
      inputs
    })) {
      this.agentTree.updateStep({
        stepId,
        payload: this.defaultValues
      });
      return this.defaultValues;
    }
    const inputValues = pick(inputs, Object.keys(this.defaultValues));
    let newValues = mergeObjects([this.defaultValues, inputValues]);
    try {
      var _this$propogation;
      const propagationSources = {
        lastParent: () => this.agentTree.findParent(stepId),
        lastSubling: () => this.agentTree.findPreviousSibling(stepId)
      };
      Object.entries((_this$propogation = this.propogation) !== null && _this$propogation !== void 0 ? _this$propogation : {}).forEach(([key, source]) => {
        var _propagationSources;
        const propogateNode = ((_propagationSources = propagationSources[source.type]) !== null && _propagationSources !== void 0 ? _propagationSources : () => null)();
        if (propogateNode) {
          var _source$fieldsOnly;
          const propogateValues = pick(propogateNode, [key]);
          if (!Object.keys(pick(inputs, [key])).length) {
            newValues = {
              ...newValues,
              ...propogateValues
            };
          }
          if ((_source$fieldsOnly = source.fieldsOnly) !== null && _source$fieldsOnly !== void 0 && _source$fieldsOnly.length) {
            try {
              if (![...new Set(Object.keys(inputValues[key]))].filter(x => new Set(source.fieldsOnly).has(x)).length && [...new Set(Object.keys(propogateValues[key]))].filter(x => new Set(source.fieldsOnly).has(x)).length && typeof propogateValues[key] === 'object' && !Array.isArray(propogateValues[key])) {
                newValues[key] = mergeObjects([newValues[key], pick(propogateValues[key], source.fieldsOnly)]);
              }
            } catch {
              // debugger;
            }
          }
        }
      });
      this.agentTree.updateStep({
        stepId,
        payload: newValues
      });
    } catch {
      //
    }
    return newValues;
  }
}
;// ./src/Environment.ts










class Runners {
  constructor(envsId) {
    this.runners = {};
    this.envsId = envsId;
  }
  async switchRunner({
    name,
    runner = {},
    page = ''
  }) {
    var _this$runners$localNa, _this$runners$localNa2;
    const runnerResolved = {
      ...{
        name: '__blank_runner__',
        type: 'runner',
        browser: DEFAULT_BROWSER
      },
      ...runner
    };
    let localName = name;
    if (name) {
      var _this$runners$name;
      if (!this.runners[name]) {
        const {
          runners
        } = new AgentContent().allData;
        const runnerFromFile = runners.find(v => v.name === name);
        if (runnerFromFile) {
          this.runners[name] = new Runner(JSON.parse(JSON.stringify(runnerFromFile)));
          await this.runners[name].runEngine(this.envsId);
        } else {
          throw new Error(`Can't init runner '${name}'. Check 'runner' parameter`);
        }
      } else if (!((_this$runners$name = this.runners[name]) !== null && _this$runners$name !== void 0 && _this$runners$name.getState().browser)) {
        await this.runners[name].runEngine(this.envsId);
      }
    } else {
      localName = runnerResolved.name;
      this.runners[localName] = new Runner(runnerResolved);
      await this.runners[localName].runEngine(this.envsId);
    }
    const newCurrent = {};
    newCurrent.name = localName;
    if (page && (_this$runners$localNa = this.runners[localName]) !== null && _this$runners$localNa !== void 0 && (_this$runners$localNa = _this$runners$localNa.getState().pages) !== null && _this$runners$localNa !== void 0 && _this$runners$localNa[page]) {
      newCurrent.page = page;
    } else if ((_this$runners$localNa2 = this.runners[localName]) !== null && _this$runners$localNa2 !== void 0 && (_this$runners$localNa2 = _this$runners$localNa2.getState().pages) !== null && _this$runners$localNa2 !== void 0 && _this$runners$localNa2.main) {
      newCurrent.page = 'main';
    }
    new Environment().setCurrent(this.envsId, newCurrent);
  }
  async closeRunner(name) {
    await this.runners[name].stopEngine();
  }
  async closeAllRunners() {
    for (const name of Object.keys(this.runners)) {
      await this.closeRunner(name);
    }
  }
  getActivePage() {
    var _activeEnv$getState;
    const {
      name = '',
      page = ''
    } = new Environment().getCurrent(this.envsId);
    const activeEnv = this.runners[name];
    if (!((_activeEnv$getState = activeEnv.getState()) !== null && _activeEnv$getState !== void 0 && (_activeEnv$getState = _activeEnv$getState.pages) !== null && _activeEnv$getState !== void 0 && _activeEnv$getState[page])) {
      throw new Error('No active page');
    }
    return activeEnv.getState().pages[page];
  }
  getRunnerByName(name) {
    return this.runners[name];
  }
}
class Runner {
  // Browser, pages, cookies, etc.

  constructor(runnerData) {
    this.name = runnerData.name;
    this.state = {};
    this.runnerData = runnerData;
  }
  getRunnerData() {
    return this.runnerData;
  }
  getState() {
    return this.state;
  }
  async runEngine(envsId) {
    const browserSettings = Engines.resolveBrowser({
      ...DEFAULT_BROWSER,
      ...this.runnerData.browser
    });
    // TODO: 2021-02-22 S.Starodubov resolve executablePath if exec script out of project as standalone app
    const {
      type,
      engine,
      runtime
    } = browserSettings;
    let newState = {};
    if (type === 'browser' && runtime === 'run') {
      if (engine === 'puppeteer') {
        newState = await Engines.runPuppeteer(this.runnerData, this.state);
      }
      if (engine === 'playwright') {
        newState = await Engines.runPlaywright(this.runnerData, this.state);
      }
    }
    if (type === 'browser' && runtime === 'connect') {
      // TODO: 2020-11-07 S.Starodubov todo
    }
    if (type === 'electron') {
      if (runtime === 'connect') {
        const {
          browser,
          pages
        } = await Engines.connectElectron(browserSettings);
        newState = {
          browser,
          pages
        };
      }
      if (runtime === 'run') {
        const {
          browser,
          pages,
          pid
        } = await Engines.runElectron(browserSettings, this.name, envsId);
        newState = {
          browser,
          pages,
          pid
        };
      }
    }
    this.state = {
      ...this.state,
      ...newState
    };
  }
  async stopEngine() {
    try {
      var _this$state;
      await ((_this$state = this.state) === null || _this$state === void 0 || (_this$state = _this$state.browser) === null || _this$state === void 0 ? void 0 : _this$state.close());
    } catch {
      // Nothing to do.
    }
    try {
      var _this$runnerData$brow, _this$runnerData$brow2;
      const killOnEnd = ((_this$runnerData$brow = this.runnerData.browser) === null || _this$runnerData$brow === void 0 ? void 0 : _this$runnerData$brow.killOnEnd) || true;
      const killProcessName = (_this$runnerData$brow2 = this.runnerData.browser) === null || _this$runnerData$brow2 === void 0 ? void 0 : _this$runnerData$brow2.killProcessName;
      if (killOnEnd && killProcessName) {
        const platform = external_os_default().platform();
        if (platform.startsWith('win')) {
          (0,external_child_process_namespaceObject.spawnSync)('taskkill', ['/f', '/im', killProcessName]);
        } else if (platform === 'darwin') {
          (0,external_child_process_namespaceObject.execSync)(`osascript -e 'quit app "${killProcessName}"'`);
        } else if (platform === 'linux') {
          (0,external_child_process_namespaceObject.execSync)(`pkill ${killProcessName}`);
        } else {
          console.error(`Quitting a process is not supported on '${platform}' platform.`);
        }
      }
    } catch {
      // Nothing to do.
    }
    delete this.state.browser;
    delete this.state.browserSettings;
    delete this.state.pages;
    delete this.state.contexts;
    delete this.state.pid;
  }
}
class Environment extends Singleton {
  constructor(reInit = false) {
    super();
    if (reInit || !this.instances) {
      this.instances = {};
    }
  }
  createEnv(data = {}) {
    const {
      envsId = generateId(),
      socket = blankSocket,
      loggerOptions
    } = data;
    if (!this.instances[envsId]) {
      new LogOptions(loggerOptions);
      const logger = new Log(envsId);
      const allRunners = new Runners(envsId);
      const current = {};
      const testTree = new AgentTree();
      this.instances[envsId] = {
        allRunners,
        socket,
        envsId,
        logger,
        current,
        // TODO: 2023-03-22 S.Starodubov move this log info into testTree
        log: [],
        testsStruct: {},
        testTree,
        plugins: new PluginsCore_Plugins(envsId, testTree)
      };
    }
    return this.getEnvInstance(envsId);
  }
  checkId(envsId) {
    if (!envsId || !this.instances[envsId]) {
      throw new Error(`Unknown ENV ID ${envsId}`);
    }
  }

  /**
   * It returns the full structure of a agent.
   * @param {string} envsId - The id of the environment instance.
   * @param {string} name - The name of the agent.
   * @returns The fullStruct is being returned.
   */
  getStruct(envsId, name) {
    const existsStruct = this.getEnvInstance(envsId).testsStruct[name];
    if (existsStruct) {
      return existsStruct;
    }
    const fullStruct = FlowStructure.getFlowFullJSON(name);
    this.instances[envsId].testsStruct[name] = fullStruct;
    return fullStruct;
  }
  getEnvRunners(envsId) {
    this.checkId(envsId);
    return this.instances[envsId].allRunners;
  }
  getEnvInstance(envsId) {
    this.checkId(envsId);
    return this.instances[envsId];
  }
  getLogger(envsId) {
    this.checkId(envsId);
    return this.instances[envsId].logger;
  }
  getOutput(envsId) {
    return this.getLogger(envsId).output;
  }
  getSocket(envsId) {
    this.checkId(envsId);
    return this.instances[envsId].socket;
  }
  getCurrent(envsId) {
    this.checkId(envsId);
    return this.instances[envsId].current;
  }
  setCurrent(envsId, newData) {
    this.checkId(envsId);
    this.instances[envsId].current = {
      ...this.instances[envsId].current,
      ...newData
    };
  }
}
;// ./src/Loggers/Exporters.ts


const consoleLog = entries => {
  entries.forEach(entry => {
    const line = entry.map(part => {
      let text = paintString(part.text, part.textColor);
      if (part.backgroundColor && part.backgroundColor !== 'sane') {
        text = paintString(text, part.backgroundColor);
      }
      return text;
    }).join('');
    console.log(line);
  });
};
const fileLog = (envsId, texts = [], fileName = 'output.log') => {
  let textsJoin = '';
  if (Array.isArray(texts)) {
    textsJoin = texts.map(text => text.map(log => log.text || '').join('')).join('\n');
  } else {
    textsJoin = texts.toString();
  }
  textsJoin = textsJoin.replace(/\[\d+m/gi, '');
  new Environment().getLogger(envsId).exporter.appendToFile(fileName, `${textsJoin}\n`);
};
const exporterConsole = async (_logEntry, logEntryFormated, _logString, options) => {
  if (options.skipThis) {
    return;
  }
  consoleLog(logEntryFormated);
};
const exporterLogFile = async (_logEntry, logEntryFormated, _logString, options) => {
  if (options.skipThis) {
    return;
  }
  fileLog(options.envsId, logEntryFormated, 'output.log');
};
const exporterSocket = async (logEntry, _logEntryFormated, _logString, options) => {
  const socket = new Environment().getSocket(options.envsId);
  socket.sendYAML({
    type: 'log',
    data: logEntry,
    envsId: options.envsId
  });
};
const exporterYamlLog = async (_logEntry, _logEntryFormated, logString, options) => {
  fileLog(options.envsId, logString, 'output.yaml');
};
const exporterLogInMemory = async (logEntry, _logEntryFormated, _logString, options) => {
  const {
    log
  } = new Environment().getEnvInstance(options.envsId);
  log.push(logEntry);
};
;// ./src/Loggers/Formatters.ts




const resolveBackColor = backgroundColor => {
  let backColor = backgroundColor && colors[backgroundColor] >= 30 && colors[backgroundColor] < 38 ? colors[colors[backgroundColor] + 10] : backgroundColor;
  if (!Object.keys(colors).includes(backColor)) {
    backColor = 'sane';
  }
  return backColor;
};
const resolveColor = (textColor, level) => {
  if (colors[textColor] !== colors.sane) {
    return textColor;
  }
  if (colors[level] === colors.sane) {
    return 'sane';
  }
  return level;
};
const getPrefix = (time, level, levelIndent) => {
  const {
    PPD_LOG_TIMESTAMP_SHOW,
    PPD_LOG_INDENT_LENGTH
  } = new Arguments().args;
  const indentString = `|${' '.repeat(PPD_LOG_INDENT_LENGTH - 1)}`.repeat(levelIndent);
  const nowWithPad = PPD_LOG_TIMESTAMP_SHOW ? `${getNowDateTime(time, 'HH:mm:ss.SSS')} - ${level.padEnd(5)}  ` : '';
  const spacesPreffix = nowWithPad ? ' '.repeat(nowWithPad.length) : '';
  return {
    spacesPrefix: `${spacesPreffix}${indentString}`,
    timePrefix: `${nowWithPad}${indentString}`
  };
};
const getSpliter = (levelIndent = 0) => '='.repeat(120 - (levelIndent + 1) * 3 - 21);
const formatterEntry = async ({
  level = 'sane',
  levelIndent = 0,
  text = '',
  time = new Date(),
  funcFile = '',
  testFile = '',
  extendInfo = false,
  screenshots = [],
  error = null,
  textColor = 'sane',
  backgroundColor = 'sane',
  breadcrumbs = [],
  repeat = 1
}) => {
  const errorTyped = error;
  const message = ((errorTyped === null || errorTyped === void 0 ? void 0 : errorTyped.message) || '').split(' || ');
  const stack = ((errorTyped === null || errorTyped === void 0 ? void 0 : errorTyped.stack) || '').split('\n    ');
  const {
    PPD_LOG_EXTEND
  } = new Arguments().args;
  const {
    spacesPrefix,
    timePrefix
  } = getPrefix(time, level, levelIndent);
  const headColor = level === 'error' ? 'error' : 'sane';
  const tailColor = level === 'error' ? 'error' : 'info';
  const isExtend = level !== 'error' && extendInfo;
  const isError = level === 'error' && !extendInfo;
  const isErrorTopLevel = isError && levelIndent === 0;
  const isBreadcrumbs = level !== 'error' && !extendInfo && !!breadcrumbs.length && level !== 'raw' && PPD_LOG_EXTEND;
  const isRepeat = isBreadcrumbs && repeat > 1;
  const isTestFile = isError && !!testFile;
  const isFuncFile = isError && !!funcFile;
  const stringsLog = [[{
    text: isExtend ? spacesPrefix : timePrefix,
    textColor: headColor,
    backgroundColor: 'sane'
  }, {
    text,
    textColor: resolveColor(textColor, level),
    backgroundColor: resolveBackColor(backgroundColor)
  }], isBreadcrumbs && [{
    text: `${spacesPrefix} `,
    textColor: headColor,
    backgroundColor: 'sane'
  }, {
    text: `👣[${breadcrumbs.join(' -> ')}]`,
    textColor: tailColor,
    backgroundColor: 'sane'
  }], isRepeat && [{
    text: `${spacesPrefix} `,
    textColor: headColor,
    backgroundColor: 'sane'
  }, {
    text: `🔆 repeats left: ${repeat - 1}`,
    textColor: tailColor,
    backgroundColor: 'sane'
  }], ...breadcrumbs.map((v, i) => {
    if (isError) {
      return [{
        text: `${timePrefix}${'   '.repeat(i)} ${v}`,
        textColor: 'error',
        backgroundColor: 'sane'
      }];
    }
    return null;
  }), isTestFile && [{
    text: `${timePrefix} (file:///${external_path_default().resolve(testFile)})`,
    textColor: 'error',
    backgroundColor: 'sane'
  }], isFuncFile && [{
    text: `${timePrefix} (file:///${external_path_default().resolve(funcFile)})`,
    textColor: 'error',
    backgroundColor: 'sane'
  }], ...screenshots.map(v => [{
    text: `${timePrefix} `,
    textColor: headColor,
    backgroundColor: 'sane'
  }, {
    text: `🖼 screenshot: [${v}]`,
    textColor: tailColor,
    backgroundColor: 'sane'
  }]), isError && [{
    text: `${timePrefix} `,
    textColor: headColor,
    backgroundColor: 'sane'
  }, {
    text: getSpliter(levelIndent),
    textColor: tailColor,
    backgroundColor: 'sane'
  }], ...[...message, getSpliter(), ...stack].map(v => {
    if (isErrorTopLevel) {
      return [{
        text: ' '.repeat(22),
        textColor: 'error',
        backgroundColor: 'sane'
      }, {
        text: v,
        textColor: 'error',
        backgroundColor: 'sane'
      }];
    }
    return null;
  })];
  return stringsLog.filter(v => v);
};
const formatterEmpty = async () => '';
const formatterYamlToString = async (_logEntry, logEntryTransformed) => {
  const yamlString = `-\n${jsYaml.dump(logEntryTransformed, {
    lineWidth: 1000,
    indent: 2
  }).replace(/^/gm, ' '.repeat(2))}`;
  return yamlString;
};
;// ./src/Loggers/Transformers.ts

const transformerEquity = async logEntry => logEntry;
const transformerYamlLog = async logEntry => omit(logEntry, ['error']);
;// ./src/Defaults.ts







const loggerPipesDefault = [{
  transformer: transformerEquity,
  formatter: formatterEmpty,
  exporter: exporterLogInMemory
}, {
  transformer: transformerEquity,
  formatter: formatterEntry,
  exporter: exporterConsole
}, {
  transformer: transformerEquity,
  formatter: formatterEntry,
  exporter: exporterLogFile
}, {
  transformer: transformerEquity,
  formatter: formatterEntry,
  exporter: exporterSocket
}, {
  transformer: transformerYamlLog,
  formatter: formatterYamlToString,
  exporter: exporterYamlLog
}];
const argsDefault = {
  PPD_ROOT: process.cwd(),
  PPD_ROOT_ADDITIONAL: [],
  PPD_ROOT_IGNORE: ['.git', 'node_modules', '.history', 'output', '.github', '.vscode'],
  PPD_FILES_IGNORE: [],
  PPD_TESTS: [],
  PPD_TESTS_RAW: [],
  PPD_DATA: {},
  PPD_SELECTORS: {},
  PPD_DEBUG_MODE: false,
  PPD_TAGS_TO_RUN: [],
  PPD_CONTINUE_ON_ERROR_ENABLED: false,
  PPD_OUTPUT: 'output',
  PPD_LOG_DISABLED: false,
  PPD_LOG_EXTEND: false,
  PPD_LOG_LEVEL_NESTED: 0,
  PPD_LOG_LEVEL_TYPE_IGNORE: [],
  PPD_LOG_SCREENSHOT: false,
  PPD_LOG_FULLPAGE: false,
  PPD_LOG_AGENT_NAME: true,
  PPD_LOG_IGNORE_HIDE_LOG: false,
  PPD_LOG_DOCUMENTATION_MODE: false,
  PPD_LOG_NAMES_ONLY: [],
  PPD_LOG_TIMESTAMP_SHOW: true,
  PPD_LOG_TIMER_SHOW: true,
  PPD_LOG_INDENT_LENGTH: 4,
  PPD_LOG_STEPID: false,
  PPD_IGNORE_AGENTS_WITHOUT_NAME: true,
  PPD_FILES_EXTENSIONS_AVAILABLE: ['.yaml', '.yml', '.ppd', '.json'],
  PPD_ALIASES: {},
  PPD_LIFE_CYCLE_FUNCTIONS: ['beforeRun', 'run', 'afterRun']
};
const BLANK_AGENT = {
  allowResults: [],
  bindData: {},
  bindDescription: '',
  bindResults: {},
  bindSelectors: {},
  data: {},
  dataExt: [],
  debugInfo: false,
  description: '',
  descriptionExtend: [],
  disable: false,
  errorIf: '',
  errorIfResult: '',
  if: '',
  inlineJS: '',
  name: '',
  needData: [],
  needSelectors: [],
  needEnvParams: [],
  repeat: 1,
  selectors: {},
  selectorsExt: [],
  tags: [],
  todo: '',
  type: 'agent',
  while: '',
  breakParentIfResult: ''
};
const EXTEND_BLANK_AGENT = () => {
  const result = {
    ...JSON.parse(JSON.stringify(BLANK_AGENT)),
    envsId: '',
    stepId: '',
    breadcrumbs: [],
    breadcrumbsDescriptions: [],
    resultsFromPrevSubling: {},
    source: '',
    funcFile: '',
    testFile: '',
    levelIndent: 0,
    dataParent: {},
    socket: blankSocket
    // atomRun: () => {},
  };
  // TODO: Несогласованая типизация

  return result;
};

// TODO: pass this parameter to RunOptions
const ENGINES_AVAILABLE = ['puppeteer', 'playwright'];
const resolveOptions = options => {
  var _configGlobal$plugins, _configGlobal, _options$pluginsList, _configGlobal$loggerP, _configGlobal2, _options$loggerPipes, _configGlobal$argsCon, _configGlobal3, _options$closeAllEnvs, _options$closeProcess, _options$stdOut, _options$globalConfig2;
  let configGlobal = {};
  try {
    var _options$globalConfig;
    configGlobal = require(external_path_default().join(process.cwd(), (_options$globalConfig = options.globalConfigFile) !== null && _options$globalConfig !== void 0 ? _options$globalConfig : 'puppedo.config.js'));
  } catch {
    // config not found, use defaults
  }
  const config = {
    pluginsList: {
      ...pluginsListDefault,
      ...((_configGlobal$plugins = (_configGlobal = configGlobal) === null || _configGlobal === void 0 ? void 0 : _configGlobal.pluginsList) !== null && _configGlobal$plugins !== void 0 ? _configGlobal$plugins : {}),
      ...((_options$pluginsList = options.pluginsList) !== null && _options$pluginsList !== void 0 ? _options$pluginsList : {})
    },
    loggerPipes: [...loggerPipesDefault, ...((_configGlobal$loggerP = (_configGlobal2 = configGlobal) === null || _configGlobal2 === void 0 ? void 0 : _configGlobal2.loggerPipes) !== null && _configGlobal$loggerP !== void 0 ? _configGlobal$loggerP : []), ...((_options$loggerPipes = options.loggerPipes) !== null && _options$loggerPipes !== void 0 ? _options$loggerPipes : [])],
    argsConfig: (_configGlobal$argsCon = (_configGlobal3 = configGlobal) === null || _configGlobal3 === void 0 ? void 0 : _configGlobal3.argsConfig) !== null && _configGlobal$argsCon !== void 0 ? _configGlobal$argsCon : {},
    closeAllEnvs: (_options$closeAllEnvs = options.closeAllEnvs) !== null && _options$closeAllEnvs !== void 0 ? _options$closeAllEnvs : true,
    closeProcess: (_options$closeProcess = options.closeProcess) !== null && _options$closeProcess !== void 0 ? _options$closeProcess : true,
    stdOut: (_options$stdOut = options.stdOut) !== null && _options$stdOut !== void 0 ? _options$stdOut : true,
    globalConfigFile: (_options$globalConfig2 = options.globalConfigFile) !== null && _options$globalConfig2 !== void 0 ? _options$globalConfig2 : 'puppedo.config.js',
    socket: blankSocket,
    debug: !!options.debug
  };
  return config;
};
;// ./src/Arguments.ts



const DELIMITER = ',';
const resolveBoolean = (key, val) => {
  if (typeof argsDefault[key] !== 'boolean' || typeof val === 'boolean') {
    return val;
  }
  const newVal = typeof val === 'string' && ['true', 'false'].includes(val) ? val === 'true' : val;
  if (typeof newVal !== 'boolean') {
    throw new Error(`Invalid argument type '${key}', 'boolean' required.`);
  }
  return newVal;
};
const resolveArray = (key, val) => {
  if (!Array.isArray(argsDefault[key])) {
    return val;
  }
  let newVal = null;
  if (Array.isArray(val)) {
    newVal = val;
  }
  if (typeof val === 'string') {
    try {
      newVal = JSON.parse(val);
    } catch {
      newVal = val.split(DELIMITER).map(v => v.trim());
    }
  }
  if (!Array.isArray(newVal)) {
    throw new Error(`Invalid argument type '${key}', 'array' required.`);
  }
  return [...new Set(newVal.filter(v => v !== null && v !== undefined && v !== ''))];
};
const resolveObject = (key, val) => {
  if (typeof argsDefault[key] !== 'object' || Array.isArray(argsDefault[key]) || typeof val === 'object' && !Array.isArray(val)) {
    return val;
  }
  let newVal = null;
  if (typeof val === 'string') {
    try {
      newVal = JSON.parse(val);
    } catch {
      throw new Error(`Invalid argument type '${key}', 'object' required.`);
    }
  }
  if (!newVal || Array.isArray(newVal)) {
    throw new Error(`Invalid argument type '${key}', 'object' required.`);
  }
  return newVal;
};
const resolveString = (key, val) => {
  if (typeof argsDefault[key] !== 'string' || typeof argsDefault[key] === 'string' && typeof val === 'string') {
    return val;
  }
  throw new Error(`Invalid argument type '${key}', 'string' required.`);
};
const resolveNumber = (key, val) => {
  if (typeof argsDefault[key] !== 'number' || typeof val === 'number') {
    return val;
  }
  const newVal = typeof val === 'string' && parseFloat(val);
  if (typeof newVal !== 'number' || Number.isNaN(newVal)) {
    throw new Error(`Invalid argument type '${key}', 'number' required.`);
  }
  return newVal;
};

/**
 * It takes an object of arguments and returns an object of arguments
 * @param args - Partial<ArgumentsType> = {}: This is the object that we're going to parse.
 * @returns Resolved object.
 */
const parser = (args = {}) => {
  const params = Object.keys(argsDefault);
  const result = params.reduce((acc, key) => {
    let newVal = args[key];
    if (newVal === undefined) {
      return acc;
    }
    newVal = resolveBoolean(key, newVal);
    newVal = resolveArray(key, newVal);
    newVal = resolveObject(key, newVal);
    newVal = resolveString(key, newVal);
    newVal = resolveNumber(key, newVal);
    return {
      ...acc,
      ...{
        [key]: newVal
      }
    };
  }, {});
  return result;
};

/**
 * It takes the command line arguments, filters out the ones that are not in the default arguments, and then parses them
 * @returns parsed arguments
 */
const parseCLI = () => {
  const params = Object.keys(argsDefault);
  const argsRaw = process.argv.flatMap(v => v.split(/\s+/)).map(v => v.replace(/'/g, '"')).map(v => v.split('=')).filter(v => v.length > 1).filter(v => params.includes(v[0]));
  return parser(Object.fromEntries(argsRaw));
};

/**
 * Class representing a collection of global arguments for the application.
 * This class extends the Singleton pattern to ensure a single instance of arguments across the app.
 * It handles parsing and merging of arguments from various sources including default values,
 * configuration files, environment variables, command-line inputs, and programmatically passed arguments.
 * The class provides a centralized way to manage and access all global settings and parameters
 * used throughout the application, ensuring consistency and ease of configuration.
 *
 * Usage examples:
 *
 * 1. Creating an instance with default arguments:
 *    const args = new Arguments();
 *
 * 2. Creating an instance with custom arguments:
 *    const customArgs = { PPD_DEBUG_MODE: true, PPD_OUTPUT: 'custom_output' };
 *    const args = new Arguments(customArgs);
 *
 * 3. Accessing arguments:
 *    const debugMode = args.args.PPD_DEBUG_MODE;
 *    const outputFolder = args.args.PPD_OUTPUT;
 *
 * 4. Reinitializing with new arguments:
 *    const newArgs = { PPD_LOG_SCREENSHOT: true, PPD_LOG_LEVEL_NESTED: 2 };
 *    const args = new Arguments(newArgs, {}, true);
 */
class Arguments extends Singleton {
  constructor(args = {}, argsConfig = {}, reInit = false) {
    super();
    this._args = this.initializeArgs(args, argsConfig, reInit);
  }
  initializeArgs(args, argsConfig, reInit) {
    if (reInit || !this._args) {
      const argsInput = parser(args);
      const argsEnv = parser(Object.entries(process.env).reduce((acc, [key, value]) => {
        var _value$toString;
        acc[key] = (_value$toString = value === null || value === void 0 ? void 0 : value.toString()) !== null && _value$toString !== void 0 ? _value$toString : '';
        return acc;
      }, {}));
      const argsCLI = parseCLI();
      const parsedArgs = parser(mergeObjects([argsDefault, parser(argsConfig), argsEnv, argsCLI, argsInput], true));
      return parsedArgs;
    }
    return this._args;
  }
  get args() {
    return this._args;
  }
}
;// external "events"
const external_events_namespaceObject = require("events");
;// ./src/Blocker.ts


class Blocker extends Singleton {
  constructor() {
    super();
    this.blocks = this.blocks || [];
    this.blockEmitter = this.blockEmitter || new external_events_namespaceObject.EventEmitter();
    this.blockEmitter.setMaxListeners(1000);
  }
  push(data) {
    this.blocks.push(data);
  }
  reset() {
    this.blocks = [];
  }
  setAll(blockArray) {
    this.blocks = blockArray;
    this.blocks.forEach(v => {
      this.blockEmitter.emit('updateBlock', v);
    });
  }
  setBlock(stepId, block) {
    this.blocks.forEach(v => {
      if (v.stepId === stepId) {
        const emmitData = {
          ...v,
          ...{
            block: Boolean(block)
          }
        };
        this.blockEmitter.emit('updateBlock', emmitData);
      }
    });
  }
  getBlock(stepId) {
    var _this$blocks$find;
    return Boolean((_this$blocks$find = this.blocks.find(v => v.stepId === stepId)) === null || _this$blocks$find === void 0 ? void 0 : _this$blocks$find.block);
  }
}
// EXTERNAL MODULE: ./node_modules/require-from-string/index.js
var require_from_string = __webpack_require__(83);
var require_from_string_default = /*#__PURE__*/__webpack_require__.n(require_from_string);
;// ./src/Loggers/CustomLogEntries.ts




const logExtendFileInfo = async (log, {
  envsId
}) => {
  if (envsId) {
    const output = new Environment().getOutput(envsId);
    const outputFile = external_path_default().join(output.folderFull || '.', 'output.log');
    const text = ['=============== EXTEND FILE ===============', `file:///${outputFile}`, ''];
    await log({
      text,
      levelIndent: 0,
      level: 'error',
      logMeta: {
        extendInfo: true
      }
    });
  }
};
const logError = async (log, error) => {
  if (error.message) {
    const text = ['============== ERROR MESSAGE ==============', ...error.message.split('\n'), ''];
    await log({
      text,
      levelIndent: 0,
      level: 'error',
      logMeta: {
        extendInfo: true
      }
    });
  }
  if (error.stack) {
    const text = ['============== ERROR STACK ==============', ...error.stack.split('\n'), ''];
    await log({
      text,
      levelIndent: 0,
      level: 'error',
      logMeta: {
        extendInfo: true
      }
    });
  }
};
const logTimer = async (log, startTime, endTime, {
  levelIndent = 0,
  stepId
}) => {
  const {
    PPD_LOG_EXTEND,
    PPD_LOG_STEPID
  } = new Arguments().args;
  if (PPD_LOG_EXTEND) {
    const {
      timeStart,
      timeEnd,
      deltaStr
    } = getTimer({
      timeStartBigInt: startTime,
      timeEndBigInt: endTime
    });
    await log({
      text: `⌛: ${deltaStr}${PPD_LOG_STEPID ? ` [${stepId}]` : ''}`,
      level: 'timer',
      levelIndent: levelIndent + 1,
      stepId,
      logMeta: {
        extendInfo: true,
        timeStart,
        timeEnd
      }
    });
  }
};
const logExtend = async (log, {
  data,
  bindData,
  selectors,
  bindSelectors,
  bindResults,
  options,
  levelIndent = 0
}, isError = false) => {
  const {
    PPD_LOG_EXTEND
  } = new Arguments().args;
  if (PPD_LOG_EXTEND || isError) {
    let text = [['📋 (data):', data], ['📌📋 (bD):', bindData], ['☸️ (selectors):', selectors], ['📌☸️ (bS):', bindSelectors], ['↩️ (results):', bindResults], ['⚙️ (options):', options]].filter(v => typeof v[1] === 'object' && Object.keys(v[1]).length).map(v => `${v[0]} ${JSON.stringify(v[1])}`);
    if (isError && text.length) {
      text = ['============== ALL DATA ==============', ...text, ''];
    }
    await log({
      text,
      levelIndent: isError ? 0 : levelIndent + 1,
      level: isError ? 'error' : 'info',
      logMeta: {
        extendInfo: true
      }
    });
  }
};
const logArgs = async log => {
  const args = Object.entries(new Arguments().args).map(v => `${v[0]}: ${JSON.stringify(v[1])}`);
  const text = ['============== ARGUMENTS ==============', ...args, ''];
  await log({
    text,
    levelIndent: 0,
    level: 'error',
    logMeta: {
      extendInfo: true
    }
  });
};
const logDebug = async (log, {
  data,
  selectors
}) => {
  let text = [];
  if (data && Object.keys(data).length) {
    const dataDebug = JSON.stringify(data, null, 2).split('\n');
    text = [...text, '============== DEBUG DATA ==============', ...dataDebug, ''];
  }
  if (selectors && Object.keys(selectors).length) {
    const selectorsDebug = JSON.stringify(selectors, null, 2).split('\n');
    text = [...text, '============== DEBUG SELECTORS ==============', ...selectorsDebug, ''];
  }
  await log({
    text,
    levelIndent: 0,
    level: 'error',
    logMeta: {
      extendInfo: true
    }
  });
};
;// ./src/AtomCore.ts



class AtomError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AtomError';
  }
}
class Atom {
  constructor(init = {}) {
    this.page = init.page || this.page;
    this.runner = init.runner || this.runner;
  }
  getEngine(engine) {
    const atomEngine = this.runner.getRunnerData().browser.engine;
    if (!ENGINES_AVAILABLE.includes(atomEngine)) {
      throw new Error(`There is unknown engine: ${atomEngine}. Use this engines: ${ENGINES_AVAILABLE}`);
    }
    return engine ? atomEngine === engine : atomEngine;
  }
  async getElement(selector, allElements = false, elementPatent = this.page) {
    if (selector && typeof selector === 'string') {
      const isXPath = selector.match(/^xpath[:=]/);
      const isText = selector.match(/^text[:=]/);
      const isCSS = !isXPath && !isText || selector.match(/^css[:=]/);
      let elements = [];
      if (this.getEngine('puppeteer')) {
        const selectorClean = selector.replace(/^css[:=]/, '').replace(/^xpath[:=]/, 'xpath/.').replace(/^text[:=]/, '');
        const elementParentPuppeteer = elementPatent;
        if (isXPath) {
          elements = await elementParentPuppeteer.$$(selectorClean);
        }
        if (isText) {
          elements = await elementParentPuppeteer.$$(`//*[text()[contains(.,"${selectorClean}")]]`);
        }
        if (isCSS) {
          elements = await elementParentPuppeteer.$$(selectorClean);
        }
      }
      if (this.getEngine('playwright')) {
        const selectorClean = selector.replace(/^css[:=]/, '').replace(/^xpath[:=]/, '').replace(/^text[:=]/, '');
        const elementParentPlaywright = elementPatent;
        if (isXPath) {
          elements = await elementParentPlaywright.$$(`xpath=${selectorClean}`);
        }
        if (isText) {
          elements = await elementParentPlaywright.$$(`text=${selectorClean}`);
        }
        if (isCSS) {
          elements = await elementParentPlaywright.$$(`css=${selectorClean}`);
        }
      }
      if (!allElements && elements.length) {
        return elements[0];
      }
      return elements;
    }
    return false;
  }
  async atomRun() {
    throw new AtomError('Empty Atom Run');
  }
  async updateFrame(agent) {
    var _elementHandle;
    const {
      plugins
    } = new Environment().getEnvInstance(agent.envsId);
    const {
      frame
    } = plugins.getPlugins('frame').getValues(agent.stepId);
    if (!frame) {
      return;
    }
    let elementHandle;
    if (this.getEngine('puppeteer')) {
      const page = this.page;
      elementHandle = await page.$$(`iframe[name="${frame}"]`);
    }
    if (this.getEngine('playwright')) {
      const page = this.page;
      elementHandle = await page.$$(`iframe[name="${frame}"]`);
    }
    const frameElem = ((_elementHandle = elementHandle) === null || _elementHandle === void 0 ? void 0 : _elementHandle.length) && (await elementHandle[0].contentFrame());
    if (frameElem) {
      this.page = frameElem;
    }
  }
  async runAtom(args) {
    const startTime = process.hrtime.bigint();

    // Use in atoms
    // this.allData
    // this.allRunners
    // this.browser
    // this.data
    // this.environment
    // this.envsId
    // this.log
    // this.options
    // this.page
    // this.runner
    // this.selectors

    const testArgs = Object.entries(args || {});
    testArgs.forEach(entry => {
      const [key, value] = entry;
      if (Object.hasOwn(args, key)) {
        this[key] = value;
      }
    });
    const {
      data,
      bindData,
      selectors,
      bindSelectors,
      bindResults,
      options,
      levelIndent,
      envsId,
      stepId,
      breadcrumbs
    } = args.agent;
    this.log = async customLog => {
      const logOptionsDefault = {
        screenshot: false,
        fullpage: false
      };
      if (args) {
        var _args$logOptions, _customLog$logOptions, _customLog$logMeta;
        const logOptions = {
          ...logOptionsDefault,
          ...((_args$logOptions = args.logOptions) !== null && _args$logOptions !== void 0 ? _args$logOptions : {}),
          ...((_customLog$logOptions = customLog.logOptions) !== null && _customLog$logOptions !== void 0 ? _customLog$logOptions : {})
        };
        const logMeta = {
          ...{
            breadcrumbs: breadcrumbs !== null && breadcrumbs !== void 0 ? breadcrumbs : []
          },
          ...((_customLog$logMeta = customLog.logMeta) !== null && _customLog$logMeta !== void 0 ? _customLog$logMeta : {})
        };
        const logData = {
          level: 'raw',
          levelIndent: (levelIndent !== null && levelIndent !== void 0 ? levelIndent : 0) + 1,
          logOptions,
          logMeta,
          ...customLog
        };
        logData.logOptions.logThis = logData.level === 'error' ? true : logData.logOptions.logThis;
        await args.log(logData);
      }
    };
    try {
      await this.updateFrame(args.agent);
      const result = await this.atomRun();
      await logExtend(this.log, {
        data,
        bindData,
        selectors,
        bindSelectors,
        bindResults,
        options,
        levelIndent
      });
      const endTime = process.hrtime.bigint();
      await logTimer(this.log, startTime, endTime, {
        levelIndent,
        stepId
      });
      return result;
    } catch (error) {
      await logError(this.log, error);
      await logExtend(this.log, {
        data,
        bindData,
        selectors,
        bindSelectors,
        bindResults,
        options,
        levelIndent
      }, true);
      await logArgs(this.log);
      await logDebug(this.log, {
        data,
        selectors
      });
      await logExtendFileInfo(this.log, {
        envsId
      });
      throw new AtomError('Error in Atom');
    }
  }
}
;// ./src/Error.ts


class AbstractError extends Error {
  constructor() {
    super();
    this.name = this.constructor.name;
  }
}
class TestError extends AbstractError {
  // TODO: избавиться от test тут
  constructor({
    logger,
    parentError,
    agent,
    plugins
  }) {
    var _this$agent$stepId;
    super();
    this.agent = agent;
    this.plugins = plugins;
    this.envsId = (parentError === null || parentError === void 0 ? void 0 : parentError.envsId) || this.agent.envsId;
    this.socket = (parentError === null || parentError === void 0 ? void 0 : parentError.socket) || this.agent.socket;
    this.stepId = (_this$agent$stepId = this.agent.stepId) !== null && _this$agent$stepId !== void 0 ? _this$agent$stepId : parentError === null || parentError === void 0 ? void 0 : parentError.stepId;
    this.testDescription = (parentError === null || parentError === void 0 ? void 0 : parentError.testDescription) || this.agent.description;
    this.message = `${parentError === null || parentError === void 0 ? void 0 : parentError.message} || error in test = ${this.agent.name}`;
    this.stack = parentError === null || parentError === void 0 ? void 0 : parentError.stack;
    this.breadcrumbs = (parentError === null || parentError === void 0 ? void 0 : parentError.breadcrumbs) || this.agent.breadcrumbs;
    this.breadcrumbsDescriptions = (parentError === null || parentError === void 0 ? void 0 : parentError.breadcrumbsDescriptions) || this.agent.breadcrumbsDescriptions;
    this.logger = logger;
    this.parentTest = parentError === null || parentError === void 0 ? void 0 : parentError.test;
    this.testTree = new Environment().getEnvInstance(this.plugins.envsId).testTree;
  }
  async log() {
    const {
      stepId,
      breadcrumbs,
      funcFile,
      testFile,
      levelIndent
    } = this.agent;
    const {
      continueOnError
    } = this.plugins.getPlugins('continueOnError').getValues(stepId);
    const {
      descriptionError
    } = this.plugins.getPlugins('descriptionError').getValues(this.stepId);

    // TODO: 2022-10-06 S.Starodubov BUG bindDescription not work
    const text = `${descriptionError ? `${descriptionError} | ` : ' '}Description: ${this.agent.description || 'No test description'} (${this.agent.name})`;
    const errorData = {
      level: 'error',
      text,
      stepId,
      levelIndent,
      error: this,
      logMeta: {
        funcFile,
        testFile,
        breadcrumbs
      },
      logOptions: {
        screenshot: false
      }
    };
    if (!continueOnError) {
      await this.logger.log(errorData);
    }
    this.testTree.addError({
      stepId,
      payload: errorData
    });
    if (levelIndent === 0 || continueOnError) {
      await this.summaryInfo();
    }
  }
  async summaryInfo() {
    const {
      message = '',
      breadcrumbs = [],
      breadcrumbsDescriptions = []
    } = this;
    const errors = this.testTree.getErrors();
    const descriptionErrorPath = errors.map(v => this.plugins.getPlugins('descriptionError').getValues(v.stepId).descriptionError).filter(v => !!v).join(' | ');

    // TODO: 2022-10-06 S.Starodubov BUG bindDescription not work
    const text = [`█ SUMMARY ERROR INFO:
                      █▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
                      █ Message:     ${message.split(' || ')[0]}
                      █ Error:       ${descriptionErrorPath}
                      █ Path:        ${breadcrumbs.join(' -> ')}
                      █ Description:`, ...breadcrumbsDescriptions.map((v, i) => `                      █ ${' '.repeat((1 + i) * 3)}${v}`)].join('\n');
    await this.logger.log({
      level: 'error',
      text,
      logMeta: {
        extendInfo: true
      }
    });
    this.testTree.clearErrors();
  }
}
class ContinueParentError extends AbstractError {
  constructor({
    localResults,
    errorLevel,
    logger,
    test,
    parentError,
    agent
  }) {
    super();
    this.agent = agent;
    this.localResults = localResults;
    this.errorLevel = errorLevel;
    this.logger = logger;
    this.test = test;
    this.parentError = parentError;
  }
  async log() {
    var _this$parentError;
    const {
      stepId,
      breadcrumbs,
      breakParentIfResult,
      levelIndent
    } = this.agent;
    const {
      PPD_LOG_STEPID
    } = new Arguments().args;
    await this.logger.log({
      level: 'warn',
      levelIndent,
      text: `Continue: ${((_this$parentError = this.parentError) === null || _this$parentError === void 0 ? void 0 : _this$parentError.message) || `test with expr ${breakParentIfResult}'`}${PPD_LOG_STEPID ? `[${stepId}]` : ''}`,
      logMeta: {
        breadcrumbs
      }
    });
  }
}
const errorHandler = async errorIncome => {
  var _error$socket;
  const error = {
    ...errorIncome,
    ...{
      message: errorIncome.message,
      stack: errorIncome.stack
    }
  };
  const {
    PPD_DEBUG_MODE = false
  } = new Arguments().args;
  if ((_error$socket = error.socket) !== null && _error$socket !== void 0 && _error$socket.sendYAML) {
    error.socket.sendYAML({
      data: {
        ...error
      },
      type: error.type || 'error',
      envsId: error.envsId
    });
  }
  if (!(errorIncome instanceof TestError)) {
    console.log(errorIncome.message);
    console.log(errorIncome);
  }
  if (PPD_DEBUG_MODE) {
    /* istanbul ignore next */
    if (!process.env.JEST_WORKER_ID) {
      // biome-ignore lint/suspicious/noDebugger: debug mode
      debugger;
    }
  }
  try {
    const runners = new Environment().getEnvRunners(errorIncome.envsId);
    if (runners.closeAllRunners) {
      await runners.closeAllRunners();
    }
  } catch {
    //
  }
  process.exit(1);
};
;// ./src/Test.ts









const checkNeeds = (needs, data, agentName) => {
  // [['data', 'd'], 'another', 'optional?']
  const keysData = new Set(Object.keys(data));
  needs.forEach(d => {
    if (typeof d === 'string' && d.endsWith('?')) return; // optional parameter
    const keysDataIncome = new Set(typeof d === 'string' ? [d] : d);
    const intersectionData = new Set([...keysData].filter(x => keysDataIncome.has(x)));
    if (!intersectionData.size) {
      throw new Error(`Error: can't find data parameter "${d}" in ${agentName} test`);
    }
  });
  return true;
};
const resolveDataFunctions = (funcParams, allData) => {
  const funcEval = Object.entries(funcParams).reduce((s, v) => {
    const [key, data] = v;
    let evalData = data;
    try {
      evalData = runScriptInContext(data, allData);
    } catch {
      // Nothing to do
    }
    const collector = {
      ...s,
      ...{
        [key]: evalData
      }
    };
    return collector;
  }, {});
  return funcEval;
};

// TODO: 2021-12-07 S.Starodubov move to class and improve with ${getLogText(text, this.name, PPD_LOG_AGENT_NAME)}
const checkIf = async (expr, ifType, log, plugins, agent, allData = {}) => {
  let {
    levelIndent = 0
  } = agent;
  const {
    breadcrumbs = [],
    stepId
  } = agent;
  const {
    continueOnError
  } = plugins.getPlugins('continueOnError').getValues(stepId);
  const {
    PPD_LOG_STEPID
  } = plugins.getPlugins('argsRedefine').getValues(stepId).argsRedefine;
  const textAddition = PPD_LOG_STEPID ? ` [${stepId}]` : '';
  if (ifType === 'errorIfResult') {
    levelIndent += 1;
  }
  const exprResult = runScriptInContext(expr, allData);
  if (!exprResult && ifType === 'if' || exprResult && ifType !== 'if') {
    const logLevel = exprResult ? 'error' : 'info';
    const logText = exprResult ? `Test stopped with expr ${ifType} = '${expr}'` : `Skip with IF expr '${expr}' === '${exprResult}'${textAddition}`;
    if (!continueOnError || logLevel === 'info') {
      await log({
        text: logText,
        level: logLevel,
        levelIndent,
        logOptions: {
          screenshot: !!exprResult,
          fullpage: !!exprResult
        },
        logMeta: {
          breadcrumbs
        }
      });
    }
    if (exprResult) {
      throw new Error(logText);
    }
    return true;
  }
  return false;
};
const updateDataWithNeeds = (needData, needSelectors, dataLocal, selectorsLocal) => {
  const allData = {
    ...selectorsLocal,
    ...dataLocal
  };
  const dataLocalCopy = {
    ...dataLocal
  };
  const selectorsLocalCopy = {
    ...selectorsLocal
  };
  [...needData, ...needSelectors].map(v => v.replace('?', '')).forEach(v => {
    dataLocalCopy[v] = typeof allData[v] !== 'undefined' ? allData[v] : null;
    selectorsLocalCopy[v] = typeof allData[v] !== 'undefined' ? allData[v] : null;
  });
  return {
    dataLocal: dataLocalCopy,
    selectorsLocal: selectorsLocalCopy
  };
};
const fetchData = (dataExt, selectorsExt, resultsFromParent, dataParent, data, bindData, selectors, bindSelectors, runner) => {
  const {
    PPD_DATA,
    PPD_SELECTORS
  } = new Arguments().args;
  const {
    data: allData,
    selectors: allSelectors
  } = new AgentContent().allData;
  const dataExtResolved = dataExt.reduce((collect, v) => {
    const extData = allData.find(d => v === d.name);
    return extData ? {
      ...collect,
      ...extData.data
    } : collect;
  }, {});
  const selectorsExtResolved = selectorsExt.reduce((collect, v) => {
    const extData = allSelectors.find(d => v === d.name);
    return extData ? {
      ...collect,
      ...extData.data
    } : collect;
  }, {});
  let dataLocal = {
    ...PPD_DATA,
    ...((runner === null || runner === void 0 ? void 0 : runner.getRunnerData().data) || {}),
    ...dataExtResolved,
    ...dataParent,
    ...(resultsFromParent || {}),
    ...data
  };
  let selectorsLocal = {
    ...PPD_SELECTORS,
    ...((runner === null || runner === void 0 ? void 0 : runner.getRunnerData().selectors) || {}),
    ...selectorsExtResolved,
    ...(resultsFromParent || {}),
    ...selectors
  };
  const allDataLocal = {
    ...dataLocal,
    ...selectorsLocal
  };
  Object.entries(bindData).forEach(v => {
    const [key, val] = v;
    dataLocal = {
      ...dataLocal,
      ...resolveDataFunctions({
        [key]: val
      }, allDataLocal)
    };
  });
  Object.entries(bindSelectors).forEach(v => {
    const [key, val] = v;
    selectorsLocal = {
      ...selectorsLocal,
      ...resolveDataFunctions({
        [key]: val
      }, allDataLocal)
    };
  });
  return {
    dataLocal,
    selectorsLocal
  };
};
const getLogText = (text, nameTest = '', PPD_LOG_AGENT_NAME = false) => {
  const nameTestResolved = nameTest && (PPD_LOG_AGENT_NAME || !text) ? `(${nameTest}) ` : '';
  const descriptionTest = text || 'TODO: Fill description';
  return `${nameTestResolved}${descriptionTest}`;
};
const checkIntersection = (dataLocal, selectorsLocal) => {
  const intersectionKeys = Object.keys(dataLocal).filter(v => Object.keys(selectorsLocal).includes(v));
  if (intersectionKeys.length) {
    intersectionKeys.forEach(v => {
      if (!Number.isNaN(dataLocal[v]) && !Number.isNaN(selectorsLocal[v]) && JSON.stringify(dataLocal[v]) !== JSON.stringify(selectorsLocal[v])) {
        throw new Error(`Some keys in data and selectors intersect. It can corrupt data: '${v}'`);
      }
    });
  }
};
class Test {
  agent = EXTEND_BLANK_AGENT();
  constructor(initValues) {
    var _initValues$atomRun;
    const {
      testTree,
      plugins,
      logger,
      testsStruct
    } = new Environment().getEnvInstance(initValues.envsId);
    testTree.createStep({
      stepIdParent: initValues.stepIdParent,
      stepId: initValues.stepId,
      payload: {}
    });
    this.plugins = plugins;
    this.agentTree = testTree;
    this.testsStruct = testsStruct;
    this.logger = logger;
    this.plugins.hook('initValues', {
      inputs: initValues,
      stepId: initValues.stepId
    });

    // TODO: Нужна какая то проверка тут initValues
    for (const key of Object.keys(this.agent)) {
      var _initValues$key;
      this.agent[key] = (_initValues$key = initValues[key]) !== null && _initValues$key !== void 0 ? _initValues$key : this.agent[key];
    }
    const {
      PPD_LIFE_CYCLE_FUNCTIONS
    } = new Arguments().args;
    this.lifeCycleFunctions = [(_initValues$atomRun = initValues.atomRun) !== null && _initValues$atomRun !== void 0 ? _initValues$atomRun : [], ...PPD_LIFE_CYCLE_FUNCTIONS.map(v => {
      var _initValues$v;
      return (_initValues$v = initValues[v]) !== null && _initValues$v !== void 0 ? _initValues$v : [];
    })].flat();
  }
  runLogic = async inputs => {
    var _inputs$stepId, _inputs$description, _ref, _inputs$descriptionEx, _inputs$bindDescripti;
    this.plugins.hook('runLogic', {
      inputs,
      stepId: inputs.stepId
    });
    const {
      timeStartBigInt,
      timeStart: timeStartDate
    } = getTimer();
    const {
      PPD_LOG_EXTEND,
      PPD_LOG_AGENT_NAME,
      PPD_TAGS_TO_RUN,
      PPD_LOG_DOCUMENTATION_MODE,
      PPD_LOG_NAMES_ONLY,
      PPD_LOG_TIMER_SHOW,
      PPD_LOG_STEPID
    } = this.plugins.getPlugins('argsRedefine').getValue(this.agent.stepId, 'argsRedefine');
    const {
      debug
    } = this.plugins.getPlugins('debug').getValues(this.agent.stepId);
    if (debug) {
      console.log(this);
      /* istanbul ignore next */
      if (!process.env.JEST_WORKER_ID) {
        // biome-ignore lint/suspicious/noDebugger: debug mode
        debugger;
      }
    }
    const {
      logShowFlag
    } = this.plugins.getPlugins('logOptions').getValues(this.agent.stepId).logOptions;
    const {
      skipMeBecausePrevSublingResults
    } = this.plugins.getPlugins('skipSublingIfResult').getValues(this.agent.stepId);
    if (this.agent.disable || skipMeBecausePrevSublingResults) {
      let disableText = '';
      if (this.agent.disable) {
        disableText = 'disable';
      }
      if (!disableText && skipMeBecausePrevSublingResults) {
        disableText = 'skipMeBecausePrevSublingResults or skipSublingIfResult';
      }
      await this.logger.log({
        text: `Skip with ${disableText}: ${getLogText(this.agent.description, this.agent.name, PPD_LOG_AGENT_NAME)}${PPD_LOG_STEPID ? `[${this.agent.stepId}]` : ''}`,
        level: 'raw',
        levelIndent: this.agent.levelIndent,
        logOptions: {
          logShowFlag,
          textColor: 'blue'
        },
        logMeta: {
          breadcrumbs: this.agent.breadcrumbs
        }
      });
      // Drop disable for loops nested tests
      this.agent.disable = false;
      return {
        result: {}
      };
    }
    if (PPD_TAGS_TO_RUN.length && this.agent.tags.length && !this.agent.tags.filter(v => PPD_TAGS_TO_RUN.includes(v)).length) {
      await this.logger.log({
        text: `Skip with tags: ${JSON.stringify(this.agent.tags)} => ${getLogText(this.agent.description, this.agent.name, PPD_LOG_AGENT_NAME)}${PPD_LOG_STEPID ? `[${this.agent.stepId}]` : ''}`,
        level: 'raw',
        levelIndent: this.agent.levelIndent,
        logOptions: {
          logShowFlag,
          textColor: 'blue'
        },
        logMeta: {
          breadcrumbs: this.agent.breadcrumbs
        }
      });
      return {
        result: {}
      };
    }

    // Get Data from parent test and merge it with current test
    this.agent.stepId = (_inputs$stepId = inputs.stepId) !== null && _inputs$stepId !== void 0 ? _inputs$stepId : this.agent.stepId;
    this.agent.description = (_inputs$description = inputs.description) !== null && _inputs$description !== void 0 ? _inputs$description : this.agent.description;
    this.agent.descriptionExtend = (_ref = (_inputs$descriptionEx = inputs.descriptionExtend) !== null && _inputs$descriptionEx !== void 0 ? _inputs$descriptionEx : this.agent.descriptionExtend) !== null && _ref !== void 0 ? _ref : [];
    this.agent.bindDescription = (_inputs$bindDescripti = inputs.bindDescription) !== null && _inputs$bindDescripti !== void 0 ? _inputs$bindDescripti : this.agent.bindDescription;
    this.agent.while = inputs.while || this.agent.while;
    this.agent.if = inputs.if || this.agent.if;
    this.agent.errorIf = inputs.errorIf || this.agent.errorIf;
    this.agent.errorIfResult = inputs.errorIfResult || this.agent.errorIfResult;
    this.agent.resultsFromPrevSubling = inputs.resultsFromPrevSubling || this.agent.resultsFromPrevSubling;
    this.agent.dataExt = [...new Set([...this.agent.dataExt, ...(inputs.dataExt || [])])];
    this.agent.selectorsExt = [...new Set([...this.agent.selectorsExt, ...(inputs.selectorsExt || [])])];
    this.agent.repeat = inputs.repeat || this.agent.repeat;
    this.agent.data = resolveAliases('data', inputs);
    this.agent.dataParent = {
      ...(this.agent.dataParent || {}),
      ...inputs.dataParent
    };
    this.agent.bindData = resolveAliases('bindData', inputs);
    this.agent.bindSelectors = resolveAliases('bindSelectors', inputs);
    this.agent.bindResults = resolveAliases('bindResults', inputs);
    const {
      logOptions
    } = this.plugins.getPlugins('logOptions').getValues(this.agent.stepId);
    const {
      selectors
    } = this.plugins.getPlugins('selectors').getValues(this.agent.stepId);
    this.agent.logOptions = logOptions;
    this.agent.selectors = selectors;
    try {
      var _inputs$dataParent, _inputs$dataParent2, _inputs$dataParent3, _this$runner, _this$runner2;
      this.plugins.hook('resolveValues', {
        inputs,
        stepId: this.agent.stepId
      });
      if (this.agent.needEnvParams.length) {
        for (const envParam of this.agent.needEnvParams) {
          if (!envParam.endsWith('?') && !Object.keys(process.env).includes(envParam)) {
            throw new Error(`You need set environment parametr: ${envParam}`);
          }
        }
      }
      checkIntersection(this.agent.data, this.agent.selectors);
      const {
        allRunners
      } = new Environment().getEnvInstance(this.agent.envsId);
      const current = new Environment().getCurrent(this.agent.envsId);
      this.runner = allRunners.getRunnerByName((current === null || current === void 0 ? void 0 : current.name) || '');
      let {
        dataLocal,
        selectorsLocal
      } = fetchData(this.agent.dataExt, this.agent.selectorsExt, this.agent.resultsFromPrevSubling, this.agent.dataParent, this.agent.data, this.agent.bindData, this.agent.selectors, this.agent.bindSelectors, this.runner);
      checkNeeds(this.agent.needData, dataLocal, this.agent.name);
      checkNeeds(this.agent.needSelectors, selectorsLocal, this.agent.name);
      ({
        dataLocal,
        selectorsLocal
      } = updateDataWithNeeds(this.agent.needData, this.agent.needSelectors, dataLocal, selectorsLocal));
      checkIntersection(dataLocal, selectorsLocal);
      const allData = {
        ...selectorsLocal,
        ...dataLocal
      };
      this.agent.repeat = parseInt(runScriptInContext(String(this.agent.repeat), allData, '1'), 10);
      allData.repeat = this.agent.repeat;
      dataLocal.repeat = this.agent.repeat;
      selectorsLocal.repeat = this.agent.repeat;
      allData.$loop = ((_inputs$dataParent = inputs.dataParent) === null || _inputs$dataParent === void 0 ? void 0 : _inputs$dataParent.repeat) || this.agent.repeat;
      dataLocal.$loop = ((_inputs$dataParent2 = inputs.dataParent) === null || _inputs$dataParent2 === void 0 ? void 0 : _inputs$dataParent2.repeat) || this.agent.repeat;
      selectorsLocal.$loop = ((_inputs$dataParent3 = inputs.dataParent) === null || _inputs$dataParent3 === void 0 ? void 0 : _inputs$dataParent3.repeat) || this.agent.repeat;
      const descriptionResolved = this.agent.bindDescription ? this.agent.description || String(runScriptInContext(this.agent.bindDescription, allData)) : this.agent.description;
      if (!descriptionResolved) {
        this.agent.logOptions.backgroundColor = 'red';
      }

      // Extend with data passed to functions
      const pageCurrent = (_this$runner = this.runner) === null || _this$runner === void 0 || (_this$runner = _this$runner.getState()) === null || _this$runner === void 0 || (_this$runner = _this$runner.pages) === null || _this$runner === void 0 ? void 0 : _this$runner[current === null || current === void 0 ? void 0 : current.page];

      // IF
      if (this.agent.if) {
        const skipIf = await checkIf(this.agent.if, 'if', this.logger.log.bind(this.logger), this.plugins, this.agent, allData);
        if (skipIf) {
          return {
            result: {}
          };
        }
      }

      // ERROR IF
      if (this.agent.errorIf) {
        await checkIf(this.agent.errorIf, 'errorIf', this.logger.log.bind(this.logger), this.plugins, this.agent, allData);
      }

      // LOG TEST
      if (!PPD_LOG_NAMES_ONLY.length || PPD_LOG_NAMES_ONLY.includes(this.agent.name)) {
        const elements = [];
        if (this.agent.logOptions.screenshot) {
          // Create Atom for get elements only
          const atom = new Atom({
            page: pageCurrent,
            runner: this.runner
          });
          const needSelectors = this.agent.needSelectors.map(v => selectorsLocal[v]);
          for (const selector of needSelectors) {
            const found = await atom.getElement(selector);
            if (Array.isArray(found)) {
              elements.push(...found);
            } else if (found) {
              elements.push(found);
            }
          }
        }
        if (!elements.length) {
          elements.push(null);
        }
        for (const element of elements) {
          await this.logger.log({
            text: `${getLogText(descriptionResolved, this.agent.name, PPD_LOG_AGENT_NAME)}${PPD_LOG_STEPID ? ` [${this.agent.stepId}]` : ''}`,
            level: 'test',
            levelIndent: this.agent.levelIndent,
            element,
            stepId: this.agent.stepId,
            logOptions: {
              ...this.agent.logOptions,
              logShowFlag
            },
            logMeta: {
              repeat: this.agent.repeat,
              breadcrumbs: this.agent.breadcrumbs
            }
          });
        }
        if (PPD_LOG_DOCUMENTATION_MODE) {
          for (let step = 0; step < this.agent.descriptionExtend.length; step += 1) {
            await this.logger.log({
              text: `${step + 1}. => ${getLogText(this.agent.descriptionExtend[step])}`,
              level: 'test',
              levelIndent: this.agent.levelIndent + 1,
              stepId: this.agent.stepId,
              logOptions: {
                logShowFlag,
                textColor: 'cyan'
              },
              logMeta: {
                repeat: this.agent.repeat,
                breadcrumbs: this.agent.breadcrumbs
              }
            });
          }
        }
      }

      // todo: перенести логику в хук
      if (this.agent.debugInfo) {
        logDebug(this.logger.log.bind(this.logger), {
          data: dataLocal,
          selectors: selectorsLocal
        });
        if (this.agent.debug) {
          console.log(this);
          /* istanbul ignore next */
          if (!process.env.JEST_WORKER_ID) {
            // biome-ignore lint/suspicious/noDebugger: debug mode
            debugger;
          }
        }
      }
      const {
        options
      } = this.plugins.getPlugins('options').getValues(this.agent.stepId);
      this.agent.options = options;
      const args = {
        agent: this.agent,
        options: this.agent.options,
        logOptions: this.agent.logOptions,
        environment: new Environment(),
        runner: this.runner,
        allRunners,
        data: dataLocal,
        selectors: selectorsLocal,
        browser: (_this$runner2 = this.runner) === null || _this$runner2 === void 0 ? void 0 : _this$runner2.getState().browser,
        page: pageCurrent,
        // If there is no page it`s might be API
        allData: new AgentContent().allData,
        log: this.logger.log.bind(this.logger),
        plugins: this.plugins
      };
      this.plugins.hook('beforeFunctions', {
        inputs: this.agent,
        stepId: this.agent.stepId
      });

      // LIFE CYCLE
      let resultFromLifeCycle = {};
      for (const funcs of this.lifeCycleFunctions) {
        const funcsArray = [funcs].flat();
        for (const func of funcsArray) {
          const funResult = (await func(args)) || {};
          resultFromLifeCycle = {
            ...resultFromLifeCycle,
            ...funResult
          };
        }
      }

      // RESULTS
      const results = this.agent.allowResults.length ? pick(resultFromLifeCycle, this.agent.allowResults) : resultFromLifeCycle;
      if (this.agent.allowResults.length && Object.keys(results).length && Object.keys(results).length !== [...new Set(this.agent.allowResults)].length) {
        throw new Error('Can`t get results from test');
      }
      const allowResultsObject = this.agent.allowResults.reduce((collect, v) => ({
        ...collect,
        ...{
          [v]: v
        }
      }), {});
      let localResults = resolveDataFunctions({
        ...this.agent.bindResults,
        ...allowResultsObject
      }, {
        ...selectorsLocal,
        ...dataLocal,
        ...results
      });
      this.plugins.hook('afterResults', {
        inputs: localResults,
        stepId: this.agent.stepId
      });

      // ERROR
      if (this.agent.errorIfResult) {
        await checkIf(this.agent.errorIfResult, 'errorIfResult', this.logger.log.bind(this.logger), this.plugins, this.agent, {
          ...allData,
          ...localResults
        });
      }

      // WHILE
      if (this.agent.while) {
        const whileEval = runScriptInContext(this.agent.while, {
          ...allData,
          ...localResults
        });
        if (whileEval) {
          this.agent.repeat += 1;
        }
      }

      // TIMER IN CONSOLE
      const {
        timeStart,
        timeEnd,
        deltaStr
      } = getTimer({
        timeStartBigInt,
        timeStart: timeStartDate
      });
      await this.logger.log({
        text: `🕝: ${deltaStr} (${this.agent.name})${PPD_LOG_STEPID ? ` [${this.agent.stepId}]` : ''}`,
        level: 'timer',
        levelIndent: this.agent.levelIndent,
        stepId: this.agent.stepId,
        logOptions: {
          logShowFlag: logShowFlag && (PPD_LOG_EXTEND || PPD_LOG_TIMER_SHOW) && (!PPD_LOG_NAMES_ONLY.length || PPD_LOG_NAMES_ONLY.includes(this.agent.name))
        },
        logMeta: {
          extendInfo: true,
          breadcrumbs: this.agent.breadcrumbs,
          repeat: this.agent.repeat,
          timeStart,
          timeEnd
        }
      });

      // REPEAT
      if (this.agent.repeat > 1) {
        const repeatArgs = {
          ...inputs
        };
        repeatArgs.selectors = {
          ...repeatArgs.selectors,
          ...localResults
        };
        repeatArgs.data = {
          ...repeatArgs.data,
          ...localResults
        };
        repeatArgs.repeat = this.agent.repeat - 1;
        repeatArgs.stepId = `${inputs.stepId}-repeat-${repeatArgs.repeat}`;
        const repeatResult = await this.run(repeatArgs);
        localResults = {
          ...localResults,
          ...repeatResult
        };
      }
      if (this.agent.breakParentIfResult) {
        const breakParentIfResult = runScriptInContext(this.agent.breakParentIfResult, {
          ...allData,
          ...localResults
        });
        if (breakParentIfResult) {
          throw new ContinueParentError({
            localResults,
            errorLevel: 1,
            logger: this.logger,
            test: this,
            agent: this.agent
          });
        }
      }
      this.plugins.hook('afterRepeat', {
        inputs: {
          ...allData,
          ...localResults
        },
        stepId: this.agent.stepId
      });
      return {
        result: localResults
      };
    } catch (error) {
      const {
        continueOnError
      } = this.plugins.getPlugins('continueOnError').getValues(this.agent.stepId);
      if (error instanceof ContinueParentError) {
        if (error.errorLevel) {
          await error.log();
          error.errorLevel -= 1;
          throw error;
        }
        return {
          result: error.localResults
        };
      }
      if (continueOnError) {
        const continueError = new ContinueParentError({
          localResults: error.localResults || {},
          errorLevel: 0,
          logger: this.logger,
          test: this,
          parentError: error,
          agent: this.agent
        });
        await continueError.log();
        return {
          result: error.localResults
        };
      }
      const newError = new TestError({
        logger: this.logger,
        parentError: error,
        agent: this.agent,
        plugins: this.plugins
      });
      await newError.log();
      throw newError;
    }
  };
  run = async inputArgs => {
    const {
      testTree
    } = new Environment().getEnvInstance(inputArgs.envsId);
    testTree.createStep({
      stepIdParent: inputArgs.stepIdParent,
      stepId: inputArgs.stepId,
      payload: {}
    });
    const blocker = new Blocker();
    const block = blocker.getBlock(this.agent.stepId);
    const {
      blockEmitter
    } = blocker;
    if (block && blockEmitter) {
      // Test
      // setTimeout(() => {
      //   blocker.setBlock(this.stepId, false);
      // }, 2000);
      return new Promise(resolve => {
        blockEmitter.on('updateBlock', async newBlock => {
          if (newBlock.stepId === this.agent.stepId && !newBlock.block) {
            resolve(await this.runLogic(inputArgs));
          }
        });
      });
    }
    return this.runLogic(inputArgs);
  };
}
;// ./src/getAgent.ts








const atoms = {};
const resolveJS = agentJson => {
  const {
    PPD_LIFE_CYCLE_FUNCTIONS
  } = new Arguments().args;
  const agentJsonNew = agentJson;
  const functions = pick(agentJsonNew, PPD_LIFE_CYCLE_FUNCTIONS);
  if (Object.values(functions).flat().length) {
    return agentJson;
  }
  try {
    if (agentJsonNew.inlineJS && typeof agentJsonNew.inlineJS === 'string') {
      try {
        atoms[agentJsonNew.inlineJS] = require_from_string_default()(`module.exports = async function atomRun() {\n${agentJsonNew.inlineJS}};`);
      } catch (error) {
        error.message = `Some errors in inlineJS: ${agentJsonNew.inlineJS}`;
        throw error;
      }
    } else {
      const testFileExt = external_path_default().parse(agentJsonNew.testFile).ext;
      const funcFile = external_path_default().resolve(agentJsonNew.testFile.replace(testFileExt, '.js'));
      atoms[agentJsonNew.name] = atoms[agentJsonNew.name] || require(funcFile)[agentJsonNew.name] || require(funcFile);
      agentJsonNew.funcFile = external_path_default().resolve(funcFile);
    }
    const instance = new Atom();
    instance.atomRun = atoms[agentJsonNew.inlineJS] || atoms[agentJsonNew.name];
    if (typeof instance.atomRun === 'function') {
      agentJsonNew.atomRun = [instance.runAtom.bind(instance)];
    }
  } catch (error) {
    if (error.name === 'SyntaxError') {
      throw error;
    }

    // If there is no JS file it`s fine.
    agentJsonNew.atomRun = [];
  }
  return agentJsonNew;
};
const getAgent = ({
  agentJsonIncome,
  envsId,
  parentStepMetaCollector // object for share data with sublings
}) => {
  let agentJson = agentJsonIncome;
  agentJson = resolveJS(agentJson);
  agentJson.envsId = envsId;
  agentJson.socket = new Environment().getSocket(envsId);
  if (agentJson.stepId) {
    const blocker = new Blocker();
    blocker.push({
      stepId: agentJson.stepId,
      block: false,
      breadcrumbs: agentJson.breadcrumbs
    });
    // Test
    // blocker.push({ stepId: agentJson.stepId, block: true, breadcrumbs: agentJson.breadcrumbs });
  }
  const {
    PPD_LIFE_CYCLE_FUNCTIONS
  } = new Arguments().args;
  PPD_LIFE_CYCLE_FUNCTIONS.forEach(funcKey => {
    if (agentJson[funcKey] && !Array.isArray(agentJson[funcKey])) {
      var _agentJson$breadcrumb;
      throw new Error(`Block ${funcKey} must be array. Path: '${((_agentJson$breadcrumb = agentJson.breadcrumbs) !== null && _agentJson$breadcrumb !== void 0 ? _agentJson$breadcrumb : []).join(' -> ')}'`);
    }
    if (agentJson[funcKey]) {
      const newFunctions = agentJson[funcKey].map(item => getAgent({
        agentJsonIncome: item,
        envsId,
        parentStepMetaCollector: agentJson
      }));
      agentJson[funcKey] = newFunctions;
    }
  });
  return stepResolver(agentJson, parentStepMetaCollector);
};

// todo навести порядок в этих типах
const propagateArgumentsObjectsOnAir = (source, args, list = []) => {
  const sourceValues = pick(source || {}, list);
  const argsValues = pick(args || {}, list);
  const renamedKeys = Object.fromEntries(Object.entries({
    ...sourceValues,
    ...argsValues
  }).map(v => [`${v[0]}Parent`, v[1]]));
  return {
    ...source,
    ...renamedKeys
  };
};
const stepResolver = (agentJson, parentStepMetaCollector) => {
  const stepFunction = async args => {
    var _args$agent, _parentStepMetaCollec;
    agentJson.stepIdParent = args === null || args === void 0 || (_args$agent = args.agent) === null || _args$agent === void 0 ? void 0 : _args$agent.stepId;
    const step = new Test(agentJson);
    const updatedAgentJson = propagateArgumentsObjectsOnAir(agentJson, {
      ...args
    }, ['data']);
    updatedAgentJson.resultsFromPrevSubling = (_parentStepMetaCollec = parentStepMetaCollector === null || parentStepMetaCollector === void 0 ? void 0 : parentStepMetaCollector.resultsFromPrevSubling) !== null && _parentStepMetaCollec !== void 0 ? _parentStepMetaCollec : {};
    const {
      result = {}
    } = await step.run(updatedAgentJson);
    if (parentStepMetaCollector) {
      var _parentStepMetaCollec2;
      parentStepMetaCollector.resultsFromPrevSubling = {
        ...((_parentStepMetaCollec2 = parentStepMetaCollector.resultsFromPrevSubling) !== null && _parentStepMetaCollec2 !== void 0 ? _parentStepMetaCollec2 : {}),
        ...result
      };
    }
    return result;
  };
  return stepFunction;
};
/* harmony default export */ const src_getAgent = (getAgent);
;// ./src/Api.ts








const initEnvironment = (options, argsInput) => {
  const {
    loggerPipes,
    pluginsList,
    argsConfig,
    stdOut,
    socket
  } = options;
  const {
    PPD_TESTS
  } = new Arguments(argsInput, argsConfig, true).args;
  if (!PPD_TESTS.length) {
    throw new Error('There is no tests to run. Pass any test in PPD_TESTS argument');
  }
  new PluginsFabric(pluginsList, true);
  const {
    envsId
  } = new Environment().createEnv({
    socket,
    loggerOptions: {
      stdOut,
      loggerPipes
    }
  });
  return envsId;
};
const runAgent = async (agentName, envsId) => {
  const {
    timeStartBigInt
  } = getTimer();
  const {
    logger
  } = new Environment().getEnvInstance(envsId);
  await logger.log({
    level: 'timer',
    text: `Test '${agentName}' start on '${getNowDateTime()}'`
  });
  const fullJSON = new Environment().getStruct(envsId, agentName);
  const textDescription = FlowStructure.generateFlowDescription(fullJSON);
  new Environment().setCurrent(envsId, {
    name: agentName
  });
  new Blocker().reset();
  const test = src_getAgent({
    agentJsonIncome: fullJSON,
    envsId
  });
  await logger.bulkLog([{
    level: 'env',
    text: `\n${textDescription}`
  }, {
    level: 'timer',
    text: `Prepare time 🕝: ${getTimer({
      timeStartBigInt
    }).deltaStr}`
  }]);
  const testResults = await test();
  await logger.log({
    level: 'timer',
    text: `Test '${agentName}' time 🕝: ${getTimer({
      timeStartBigInt
    }).deltaStr}`
  });

  // const { testTree } = new Environment().getEnvInstance(envsId);
  // console.log(JSON.stringify(testTree.getTree(['logOptions']), null, 2));

  return testResults;
};
const closeEnvironment = async (options, envsId) => {
  const {
    closeProcess,
    closeAllEnvs
  } = options;
  const {
    allRunners
  } = new Environment().getEnvInstance(envsId);
  if (closeAllEnvs) {
    await allRunners.closeAllRunners();
  }
  setTimeout(() => {
    if (closeProcess) {
      process.exit(0);
    }
  }, 0);
};
async function run(argsInput = {}, optionsInit = {}) {
  const results = {};
  const logs = {};
  const options = resolveOptions(optionsInit);
  const envsId = initEnvironment(options, argsInput);
  const {
    logger,
    log
  } = new Environment().getEnvInstance(envsId);
  const {
    PPD_TESTS
  } = new Arguments().args;
  if (options.debug) {
    await logger.log({
      level: 'timer',
      text: `Args: ${JSON.stringify(new Arguments().args)}`
    });
  }
  try {
    const {
      timeStartBigInt
    } = getTimer();
    for (const agentName of PPD_TESTS) {
      const testResults = await runAgent(agentName, envsId);

      // TODO: 2022-10-24 S.Starodubov Refactor this? It`s only for self tests
      const stepIds = Object.values(logs).flat().map(s => s.stepId);
      logs[agentName] = log.filter(v => !stepIds.includes(v.stepId));
      results[agentName] = testResults;
    }
    await logger.log({
      level: 'timer',
      text: `Evaluated time 🕝: ${getTimer({
        timeStartBigInt
      }).deltaStr}`
    });
    await closeEnvironment(options, envsId);
    console.log(JSON.stringify(results, null, 2));
    return {
      results,
      logs
    };
  } catch (error) {
    if (String(error).startsWith('SyntaxError') || String(error).startsWith('TypeError')) {
      error.debug = true;
      error.type = 'SyntaxError';
    }
    throw error;
  }
}
;// ./src/index.ts















/* harmony default export */ const src = ({
  run: run,
  errorHandler: errorHandler,
  FlowStructure: FlowStructure,
  getAgent: src_getAgent,
  /**
   * @deprecated
   */
  getTest: src_getAgent,
  AgentContent: AgentContent,
  Environment: Environment,
  Arguments: Arguments,
  Blocker: Blocker,
  Log: Log,
  Singleton: Singleton,
  paintString: paintString,
  blankSocket: blankSocket,
  argsDefault: argsDefault,
  runScriptInContext: runScriptInContext,
  Screenshot: Screenshot,
  Plugin: Plugin,
  Plugins: PluginsCore_Plugins,
  Atom: Atom
});
})();

module.exports = __webpack_exports__;
/******/ })()
;
//# sourceMappingURL=index.js.map
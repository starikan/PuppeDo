const fs = require('fs');
const path = require('path');

const _ = require('lodash');
const yaml = require('js-yaml');

const envs = require('../env.js');

const atoms = Object.keys(require('../atoms'));
atoms.push('log');

const yaml2json = async function(filePath){

  if (!_.isString(filePath)){
    throw({
      message: `YAML/JSON: Incorrect file name YAML/JSON - ${filePath}`
    });
  }
  
  if (!path.extname(filePath)){
    filePath += '.yaml';
  }

  if (path.dirname(filePath) === '.'){
    filePath = path.join(envs.get('args.testsFolder'), path.basename(filePath));
  }

  if (filePath.endsWith('.json')){
    try {
      var full = require(filePath);
      const functions = _.pick(full, ['beforeTest', 'runTest', 'afterTest', 'errorTest']);
      const values = _.omit(full, ['beforeTest', 'runTest', 'afterTest', 'errorTest']);
      return { full, functions, values };
    } catch (e) {
      throw(e);
    }
  }

  // todo 
  if (filePath.endsWith('.js')){
    return { full: filePath, functions: {}, values: {} };
  }
  
  if (filePath.endsWith('.yaml')){
    try {
      var full = yaml.safeLoad(fs.readFileSync(filePath, 'utf8'));
      
      const functions = _.pick(full, ['beforeTest', 'runTest', 'afterTest', 'errorTest']);
      const values = _.omit(full, ['beforeTest', 'runTest', 'afterTest', 'errorTest']);
      
      return { functions, values, full };
    } catch (e) {
      throw(e);
    }
  }
  
  throw({
    message: `YAML/JSON: Incorrect file name YAML/JSON - ${filePath}`
  });
}

const getFullDepthJSON = async function(filePath, breadcrumbs){

  if (!_.isString(filePath)) {
    throw({
      message: `YAML/JSON: Incorrect file name YAML/JSON - ${filePath}`
    });
  }

  if (!breadcrumbs){
    breadcrumbs = [filePath]
  }

  const { full, functions, values } = await yaml2json(filePath);
  
  for (const funcKey of Object.keys(functions)){
    
    const func = _.get(functions, funcKey);
    
    full[funcKey] = [];
    
    for (const key in func) {
      let test = _.clone(func[key]);
      let name = _.get(test, 'name');
      
      if (!name && Object.keys(test).length === 1){
        name = Object.keys(test)[0];
        test = test[Object.keys(test)[0]];
        test.name = name;
      }

      if (!name){
        throw ({ message: 'Any test must be named' })
      }

      const localBreadcrumbs = _.clone(breadcrumbs);
      localBreadcrumbs.push(name);
      
      if (!atoms.includes(name)){
        test = await getFullDepthJSON(name, localBreadcrumbs);
        test.type = 'test';
      }
      
      if (atoms.includes(name)){
        test.type = 'atom';
      }

      test.breadcrumbs = _.clone(localBreadcrumbs);
      full[funcKey].push(test);

    }
  }

  full.breadcrumbs = breadcrumbs;

  return full;
}



module.exports = { yaml2json, getFullDepthJSON };
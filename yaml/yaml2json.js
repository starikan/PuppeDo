const fs = require('fs');

const _ = require('lodash');
const yaml = require('js-yaml');

const envs = require('../env.js');

const atoms = Object.keys(require('../atoms'));
atoms.push('log');

const yaml2json = async function(path){
  if (!_.isString(path)){
    throw({
      message: `YAML/JSON: Incorrect file name YAML/JSON - ${path}`
    });
  }
  
  if (path.split('/').length === 1){
    path = envs.get('args.testsFolder') + path;
  }
  
  if (path.endsWith('.yaml')){
    try {
      var full = yaml.safeLoad(fs.readFileSync(path, 'utf8'));
      
      const functions = _.pick(full, ['beforeTest', 'runTest', 'afterTest', 'errorTest']);
      const values = _.omit(full, ['beforeTest', 'runTest', 'afterTest', 'errorTest']);
      
      return { functions, values, full };
    } catch (e) {
      throw(e);
    }
  }
  
  if (path.endsWith('.json')){
    return { full: path };
  }
  
  throw({
    message: `YAML/JSON: Incorrect file name YAML/JSON - ${path}`
  });
}

const getFullDepthJSON = async function(path){
  console.log(path);
  if (!_.isString(path)) {
    throw({
      message: `YAML/JSON: Incorrect file name YAML/JSON - ${path}`
    });
  }

  const { full } = await yaml2json(path);
  for (const key in full.runTest) {
    console.log(key)
    if (key && !atoms.includes(key)){
      full.runTest[key] = await getFullDepthJSON(full.runTest[key]);
    }
  }

  return full;
}

module.exports = { yaml2json, getFullDepthJSON };
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
      message: `yaml2json: Incorrect file name YAML/JSON/JS - ${filePath}`
    });
  }
  
  let isTestExist = fs.existsSync(filePath);

  let testsFolders = envs.get('args.testsFolders');
  let exts = ['.yaml', '.json', '.js'];
  let files = [];
  let testFile = null;

  if (!isTestExist){
    [filePath, path.basename(filePath)].forEach(file => {
      files.push(file);
      exts.forEach(ext => {
        files.push(file + ext);
        testsFolders.forEach(folder => {
          files.push('.\\' + path.join(folder, file + ext));
        })
      })
    })
  }

  for (let file of files) {
    try {
      if (fs.existsSync(file)) {
        testFile = file;
        break;
      }
    }
    catch (err) {}
  }

  let full = {};
  let functions = {};
  let values = {};

  if (!testFile){
    full = { name: testFile };
    values = { name: testFile };
    return { full, functions, values };
  }

  if (testFile && testFile.endsWith('.json')){
    try {
      full = require(testFile);
      functions = _.pick(full, ['beforeTest', 'runTest', 'afterTest', 'errorTest']);
      values = _.omit(full, ['beforeTest', 'runTest', 'afterTest', 'errorTest']);
      return { full, functions, values };
    } catch (e) {
      throw(e);
    }
  }

  // todo 
  if (testFile && testFile.endsWith('.js')){
    return { full: testFile, functions: {}, values: {} };
  }
  
  if (testFile && testFile.endsWith('.yaml')){
    try {
      full = yaml.safeLoad(fs.readFileSync(testFile, 'utf8'));
      functions = _.pick(full, ['beforeTest', 'runTest', 'afterTest', 'errorTest']);
      values = _.omit(full, ['beforeTest', 'runTest', 'afterTest', 'errorTest']);
      return { functions, values, full };
    } catch (e) {
      throw(e);
    }
  }
  
  throw({
    message: `YAML/JSON: Incorrect file name YAML/JSON - ${testFile}`
  });
}

const getFullDepthJSON = async function(filePath, breadcrumbs){

  if (!_.isString(filePath)) {
    throw({
      message: `yaml2json: Incorrect file name YAML/JSON/JS - ${filePath}`
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
      
      // let fullTest = {};

      if (!atoms.includes(name)){
        test = await getFullDepthJSON(name, localBreadcrumbs);
        test.type = 'test';
      }

      if (atoms.includes(name)){
        test.type = 'atom';
      }
      // else {
      //   // console.log(name)
      //   fullTest = await getFullDepthJSON(name, localBreadcrumbs);
      //   test.type = 'test';
      //   console.log(test)
      //   debugger;
      // }
      
      test.breadcrumbs = _.clone(localBreadcrumbs);

      // test = Object.assign(test, fullTest);

      full[funcKey].push(test);

    }
  }

  full.breadcrumbs = breadcrumbs;

  return full;
}



module.exports = { yaml2json, getFullDepthJSON };
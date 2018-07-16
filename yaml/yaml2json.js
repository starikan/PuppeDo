const fs = require('fs');
const path = require('path');

const _ = require('lodash');
const yaml = require('js-yaml');

const envs = require('../env.js');

const atoms = Object.keys(require('../atoms'));

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

  if (!testFile){
    full = { name: testFile };
    return { json: full };
  }

  if (testFile && testFile.endsWith('.json')){
    try {
      full = require(testFile);
      return { json: full };
    } catch (e) {
      throw(e);
    }
  }

  // todo 
  if (testFile && testFile.endsWith('.js')){
    return { json: testFile };
  }
  
  if (testFile && testFile.endsWith('.yaml')){
    try {
      full = yaml.safeLoad(fs.readFileSync(testFile, 'utf8'));
      return { json: full };
    } catch (e) {
      throw(e);
    }
  }
  
  throw({
    message: `YAML/JSON: Incorrect file name YAML/JSON - ${testFile}`
  });
}

const getFullDepthJSON = async function(filePath, testBody){

  if (filePath && !_.isString(filePath)) {
    throw({ message: `yaml2json: Incorrect FILE NAME YAML/JSON/JS - ${filePath}` });
  };

  if (testBody && !_.isObject(testBody)) {
    throw({ message: `yaml2json: Incorrect TEST BODY YAML/JSON/JS - ${testBody}` });
  };

  // if (!breadcrumbs){
  //   breadcrumbs = [filePath]
  // };

  let full = {};
  full = filePath ? (await yaml2json(filePath)).json : full;
  full = testBody ? Object.assign(full, testBody) : full;

  const runnerBlockNames = ['beforeTest', 'runTest', 'afterTest', 'errorTest']
  
  // Структура

  // runTest:
  // - testName:
  //     other: other
  
  // runTest:
  // - name: testName
  //   other: other

  // т.е. массив из объектов у которых только один ключ который является именем
  // или полный тест с полем имени

  for (const runnerBlock of runnerBlockNames){
    for (let runnerNum in _.get(full, runnerBlock, [])){
      let runner = _.get(full, [runnerBlock, runnerNum], {})
      let keys = Object.keys(runner);
      let newRunner = {};

      if (keys && keys.length == 1) {
        let name = keys[0];
        newRunner = _.clone(runner[keys[0]]) || newRunner;
        newRunner.name = keys[0];
        newRunner.type = 'test';
        if (atoms.includes(name)){
          newRunner.type = 'atom';
        }        
        if (name == 'log'){
          newRunner.type = 'log';
        }
      }

      name = _.get(newRunner, 'name', null);

      if (name) {
        full[runnerBlock][runnerNum] = await getFullDepthJSON(name, newRunner)
      }
    }
  }

  // debugger;
    
  //   const func = _.get(functions, funcKey);
    
  //   full[funcKey] = [];
    
  //   for (const key in func) {
  //     let test = _.clone(func[key]);
  //     let name = _.get(test, 'name');
      
  //     if (!name && Object.keys(test).length === 1){
  //       name = Object.keys(test)[0];
  //       test = test[Object.keys(test)[0]];
  //       test.name = name;
  //     }

  //     if (!name){
  //       throw ({ message: 'Any test must be named' })
  //     }

  //     const localBreadcrumbs = _.clone(breadcrumbs);
  //     localBreadcrumbs.push(name);
      
  //     // let fullTest = {};

  //     if (!atoms.includes(name)){
  //       test = await getFullDepthJSON(name, full, localBreadcrumbs);
  //       test.type = 'test';
  //     }

  //     if (atoms.includes(name)){
  //       test.type = 'atom';
  //     }
  //     // else {
  //     //   // console.log(name)
  //     //   fullTest = await getFullDepthJSON(name, localBreadcrumbs);
  //     //   test.type = 'test';
  //     //   console.log(test)
  //     //   debugger;
  //     // }
      
  //     test.breadcrumbs = _.clone(localBreadcrumbs);

  //     // test = Object.assign(test, fullTest);

  //     full[funcKey].push(test);

  //   }
  // }

  // full.breadcrumbs = breadcrumbs;

  return full;
}


module.exports = { yaml2json, getFullDepthJSON };
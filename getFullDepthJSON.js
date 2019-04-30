const _ = require("lodash");

const { yaml2json } = require("./yaml2json");

const getFullDepthJSON = function({ envs, filePath, testBody, testsFolder }) {
  if (filePath && !_.isString(filePath)) {
    throw {
      message: `yaml2json: Incorrect FILE NAME YAML/JSON/JS - ${filePath}`
    };
  }

  if (testBody && !_.isObject(testBody)) {
    throw {
      message: `yaml2json: Incorrect TEST BODY YAML/JSON/JS - ${testBody}`
    };
  }

  if (!testsFolder && envs) {
    testsFolder = envs.get("args.testsFolder");
  }

  let full = {};
  full = filePath ? yaml2json(filePath, testsFolder).json : full;

  if (!full) {
    throw {
      message: `Невозможно запустить в папке ${testsFolder} пустой тест ${filePath}`
    };
  }

  full = testBody ? Object.assign(full, testBody) : full;

  full.breadcrumbs = _.get(full, "breadcrumbs", [filePath]);

  const runnerBlockNames = ["beforeTest", "runTest", "afterTest", "errorTest"];

  for (const runnerBlock of runnerBlockNames) {
    let runnerBlockValue = _.get(full, [runnerBlock]);
    if (_.isArray(runnerBlockValue)) {
      for (let runnerNum in runnerBlockValue) {
        let newRunner = {};
        let name;
        let runner = _.get(runnerBlockValue, [runnerNum], {});

        let keys = Object.keys(runner);
        if (keys && keys.length == 1) {
          name = keys[0];
          newRunner = _.clone(runner[name]) || newRunner;
          newRunner.name = name;
        }

        name = _.get(newRunner, "name", null);

        if (name) {
          let breadcrumbs = _.clone(full.breadcrumbs);
          breadcrumbs.push(`${runnerBlock}[${runnerNum}].${name}`);
          newRunner.breadcrumbs = breadcrumbs;

          newRunner.type = name == "log" ? "log" : "test";

          full[runnerBlock][runnerNum] = getFullDepthJSON({
            filePath: name,
            testBody: newRunner,
            testsFolder: testsFolder
          });
        }
      }
    }
  }

  full.name = _.get(full, "name", filePath);

  return full;
};

module.exports = { getFullDepthJSON };

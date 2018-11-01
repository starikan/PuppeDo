const _ = require('lodash');

const { getFullDepthJSON } = require('./yaml/getFullDepthJSON');
const { getTest, getTestsFiles } = require('./yaml/getTest');

let tests = {};

let eventsOn = {
  // create_envs: async (data) => {
  //   const { envsId, envs, log } = require('./env')();
  //   await envs.init(args);
  //   this.ppd = Object.assign({}, {envsId, envs, log});
  //   this.emit({envsId});
  // },
  // get_all_tests: async (data) => {
  //   const tests = await getTestsFiles();
  //   this.emit(tests);
  // },
  start_test: async ({payload, envsId, socket}) => {
    try {
      let envs = {};
      if (!envsId){
        console.log('start_test', payload);
        let ppd = require('./env')();
        await ppd.envs.init(payload, false);
        console.log('createEnvs', ppd);
        envsId = _.get(ppd, 'envsId');
        envs = _.get(ppd, 'envs');
        tests[envsId] = ppd;
      }
      else {
        envs = _.get(tests, [envsId, 'envs'], {});
      }
      socket.send(JSON.stringify({
        message: 'start_test',
        envsId,
        payload: {
          envs: _.isObject(envs) ? _.omit(envs, ['init', 'log']) : {},
        }
      }))
    }
    catch(err){
      console.log(err)
      socket.send(JSON.stringify({
        err
      }))
    }
  },
  // get_json: (data) => {
  //   try {
  //     console.log('get_json', this);
  //     let envs = _.get(this, "ppd.envs");
  //     const fullJSON = getFullDepthJSON({
  //       envs: envs,
  //       filePath: envs.get('args.testFile'),
  //     });
  //     console.log(fullJSON)
  //     this.emit('news', fullJSON);
  //   }
  //   catch (err) {
  //     console.log(err)
  //   }
  // }
}

function runWsServer() {
  var path = require('path');
  var app = require('express')();
  var ws = require('express-ws')(app);

  app.get('/', (req, res) => {
    console.error('express connection');
    res.sendFile(path.join(__dirname, 'index.html'));
  });

  app.ws('/', (socket, req) => {
    console.log('websocket connection');
    socket.on('message', async data => {
      console.log(socket)
      const incomeData = JSON.parse(data);
      const message = _.get(incomeData, 'message');
      const envsId = _.get(incomeData, 'envsId');
      const payload = _.get(incomeData, 'payload');
      const funcOn = _.get(eventsOn, message);
      if (message && funcOn){
        await funcOn({payload, envsId, socket});
        // debugger
      }
    });
    socket.on('close', () => {});
  });

  app.listen(3001, () => console.error('listening on http://localhost:3001/'));
  console.error('websocket example');
}

if (!module.parent) {
  runWsServer();
} else {
  exports.runWsServer = runWsServer;
}

const _ = require('lodash');
const yaml = require('js-yaml');
const WebSocket = require('ws');

const { getFullDepthJSON, getDescriptions } = require('./getFullDepthJSON');
const { getAllYamls } = require('./yaml2json');
const { argParse, getUniqueID } = require('./helpers');

const socketFabric = ({ args = {}, socket, envsIdIn = null, callback = () => {}, method } = {}) => {
  if (!method) {
    return callback;
  } else {
    return async ({ args, socket, envsIdIn }) => {
      try {
        if (!envsIdIn && method != 'createEnvs') {
          throw { message: 'Not activate env' };
        }
        args = argParse(args);
        let { envsId, envs, log } = require('./env')({ socket, envsId: envsIdIn });
        await callback({ envsId, envs, log, args, socket, envsIdIn, method });
      } catch (err) {
        err.message += ` || error in '${method}'`;
        err.socket = socket;
        err.envId = envsIdIn;
        socket.sendYAML({ data: { message: err.message, stack: err.stack }, type: 'error', envId: envsIdIn });
        throw err;
      }
    };
  }
};

const socketEvents = {

  createEnvs: socketFabric({
    method: 'createEnvs',
    callback: async ({ socket, args, envsId }) => {
      socket.sendYAML({ data: args, type: 'createEnvs', envsId });
    },
  }),

  runEnv: socketFabric({
    method: 'runEnv',
    callback: async ({ socket, envs, args, envsId }) => {
      await envs.init({ args, envsId });
      socket.sendYAML({ data: args, type: 'runEnv', envsId });
    },
  }),

  fetchConfigs: socketFabric({
    method: 'fetchConfigs',
    callback: async ({ socket, envs, args, envsId }) => {
      socket.sendYAML({ data: args, type: 'fetchConfigs', envsId });
    },
  }),

  fetchStruct: socketFabric({
    method: 'fetchStruct',
    callback: async ({ socket, envs, args, envsId }) => {
      // await envs.init({ args, envsId });
      const fullJSON = getFullDepthJSON({
        envs,
        filePath: args.testFile,
        // testsFolder: args.testsFolder,
        textView: true,
      });
      socket.sendYAML({ data: fullJSON, type: 'fullJSON', envsId });
      const fullDescriptions = getDescriptions();
      socket.sendYAML({ data: fullDescriptions, type: 'fullDescriptions', envsId });
    },
  }),

  fetchAvailableTests: async ({ args = {}, socket, envsIdIn = null } = {}) => {
    try {
      if (!envsIdIn) {
        throw { message: 'Not activate env' };
      }
      args = argParse(args);
      let { envsId, envs, log } = require('./env')({ socket, envsId: envsIdIn });
      await envs.init({ args, envsId });

      const testsFolder = _.get(envs, ['args', 'testsFolder'], '.');
      const allYamls = await getAllYamls({ testsFolder, envsId });
      socket.sendYAML({ data: allYamls, type: 'allYamls', envsId });
    } catch (err) {
      err.message += ` || error in 'fetchAvailableTests'`;
      err.socket = socket;
      err.envId = envId;
      throw err;
    }
  },
};

const socketMethods = async ({ args = {}, socket, envsId, method } = {}) => {
  if (socketEvents[method]) {
    await socketEvents[method]({ args, socket, envsIdIn: envsId, method });
  } else {
    throw { message: `Can't find method: ${method} in socket server` };
  }
};

const createSocketServer = () => {
  const wss = new WebSocket.Server({ port: 3001 });

  wss.on('connection', ws => {
    console.log(ws, wss);
    ws.id = getUniqueID();
    ws.sendYAML = function(data) {
      return this.send.call(this, yaml.dump(data, { lineWidth: 1000, indent: 2 }));
    };

    ws.onmessage = async function(event) {
      try {
        const incomeData = JSON.parse(event.data);
        const { envsId, args, params, method } = incomeData;
        await socketMethods({ envsId, args, params, socket: this, method });
      } catch (err) {
        console.log(err);
        //TODO: 2019-06-11 S.Starodubov todo
      }
    };
    ws.onclose = () => {
      console.log('Close');
    };
    ws.onerror = () => {};
    ws.onopen = () => {};
  });

  return wss;
};

module.exports = {
  socketMethods,
  createSocketServer,
};

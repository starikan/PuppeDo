const _ = require('lodash');

const { getFullDepthJSON } = require('./yaml/getFullDepthJSON');
const { getTest } = require('./yaml/getTest');

// let eventsOn = {
//   disconnect: function() {
//     console.log('Got disconnect!');
//     console.log(allClients)
//     var i = allClients.indexOf(socket);
//     allClients.splice(i, 1);
//   },
//   'my other event': function (data) {
//     console.log(data);
//   },
//   'start_test': function (data) {
//     console.log('start_test', socket);
//     console.log(allClients)
//   }
// }

let runServer = function(){
  var io = require('socket.io')();
  io.listen(3000);

  io.on('connection', function (socket) {

    socket.emit('news', { hello: 'world' });

    socket.on('disconnect', function() {
      console.log('Got disconnect!');
    });

    socket.on('my other event', function (data) {
      console.log(data);
    });

    socket.on('start_test', async (data) => {
      try {
        console.log('start_test', data);
        socket.ppd = socket.ppd || {};
        socket.ppd = require('./env')();
        await socket.ppd.envs.init(data);
        console.log('createEnvs', socket);
        console.log(io.sockets.clients());
      }
      catch(err){
        console.log(err)
      }
    });

    socket.on('get_json', (data) => {
      try {
        console.log('get_json', socket);
        let envs = _.get(socket, "ppd.envs");
        const fullJSON = getFullDepthJSON({
          envs: envs,
          filePath: envs.get('args.testFile'),
        });
        console.log(fullJSON)
      }
      catch (err) {
        console.log(err)
      }
    });

  });
}

if (!module.parent) {
  runServer();
} else {
  exports.runServer = runServer;
}

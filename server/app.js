const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);

server.listen(80);

const { getFullDepthJSON } = require('./yaml/getFullDepthJSON');
const { getTest } = require('./yaml/getTest');

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});

var allClients = [];
io.on('connection', function (socket) {
  console.log(socket)
  allClients.push(socket);
  socket.emit('news', { hello: 'world' });

  socket.on('disconnect', function() {
    console.log('Got disconnect!');
    console.log(allClients)
    var i = allClients.indexOf(socket);
    allClients.splice(i, 1);
  });

  socket.on('my other event', function (data) {
    console.log(data);
  });
  socket.on('start_test', (data) => {
    console.log('start_test', socket);
  console.log(allClients)

  });
});


// const main = async () => {
//   const { envsId, envs, log } = require('./env')();
//   const debugOnError = true;
//   if (debugOnError){
//     envs.set('debugOnError', debugOnError);
//   }

//   await envs.init();
//   const full = await getFullDepthJSON({
//     envs: envs,
//     filePath: envs.get('args.testFile'),
//   });
//   let test = getTest(full, envsId);
//   await test();
//   await envs.closeBrowsers()
// }

// try {
//   main();
// }
// catch (error) {}

// process.on('unhandledRejection', async (error, p) => {
//   console.log('unhandledRejection')
//   console.log(error, p)
//   debugger
//   process.exit(1);
// });
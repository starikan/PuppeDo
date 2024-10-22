const http = require('http');
const fs = require('fs');
const path = require('path');

const port = 3000;

const runServer = () => {
  const requestHandler = (_, response) => {
    const data = fs.readFileSync(path.resolve('./src.tests.e2e/server.html'));
    response.writeHead(200, { 'Content-Type': 'text/html', 'Content-Length': data.length });
    response.write(data);
    response.end();
  };

  const server = http.createServer(requestHandler);

  server.listen(port, (err) => {
    if (err) {
      return console.log('something bad happened', err);
    }
    return null;
  });
};

if (!module.parent) {
  runServer();
} else {
  module.exports = runServer;
}

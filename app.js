var express = require('express');

const { log } = require('./logger/logger');
const { getFullDepthJSON } = require('./yaml/yaml2json');
const { getTest } = require('./yaml/getTest');

const envs = require('./env.js');

var app = express();

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
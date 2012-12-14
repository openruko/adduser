#!/usr/bin/env node

var fs = require('fs');
var Path = require('path');
var request = require('request');
var read = require("read");
var async = require("async");

var host = process.env.HEROKU_HOST || 'http://mymachine.me:5000/';
var home = process.env.HOME;


var netrc = fs.readFileSync(Path.join(home, '.netrc')).toString();
var lines = netrc.split('\n');

var key;
lines.forEach(function(line, i){
  if(line.indexOf(host) != 1){
    var passwordline = lines[i+2];
    if(passwordline) key = passwordline.replace('  password ', '');
  }
});

if(!key){
  throw new Error('~/netrc does not contains OpenRuko key, Please use OpenRuko cli before.');
}

async.series([
  function(cb){
    read({
      prompt: 'User name:'
    }, cb);
  },
  function(cb){
    read({
      prompt: 'User email:'
    }, cb);
  },
  function(cb){
    read({
      prompt: 'User password:',
      silent: true
    }, cb);
  }
], function(err, arr){
  request.post({
    url: host + 'internal/user',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': ' Basic ' + 
        new Buffer(':' + key).toString('base64')
    },
    body: JSON.stringify({
      email: arr[0][0],
      name: arr[1][0],
      password: arr[2][0]
    })
  }, function(err, resp, body){
    console.log(body);
  });
});


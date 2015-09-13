'use strict';

var config = require("./config");
var url = require('url');
var weibo = require('./weibo');
var db = require('./db.js');
var fs = require("fs");
var vm = require("vm");

var run = function (command, callback){
    require('child_process').exec(command, function(error, stdout, stderr){
        if ( callback !== undefined) {
            callback(stdout, stderr);
        }
    });
};

var setup = function(target) {
  db.loadDatabase(target);
};

var create = function(target) {
  var prepareCommand = "mkdir -p " + target + "/db";
  run(prepareCommand, function(stdout, stderr) {
    db.loadDatabase(target, function() {
      console.log("Created an empty database.");
    });
  });
};

var sync = function(target, source) {
  db.loadDatabase(target, function() {
    var address = weibo.access();
    require("open")(address);
  });
};

var main = function(request, response) {
  var parameter = url.parse( request.url, true);

  if ( parameter.pathname === "/_/oauth_accept" ) {
    if ( parameter.query.state === "weibo" && parameter.query.code != undefined) {
      weibo.getToken(request, response, function() {
        process.nextTick( function(){
          weibo.sync();
        });
      });
      return;
    }
  }

  // 默认处理
  response.statusCode = 503;
  response.end("{'ret':'error'}");
};

var interfaces = {};
interfaces.main = main;
interfaces.create = create;
interfaces.sync = sync;
interfaces.setup = setup;
module.exports = interfaces;

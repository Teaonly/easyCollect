'use strict';

var config = require("./config");
var url = require('url');
var weibo = require('./weibo');

var setup = function(target) {

};

var main = function(request, response) {
  var parameter = url.parse( request.url, true);
  if ( parameter.pathname === "/_/import" ) {
    if ( parameter.query.source === "weibo") {
      response.writeHead(200, {
        'Content-Type': 'text/plain'
      });

      var ret = {};
      ret.address = weibo.access(request, response);
      response.end(JSON.stringify(ret));
      return;
    }
  } else if ( parameter.pathname === "/_/oauth_accept" ) {
    if ( parameter.query.state === "weibo" && parameter.query.code != undefined) {
      weibo.getToken(request, response);
      return;
    }
  }

  // 默认处理
  response.statusCode = 503;
  response.end("{'ret':'error'}");
};

module.exports.main = main;
module.exports.setup = setup;

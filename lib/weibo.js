'use strict';
var config = require('./config');
var querystring = require('querystring');
var url = require('url');
var http = require('http');
var https = require('https');

var weibo = {};

weibo.access = function(req, res) {
  var urlObj = {
    'client_id': config.source.weibo.app_key,
    'redirect_uri': config.source.weibo.accept_url,
    'display': 'default',
    'state' : 'weibo'
  };

  var address = 'https://api.weibo.com/oauth2/authorize?' + querystring.stringify(urlObj);
  return address;
};

weibo.getToken = function(request, response) {
  var parameter = url.parse( request.url, true);
  config.source.weibo.authorization_code = parameter.query.code;

  var apiData = {
    'client_id': config.source.weibo.app_key,
    'client_secret':  config.source.weibo.app_secret,
    'redirect_uri': config.source.weibo.accept_url,
    'grant_type' : 'authorization_code',
    'code': config.source.weibo.authorization_code
  };

  var postData = querystring.stringify(apiData);
  var options = {
    hostname: 'api.weibo.com',
    port: 443,
    path: '/oauth2/access_token',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': postData.length
    }
  };

  var req = https.request(options, function(res) {
    var recvData = "";
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
      recvData = recvData + chunk;
    });
    res.on('end', function() {
      var tokenObj = JSON.parse( recvData );
      config.source.weibo.access_token = tokenObj.access_token;
      config.source.weibo.uid = tokenObj.uid;
      // 帮用户重定向到 微博同步 界面
      response.statusCode = 302;
      response.setHeader('Location', config.app.pathName + "/import.html?source=weibo");
      response.setHeader('Content-Length', '0');
      response.end();
    })
  });
  req.on('error', function(e) {
    console.log(">>>>>>>>>>>>>>>>>>:");
    response.statusCode = 503;
    response.end("{'ret':'error'}");
  });
  req.write(postData);
  req.end();
};

module.exports = weibo;

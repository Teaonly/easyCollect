'use strict';
var assert = require('assert');
var config = require('./config');
var querystring = require('querystring');
var url = require('url');
var http = require('http');
var https = require('https');
var db = require('./db');
var fs = require('fs');

var weibo = {};
weibo.access = function() {
  var urlObj = {
    'client_id': config.source.weibo.app_key,
    'redirect_uri': config.source.weibo.accept_url,
    'display': 'default',
    'state' : 'weibo'
  };

  var address = 'https://api.weibo.com/oauth2/authorize?' + querystring.stringify(urlObj);
  return address;
};

weibo.getToken = function(request, response, cb) {
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
      response.setHeader('Content-Type', "text/html; charset=UTF-8");
      response.end("<h3>正在同步微博，请关闭该页，查看终端。</h3>");
      if ( cb !== undefined) {
        cb();
      }
    })
  });
  req.on('error', function(e) {
    response.statusCode = 503;
    response.end("{'ret':'error'}");
  });
  req.write(postData);
  req.end();
};

weibo.sync = function() {
  assert.ok( config.source.weibo.access_token !== undefined, "access_token不存在" );

  var apiData = {
    access_token: config.source.weibo.access_token,
    count : 20
  };

  var syncWeibo = function(page) {
    var downloaded = (page - 1) * apiData.count;

    apiData.page = page;
    var apiAddress = "https://api.weibo.com/2/favorites.json?" + querystring.stringify(apiData);
    https.get(apiAddress, function(res){
      var recvData = "";
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
        recvData = recvData + chunk;
      });
      res.on('end', function() {
        var ret = JSON.parse( recvData );
        console.log("\t===> 获取" +  (ret.favorites.length+downloaded) + "/" + ret.total_number + " ...");
        weibo._storeWeibos(ret.favorites, function() {
          downloaded = downloaded + ret.favorites.length;
          if ( downloaded < ret.total_number ) {
            syncWeibo(page+1);
          } else {
            console.log("同步完成！");
            process.exit(0);
          }
        });
      });
    }).on('error', function(e) {
        assert(false, "weibp API 错误！");
    });
  };

  // 设置DB项目
  db.insertSource("weibo", "新浪微博", function() {
    console.log("开始同步微博数据...");
    syncWeibo(1);
  });
};

weibo._storeWeibos = function(favs, cb, cur) {
  if ( cur === undefined) {
    cur = 0;
  } else if ( cur >= favs.length) {
    cb();
    return;
  }
  var collect = {};
  collect.index = 'weibo_' + favs[cur].status.id;
  collect.source = 'weibo';
  collect.content = favs[cur].status.text;
  if ( favs[cur].status.user !== undefined) {
    collect.title = "新浪微博: @" + favs[cur].status.user.screen_name;
  } else {
    // 已经删除的微博
    weibo._storeWeibos(favs, cb, cur+1);
    return;
  }
  collect.date = new Date();
  db.insertCollect( collect, function(isNew){
    if ( isNew ) {
      var targetFile = config.app.data_path + '/data/' + collect.index + '.json';
      fs.writeFileSync(targetFile, JSON.stringify(favs[cur].status));
      weibo._storeWeibos(favs, cb, cur+1);
    } else {
      console.log("同步完成！");
      process.exit(0);
    }
  });
};

module.exports = weibo;

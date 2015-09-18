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
  db.insertSource("weibo", "新浪微博");
  console.log("开始同步微博数据...");
  syncWeibo(1);

};

weibo.getWeiboURL = function(req, res, user_id, weibo_id) {
  var apiData = {
    access_token: config.source.weibo.access_token,
    uid: user_id,
    id: weibo_id
  };
  var apiAddress = "http://api.weibo.com/2/statuses/go?" + querystring.stringify(apiData);
  http.get(apiAddress, function(response) {
    var address = {
      'url' : response.headers["location"],
    };
    res.statusCode = 200;
    res.end( JSON.stringify(address) );
  }).on('error', function(e) {
    res.statusCode = 200;
    res.end( JSON.stringify({}) );
  });
};

weibo._convert = function( fav ) {
  if ( fav.status.user === undefined) {
    return null;
  }

  var collect = {};
  collect.index = 'weibo_' + fav.status.id;
  collect.source = 'weibo';

  // 将必要的内容放置到数据库中
  var post = {};
  post.user_id = fav.status.user.id;
  post.user_name = fav.status.user.name;
  post.id = fav.status.id;
  post.text = fav.status.text;
  post.date = fav.status.created_at;

  collect.seconds = Date.parse(fav.status.created_at);
  collect.tags = [];
  collect.post = post;

  if ( fav.status.retweeted_status != undefined && fav.status.retweeted_status.user != undefined) {
    var repost = {};
    repost.user_id = fav.status.retweeted_status.user.id;
    repost.user_name = fav.status.retweeted_status.user.name;
    repost.id = fav.status.retweeted_status.id;
    repost.text = fav.status.retweeted_status.text;
    repost.date = fav.status.retweeted_status.created_at;
    collect.repost = repost;
  }

  return collect;
};

weibo._storeWeibos = function(favs, cb, cur) {
  if ( cur === undefined) {
    cur = 0;
  } else if ( cur >= favs.length) {
    cb();
    return;
  }

  var collect = weibo._convert( favs[cur]);
  if (collect == null) {
      weibo._storeWeibos(favs, cb, cur+1);
      return;
  }

  db.insertCollect( collect, function(isNew){
    if ( isNew  === true) {
      weibo._storeWeibos(favs, cb, cur+1);
    } else {
      console.log("同步完成！");
      process.exit(0);
    }
  });

};

module.exports = weibo;

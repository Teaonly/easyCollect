'use strict';

var config = require("./config");
var url = require('url');
var weibo = require('./weibo');
var db = require('./db.js');
var fs = require("fs");
var vm = require("vm");
var dateFormat = require('dateformat');
var md5 = require("blueimp-md5");

var run = function (command, callback){
    require('child_process').exec(command, function(error, stdout, stderr){
        if ( callback !== undefined) {
            callback(stdout, stderr);
        }
    });
};

var setup = function(target, cb) {
  db.loadDatabase(target,function(){
    db.parse(cb);
  });
};

var create = function(target) {
  db.loadDatabase(target, function() {
    var cmd = "mkdir -p " + target + "/gist";
    run(cmd);
    console.log("Created an empty database.");
  });
};

var sync = function(target, source) {
  db.loadDatabase(target, function() {
    if ( source === 'weibo' ) {
      var address = weibo.access();
      require("open")(address);
    }
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
  } else if ( parameter.pathname === "/_/getIndex" ) {
    var index = db.getIndex();
    response.statusCode = 200;
    response.end( JSON.stringify(index) );
    return;
  } else if ( parameter.pathname === "/_/getDataBySource") {
    db.getDataBySource(parameter.query.source, function(dataList){
      response.statusCode = 200;
      response.end( JSON.stringify(dataList) );
    });
    return;
  } else if ( parameter.pathname === "/_/getDataByTag") {
    db.getDataByTag(parameter.query.tag, function(dataList){
      response.statusCode = 200;
      response.end( JSON.stringify(dataList) );
    });
    return;
  } else if ( parameter.pathname === "/_/getDataByStar") {
    db.getDataByStar(function(dataList){
      response.statusCode = 200;
      response.end( JSON.stringify(dataList) );
    });
    return;
  } else if ( parameter.pathname === "/_/getDataByTags") {
    var tags = parameter.query['tags[]'];
    if ( tags.length > 0) {
      if ( parameter.query.and === 'true' ) {
        db.getDataByAndTags(tags, function(dataList){
          response.statusCode = 200;
          response.end( JSON.stringify(dataList) );
        });
      } else {
        db.getDataByOrTags(tags, function(dataList){
          response.statusCode = 200;
          response.end( JSON.stringify(dataList) );
        });
      }
      return;
    }
  } else if ( parameter.pathname === "/_/getGist") {
    db.getDataByIndex(parameter.query.index, function(dataList){
      if ( dataList.length === 1 && dataList[0].source === 'gist') {
        var gist = {};
        gist.filepath = process.cwd() + "/" + config.dbPath + "/" + dataList[0].filename;
        gist.lang = dataList[0].lang;
        gist.content = fs.readFileSync( gist.filepath , 'utf8');
        response.statusCode = 200;
        response.end( JSON.stringify(gist) );
      } else {
        response.statusCode = 200;
        response.end( JSON.stringify({}) );
      }
    });
    return;
  } else if ( parameter.pathname === "/_/getAddressOfWeibo") {
    db.getDataByIndex(parameter.query.index, function(dataList){
      if ( dataList.length === 1) {
        weibo.getWeiboURL(request, response, dataList[0].post.user_id, dataList[0].post.id);
      } else {
        response.statusCode = 200;
        response.end( JSON.stringify({}) );
      }
    });
    return;
  } else if ( parameter.pathname === "/_/updateTag" ) {
    db.getDataByIndex(parameter.query.index, function(dataList){
      if ( dataList.length === 1) {
        var tags = parameter.query['tags[]'];
        if ( tags === undefined) {
          tags = [];
        } else if ( !Array.isArray(tags)) {
          tags = [tags];
        }
        db.updateTag(dataList[0], tags);
      }
    });
    response.statusCode = 200;
    response.end( JSON.stringify({}) );
    return;
  } else if ( parameter.pathname === "/_/insertCollect") {
    if ( parameter.query.source === "url"
        && parameter.query.url !== undefined
        && parameter.query.memo !== undefined ) {

      var collect = {};
      collect.index = 'url_' + md5.md5( parameter.query.url );
      collect.source = 'url';
      collect.url = parameter.query.url;
      collect.memo =  parameter.query.memo;
      collect.tags = [];
      collect.date = dateFormat(new Date());
      collect.seconds = Date.parse(collect.date);
      db.insertCollect(collect, function(){});

    } else if(  parameter.query.source === "gist"
        && parameter.query.filename !== undefined
        && parameter.query.lang !== undefined
        && parameter.query.memo !== undefined ) {
      // 获取post的数据
      var gist = "";
      request.on('data', function (chunk) {
        gist += chunk;
      });
      request.on('end', function () {
        var gist_id = md5.md5( gist );
        var collect = {};

        collect.index = 'gist_' + md5.md5( gist );
        collect.source = 'gist';
        collect.lang =  parameter.query.lang;
        collect.filename = "gist/" + gist_id + "." + parameter.query.filename;
        collect.memo =  parameter.query.memo;
        collect.tags = [];
        collect.date = dateFormat(new Date());
        collect.seconds = Date.parse(collect.date);
        db.insertCollect(collect, function(isNew){
          if ( isNew === true) {
            var filepath = config.dbPath + "/" + collect.filename;
            fs.writeFileSync(filepath, gist);
           }
        });

      });
      return;
    }

    response.statusCode = 200;
    response.end( JSON.stringify({}) );
    return;
  } else if ( parameter.pathname === "/_/removeCollect") {
    db.getDataByIndex(parameter.query.index, function(dataList){
      if ( dataList.length === 1) {
        db.removeCollect(dataList[0], function() {
          // 删除对应的文件
          if (dataList[0].filename !== undefined) {
            fs.unlinkSync(  config.dbPath + "/" + dataList[0].filename );
          }
        });
      }
    });
    response.statusCode = 200;
    response.end( JSON.stringify({}) );
    return;
  } else if ( parameter.pathname === "/_/updateStar") {
    db.getDataByIndex(parameter.query.index, function(dataList){
      if ( dataList.length === 1) {
        dataList[0].star = parameter.query.star;
        db.updateStar(dataList[0]);
      }
    });
    response.statusCode = 200;
    response.end( JSON.stringify({}) );
    return;
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

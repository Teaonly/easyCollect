assert = require('assert');
var config = require('./config')
var Datastore = require('nedb');
var fs = require('fs');

var db = {};
db.loadDatabase = function(dbPath, cb) {
  var dbFile = dbPath + "/data.db";
  db._dataFile = dbFile;
  db._data = new Datastore({ filename: dbFile });
  db._data.loadDatabase( function(err) {
    db._data.ensureIndex({ fieldName: 'index', unique: true });
    assert(err === null);
    if (cb !== undefined) {
      cb();
    }
  });

  db._index = {};
  db._index.sources = {};
  db._index.tags = {};

  db._index.sources['url'] = "网址";
  db._index.sources['weibo'] = "新浪微博";
  db._index.sources['zhihu'] = "知乎问答";
  db._index.sources['github'] = "github项目";
};

db.parse = function(cb) {
  db._data.find({}).exec(function(err, docs) {
    assert(err === null);
    for ( var i = 0; i < docs.length; i++) {
      var tags = docs[i].tags;
      if ( tags === undefined) {
        continue;
      }

      for ( var j = 0; j < tags.length; j++) {
        if ( db._index.tags.hasOwnProperty( tags[j] )) {
          db._index.tags[tags[j]] ++;
        } else {
          db._index.tags[tags[j]] = 1;
        }
      }
    }

    if ( cb !== undefined) {
      cb();
    }
  });
}

db.getIndex = function(cb) {
  return db._index;
};

db.getDataBySource = function(src, cb) {
  if ( src === undefined) {
    db._data.find({}).sort({'seconds':-1}).exec(function(err, docs) {
      assert(err === null);
      cb(docs);
    });
  } else {
    db._data.find({source:src}).sort({'seconds':-1}).exec(function(err, docs) {
      assert(err === null);
      cb(docs);
    });
  }
};

db.getDataByTag = function(src, cb) {
  if ( src === undefined) {
    db._data.find({tags:{$size:0}})
      .sort({'seconds':-1})
      .exec(function(err, docs) {
        assert(err === null);
        cb(docs);
      });
  } else {
    db._data.find({tags:src}).sort({'seconds':-1}).exec(function(err, docs) {
      assert(err === null);
      cb(docs);
    });
  }
};

db.getDataByIndex = function(index, cb) {
  db._data.find({'index':index}, function(err, docs) {
    assert(err === null);
    cb(docs);
  });
};

db.updateTag = function(post, tags) {
  for (var i = 0; i < tags.length; i++) {
    var isNew = true;
    for(var j = 0; j < post.tags.length; j++) {
      if ( tags[i] === post.tags[j]) {
        isNew = false;
        break;
      }
    }
    if ( isNew ) {
      if (db._index.tags.hasOwnProperty(tags[i])) {
        db._index.tags[tags[i]] ++;
      } else {
        db._index.tags[tags[i]] = 1;
      }
    }
  }

  for(var j = 0; j < post.tags.length; j++) {
    var isRemoved = true;
    for (var i = 0; i < tags.length; i++) {
      if ( tags[i] === post.tags[j]) {
        isRemoved = false;
        break;
      }
    }
    if ( isRemoved ) {
      db._index.tags[post.tags[j]] --;
      if ( db._index.tags[post.tags[j]] === 0) {
        delete db._index.tags[post.tags[j]];
      }
    }
  }

  db._data.update({'index':post.index}, { $set: {"tags": tags} }, {}, function(){});
};

db.removeCollect = function(collect) {
  var tags = collect.tags;

  for (var i = 0; i < tags.length; i++) {
    db._index.tags[tags[i]] --;
    if ( db._index.tags[tags[i]] === 0) {
      delete db._index.tags[tags[i]];
    }
  }

  // 删除记录
  db._data.remove({ index: collect.index }, {}, function (err, numRemoved) {

  });
};

db.insertCollect = function(collect, cb) {
  db._data.find({'index':collect.index}, function(err1, docs) {
    assert(err1 === null);
    if ( docs.length === 1) {
      cb(false);
    } else if ( docs.length === 0){
      db._data.insert(collect, function(err2, newDoc){
        assert(err2 === null);
        cb(true);
      });
    } else {
      assert(false, "数据库错误！");
    }
  });
};

module.exports = db;

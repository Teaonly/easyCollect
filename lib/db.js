assert = require('assert');
var Datastore = require('nedb');
var fs = require('fs');

var db = {};
db.loadDatabase = function(dbPath, init, cb) {

  var dbFile = dbPath + "/data.db";
  db._dataFile = dbFile;
  db._data = new Datastore({ filename: dbFile });
  db._data.loadDatabase( function(err) {
    if ( err !== undefined) {
      if ( init === true) {
        db._data.ensureIndex({ fieldName: 'index', unique: true });
      }
      if ( cb !== undefined) {
        cb();
      }
    } else {
      assert(false, "数据库错误！");
    }
  });

  var dbFile = dbPath + "/index.db";
  db._indexFile = dbFile;
  db._index = {};
  if ( init === true) {
    db._index.sources = [{value:'user', display: '用户定义'}];
    db._index.tags = [];
    var indexString = JSON.stringify(db._index);
    fs.writeFileSync(dbFile, indexString);
  } else {
    db._index = JSON.parse(fs.readFileSync(dbFile).toString());
    assert(db._index.sources != undefined && db._index.tags != undefined);
  }
};

db.getIndex = function(cb) {
  return db._index;
};

db.getDataBySource = function(src, cb) {
  if ( src === undefined) {
    db._data.find({}, function(err, docs) {
      assert(err === null);
      cb(docs);
    });
  } else {
    db._data.find({source:src}, function(err, docs) {
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

db.insertSource = function(src, display) {
  for (var i = 0; i < db._index.sources.length; i++) {
    if ( db._index.sources[i].value === src) {
      return false;
    }
  }
  db._index.sources.push( {value:src, 'display':display} );
  var indexString = JSON.stringify(db._index);
  fs.writeFileSync(db._indexFile, indexString);    //同步到文件
  return true;
};

db.insertTag = function(tag, cb) {
  // TODO

};

db.removeTag = function(tag) {

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

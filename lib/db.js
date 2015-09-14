assert = require('assert');
var Datastore = require('nedb');

var db = {};
db.loadDatabase = function(dbPath, init, cb) {
  var dbFile = dbPath + "/index.db";
  db._index = new Datastore({ filename: dbFile });
  db._index.loadDatabase( function(err) {
    if ( err !== undefined) {
      dbFile = dbPath + "/data.db";
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
    } else {
      assert(false, "数据库错误！");
    }
  });
};

db.getIndex = function(cb) {
  db._index.find({}, function(err, docs) {
    assert(err === null);
    cb(docs);
  });
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

db.insertSource = function(src, cb) {
  db._index.find({'type':'source','value':src}, function(err1, docs) {
    assert(err1 === null);
    if ( docs.length === 1) {
      cb(false);
    } else if ( docs.length === 0){
      db._index.insert({'source':src}, function(err2, newDoc){
        assert(err2 === null);
        cb(true);
      });
    } else {
      assert(false, "数据库错误！");
    }
  });
};

db.insertTag = function(tag, cb) {
  db._index.find({'type':'tag','value':tag}, function(err1, docs) {
    assert(err1 === null);
    if ( docs.length === 1) {
      cb(false);
    } else if ( docs.length === 0){
      db._index.insert({'source':src}, function(err2, newDoc){
        assert(err2 === null);
        cb(true);
      });
    } else {
      assert(false, "数据库错误！");
    }
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

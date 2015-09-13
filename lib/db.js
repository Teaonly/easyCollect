var Datastore = require('nedb');

var db = {};

db.loadDatabase = function( dbPath, cb) {
  var dbFile = dbPath + "/index.db";
  db._index = new Datastore({ filename: dbFile });
  db._index.loadDatabase( function(err) {
    if ( err !== undefined) {
      dbFile = dbPath + "/data.db";
      db._data = new Datastore({ filename: dbFile });
      db._data.loadDatabase( function(err) {
        if ( err !== undefined) {
          if ( cb !== undefined) {
            cb();
          }
        } else {
          console.log("Load database error!");
        }
      });
    } else {
      console.log("Load database error!");
    }
  });
};


module.exports = db;

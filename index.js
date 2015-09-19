var nStatic = require('node-static');
var fileServer = new nStatic.Server('./www');
var url = require('url');
var http = require('http');
var config = require('./lib/config')
var app = require('./lib/easyCollect');

var argv = require('optimist')
    .usage('Usage: $0 --cmd [create|sync|view] --target db_folder --source [weibo|twitter]')
    .demand('cmd')
    .demand('target')
    .describe('cmd', 'create: Create DB, view: Use exist DB, sync: import and sync from source.')
    .describe('target', 'Database folder which stores index and feeds')
    .describe('source', 'Source of collection, such as weibo')
    .argv

config.app.data_path = argv.target;
if ( argv.cmd === "view" ) {
    app.setup(argv.target, function() {
      // start internal HTTP server for web interface
      http.createServer(function (request, response) {
        if ( request.url.substring(0, 3) === "/_/" ) {
          app.main(request, response);
        } else {
          request.addListener('end', function () {
              fileServer.serve(request, response);
          }).resume();
        }
      }).listen(config.app.listenPort);

      require("open")(config.app.pathName + "/index.html");
      console.log("Open http://127.0.0.1:8080/index.html with browser");
    });

} else if ( argv.cmd === "create") {
    app.create( argv.target );
} else  if ( argv.cmd === "sync") {
    if ( argv.source === "weibo") {
        // start internal HTTP server for web interface
        http.createServer(function (request, response) {
          if ( request.url.substring(0, 3) === "/_/" ) {
            app.main(request, response);
          } else {
            request.addListener('end', function () {
                fileServer.serve(request, response);
            }).resume();
          }
        }).listen(config.app.listenPort);

        app.sync(argv.target, argv.source);
    } else {
        console.log( require('optimist').help() );
    }
} else {
    console.log( require('optimist').help() );
}

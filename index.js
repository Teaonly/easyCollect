var nStatic = require('node-static');
var fileServer = new nStatic.Server('./www');
var url = require('url');
var http = require('http');
var app = require('./lib/easyCollect');

var argv = require('optimist')
    .usage('Usage: $0 -cmd [create|start] -target db_folder ')
    .demand('cmd')
    .demand('target')
    .describe('cmd', 'create: Create DB, start: Use exist DB')
    .describe('target', 'Database folder which stores index and feeds')
    .argv

if ( argv.cmd === "start" ) {
    app.setup(argv.target);

    // start internal HTTP server for web interface
    http.createServer(function (request, response) {
      if ( request.url.substring(0, 3) === "/_/" ) {
        app.main(request, response);
      } else {
        request.addListener('end', function () {
            fileServer.serve(request, response);
        }).resume();
      }
    }).listen(8080);

    require("open")("http://127.0.0.1:8080/index.html");
    console.log("Open http://127.0.0.1:8080/index.html with browser");

} else if ( argv.cmd === "create") {
    app.create( argv.target );
} else  {
    console.log( require('optimist').help() );
}

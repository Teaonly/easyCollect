var nStatic = require('node-static');
var fileServer = new nStatic.Server('./www');
var url = require('url');
var http = require('http');

http.createServer(function (request, response) {

}).listen(8080);

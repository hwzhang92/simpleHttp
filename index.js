var http = require('http');
var url = require('url');
var path = require('path');
var util = require('util');
var fs = require('fs');
var config = require('./conf/config.js');
var mime = require('./mime.json');
function onRequest(request, response){
	if(request.method === 'GET'){
		var pathname = url.parse(request.url).pathname;
		if(/^\/static/.test(pathname)){
			var filename = pathname.substr("/static/".length);
			if(filename.length === 0) filename = config.defaultFile;
			var filePath = path.isAbsolute(config.root) ? path.join(config.root, filename) : path.join(__dirname, config.root, filename);
			console.log(filePath);
			fs.exists(filePath, function(exists){
				if(!exists){
					return page_404(request,response,pathname);
				}else{
					var stream = fs.createReadStream(filePath,{flags : "r", encoding : null});
					stream.on('error',function(err){
						return page_500(request,response,err);
					})
					response.writeHead(200,{'Content-Type':(mime[pathname.split('.').pop()]||'text/plain')+'; charset=utf-8'});
					stream.pipe(response);
				}
			})
		}else{
			return page_404(request,response,pathname);
		}
	}
}
var page_404 = function(req, res, path){
    res.writeHead(404, {
      'Content-Type': 'text/html'
    });
    res.write('<!doctype html>\n');
    res.write('<title>404 Not Found</title>\n');
    res.write('<h1>Not Found</h1>');
    res.write(
    '<p>The requested URL ' +
     path + 
    ' was not found on this server.</p>'
    );
    res.end();
}
var page_500 = function(req, res, error){
    res.writeHead(500, {
      'Content-Type': 'text/html'
    });
    res.write('<!doctype html>\n');
    res.write('<title>Internal Server Error</title>\n');
    res.write('<h1>Internal Server Error</h1>');
    res.write('<pre>' + util.inspect(error) + '</pre>');
}
http.createServer(onRequest).listen(8888);
console.log("simpleHttp has started on port 8888");
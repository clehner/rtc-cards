// Simple static webserver

var fs = require("fs");
var path = require("path");
var url = require("url");

var mimes = {
    ".html": "text/html",
    ".css":  "text/css",
    ".js":   "text/javascript",
    ".woff": "font/woff",
    ".ttf":  "font/ttf",
    ".png":  "image.png"
};

function statico(serveDefault) {
	return function(request, response) {
		var uri = decodeURIComponent(url.parse(request.url).pathname);
		if (uri.indexOf("/static/") === 0) {
			statico.serveFile(uri.substr(1), response);
		} else {
			serveDefault.call(this, uri, request, response);
		}
	};
}

statico.serve404 = function(res) {
	res.writeHead(404);
	res.end("404 Not Found\n");
};

statico.serveFile = function(filename, resp) {
    var contentType = mimes[path.extname(filename)] || "text/plain";
    resp.setHeader("Content-Type", contentType);
    fs.createReadStream(filename)
        .on("error", function(err) {
            if (err.code == "ENOENT") {
				statico.serve404(resp);
            } else if (err.code == "EISDIR") {
                resp.writeHead(403);
                resp.write("403 Forbidden\n");
            } else {
                resp.writeHead(500);
                resp.write(err + "\n");
                console.error("Error serving file", filename, err);
            }
            resp.end();
        })
        .pipe(resp);
};

module.exports = statico;

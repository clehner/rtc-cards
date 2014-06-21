var http = require('http');
var WebSocketServer = require('ws').Server;
var WebsocketStream = require('websocket-stream');
var statico = require('./statico');
var Doc = require('crdt').Doc;
var Scuttlebucket = require('scuttlebucket');
var RRTC = require('r-rtc');

var docs = {};

function newDoc(url) {
	if (!url.indexOf('/signalling/')) {
		return new RRTC();
	} else if (!url.indexOf('/cards/')) {
		return new Doc();
	} else if (!url.indexOf('/cards+signalling/')) {
		return new Scuttlebucket()
			.add('signalling', new RRTC())
			.add('cards', new Doc());
	}
}

function getDoc(url) {
	return docs[url] || (docs[url] = newDoc(url));
}

var server = http.createServer(statico(function(url, req, res) {
	console.log('req for', url, req.url);
	if (!url.indexOf('/cards/')) {
		var stream = getDoc(url).createReadStream();
		stream.pipe(res);
		stream.on('data', function(data) {
			if (data == "\"SYNC\"\n") {
				this.end();
			}
		});
	} else if (url == '/') {
		statico.serveFile('index.html', res);
	} else if (!url.indexOf('/room/')) {
		statico.serveFile('app.html', res);
	} else {
		statico.serve404(res);
	}
}));
server.listen(8082, '::');
console.log('server listening on :8082');

var wss = new WebSocketServer({
	server: server,
	verifyClient: function(info, cb) {
		console.log('ws request from', info.origin, info.req.url);
		var doc = getDoc(info.req.url);
		info.req._doc = doc;
		if (doc) cb(true);
		else cb(false, 404, 'Not found');
	}
});

wss.on('connection', function(ws) {
	var stream = WebsocketStream(ws);
	var doc = ws.upgradeReq._doc;
	if (!doc) {
		console.error('Got ws connection without doc');
		ws.close();
	}
	stream.pipe(doc.createStream()).pipe(stream);
	stream.on('error', function(e) {
		console.log('stream error', e);
	});
	console.log('stream started');
	stream.on('end', function() {
		console.log('stream ended');
	});
});

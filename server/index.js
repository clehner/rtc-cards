var http = require('http');
var WebSocketServer = require('ws').Server;
var WebsocketStream = require('websocket-stream');
var ecstatic   = require('ecstatic');
var Doc = require('crdt').Doc;
var Scuttlebucket = require('scuttlebucket');
var RRTC = require('r-rtc');

var server = http.createServer(ecstatic({
	root: '.',
	baseDir: '/'
}));
server.listen(8082, '::');
console.log('server listening on :8082');

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

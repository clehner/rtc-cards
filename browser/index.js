var Doc = require('crdt').Doc;
var CardTable = require('./app').CardTable;
var reconnectWS = require('reconnect-ws');
var RTCChannelStream = require('rtc-dcstream');
var Scuttlebucket = require('scuttlebucket');
var u = require('scuttlebutt/util');
var RRTC = require('r-rtc');

var idKey = 'rtc-cards_id';
var id = sessionStorage[idKey] || (sessionStorage[idKey] = u.createId());

var table;
var tableModel = new Doc(id);
var signalling = new RRTC(id);

var model = new Scuttlebucket(id)
	.add('signalling', signalling)
	.add('cards', tableModel);
window.model = model;

/*
signalling.on('old_data', function(d) {
	console.log('old data', d);
});
*/

signalling.on('peerstate', function(id, state) {
	if (state == 'active') {
		//table.setSynced(false);
		signalling.connect(id);
	}
});

var streams = 0;

signalling.on('peerconnection', function(id, peerConnection) {
	//console.debug('got peer connection', id, peerConnection);
	var dataChannel = peerConnection.createDataChannel('doc', {
		id: 'doc',
		negotiated: true
	});
	//table.setSynced(false);

	dataChannel.addEventListener('open', function() {
		//console.debug('channel opened');
		console.log('stream', ++streams, 'opened');
		//table.setSynced(true);
	}, false);

	dataChannel.addEventListener('error', function(e) {
		console.error('channel error', e);
	}, false);

	var stream = new RTCChannelStream(dataChannel);
	stream.pipe(model.createStream()).pipe(stream);
	stream.on('error', function(e) {
		console.log('stream error', e, stream);
	});
	stream.on('close', function() {
		console.log('stream', --streams, 'closed', stream);
	});
});

signalling.setState('active');

var href = location.origin + location.pathname;
var m = href.match(/^http(.*)\/room\/([^\/]*)/);
if (!m) {
	throw new Error('404 Not found');
}
var root = 'http' + m[1];
var wsRoot = 'ws' + m[1];
var roomId = m[2];

var ws = reconnectWS(function(stream) {
	console.log('connected to websocket server');
	stream.pipe(tableModel.createStream()).pipe(stream);
}).on('disconnect', function() {
  console.log('disconnected from websocket server');
}).on('reconnect', function(n, delay) {
  console.log('reconnect to websocket server', n, delay);
});

// bootstrap using xhr for fast load time
var path = '/cards/' + roomId;
var writeStream = tableModel.createStream();
var xhr = new XMLHttpRequest();
xhr.open('get', root + path, true);
xhr.onload = function() {
	writeStream.write(xhr.responseText);

	// establish duplex connection with websocket
	ws.connect(wsRoot + path);
};
xhr.send(null);

/*
reconnectWS(function(stream) {
	console.log('connected to signalling socket');
	stream.pipe(signalling.createStream()).pipe(stream);
}).connect(wsRoot + '/signalling/2');
*/

/*
reconnectWS(function(stream) {
	stream.pipe(model.createStream()).pipe(stream);
}).connect(root + '/cards+signalling/2');
*/

console.log('my id', signalling.id);

document.addEventListener('DOMContentLoaded', function() {
	table = new CardTable(document.body, tableModel);
	window.table = table;
	table.setSynced(true);
}, false);

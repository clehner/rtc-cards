var Doc = require('crdt').Doc;
var CardTable = require('./app').CardTable;
var reconnectWS = require('reconnect-ws');
var RTCDataStream = require('rtc-data-stream');
var Scuttlebucket = require('scuttlebucket');
var RRTC = require('r-rtc');

var tableModel = new Doc();
var signalling = new RRTC();

var model = new Scuttlebucket()
	.add('signalling', signalling)
	.add('cards', tableModel);
window.model = model;

signalling.on('peerstate', function(id, state) {
	if (state == 'active') {
		table.setSynced(false);
		signalling.connect(id);
	}
});

signalling.on('peerconnection', function(id, peerConnection) {
	console.debug('got peer connection', id, peerConnection);
	var dataChannel = peerConnection.createDataChannel('doc', {
		id: 'doc',
		negotiated: true
	});

	dataChannel.addEventListener('open', function() {
		console.debug('channel opened');
		table.setSynced(true);
	}, false);

	dataChannel.addEventListener('error', function(e) {
		console.error('channel error', e);
	}, false);

	var stream = new RTCDataStream(dataChannel);
	stream.pipe(model.createStream()).pipe(stream);
	stream.on('error', function(e) {
		console.log('stream error', e);
	});
	stream.on('close', function() {
		console.log('stream closed');
	});
});

signalling.setState('active');

var reconn = reconnectWS(function(stream) {
	console.log('connected to ws');
	stream.pipe(signalling.createStream()).pipe(stream);
	/*
	var i = 0;
	stream.on('data', function(data) {
		i++;
		//console.log(i, 'message', data);
		if (data == "\"SYNC\"\n") {
			console.log('sync', i, 'messages');
		}
	});
	*/
}).connect('ws://localhost:8082/7');

//model.createStream().on('data', console.log.bind(console, 'model data'));
console.log('my id', signalling.id);

document.addEventListener('DOMContentLoaded', function() {
	var table = new CardTable(document.body, tableModel);
	window.table = table;
	table.setSynced(false);

	//reconn.on('connect', table.setSynced.bind(table, true));
	reconn.on('disconnect', table.setSynced.bind(table, false));
}, false);

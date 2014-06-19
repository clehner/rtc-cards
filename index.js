var Doc = require('crdt').Doc;
var CardTable = require('./app').CardTable;
var reconnectWS = require('reconnect-ws');

var model = new Doc();

var reconn = reconnectWS(function (stream) {
	console.log('connected to ws');
	stream.pipe(model.createStream()).pipe(stream);
}).connect('ws://localhost:8082/');

document.addEventListener('DOMContentLoaded', function() {
	var table = new CardTable(document.body, model);
	window.table = table;
	table.setSynced(false);

	reconn.on('connect', table.setSynced.bind(table, true));
	reconn.on('disconnect', table.setSynced.bind(table, false));
}, false);

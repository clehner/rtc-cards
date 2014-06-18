var quickconnect = require('rtc-quickconnect');
var mesh = require('rtc-mesh');
var Doc = require('crdt').Doc;
var CardTable = require('./app').CardTable;

document.addEventListener('DOMContentLoaded', function() {
	var qc = quickconnect('http://celehner.com:3000/', {
		room: 'rtc-cards'
	});
	var model = mesh(qc, { model: new Doc() });
	var table = new CardTable(document.body, model);
	window.table = table;
}, false);

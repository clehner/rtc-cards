var rand = require('random-seed').create();

function Array_notIn(item) {
	return this.indexOf(item) === -1;
}

function diffArray(current, previous) {
	var added = current.filter(Array_notIn.bind(previous));
	var removed = previous.filter(Array_notIn.bind(current));
	return [added, removed];
}

function generateColor(str) {
	rand.seed(str);
	var hue = rand.random() * 360;
	var sat = rand.floatBetween(95, 100);
	var light = rand.floatBetween(60, 90);
	return 'hsl(' + hue + ', ' + sat + '%, ' + light + '%)';
	//return husl.p.toHex(hue, sat, light);
}

function User(table, row) {
	this.id = row.id;
	this.row = row;
	this.table = table;
	this.isLocal = (row.id == table.doc.id);
	this.cardsHeld = [];
	row.on('update', this.onUpdate.bind(this));
}

var U = User.prototype;

U.getColor = function() {
	return this.color || (this.color = generateColor(this.id));
};

U.setHeldCards = function(cardIds) {
	if (!this.isLocal) throw new Error('Don\'t set data for other user');
	this.row.set('cards', cardIds);
};

// ignore user saying they hold cards for longer than this amount of time
// TODO: build this into a custom model
var handTimeout = 1000 * 60 * 5;

U.onUpdate = function(update, change) {
	var timestamp = update[1];
	if (update[2] != this.id) {
		console.error('Got user data update from wrong source:',
			update, this.id);
		return;
	}

	if (change.cards) {
		if (timestamp < new Date() - handTimeout) {
			change.cards = [];
		}
		var diff = diffArray(change.cards, this.cardsHeld);
		this.cardsHeld = change.cards;
		this.table.userHoldsCards(this, diff[0], diff[1]);
	}
};

module.exports = User;

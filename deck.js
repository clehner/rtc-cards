var Card = require('./card');
var deckTypes = require('./cards.json');

function Deck(row, table) {
	this.id = row.id;
	this.row = row;
	this.table = table;
	row.on('change', this.onChange.bind(this));

	this.style = document.createElement('style');
	this.style.type = 'text/css';
	document.documentElement.firstChild.appendChild(this.style);
	var styleSheet = this.style.sheet;

	styleSheet.insertRule('.card-' + this.row.id + ' { }', 0);
	this.cardStyle = styleSheet.rules[0].style;

	styleSheet.insertRule('.card-' + this.row.id + ' .front { }', 0);
	this.frontStyle = styleSheet.rules[0].style;

	styleSheet.insertRule('.card-' + this.row.id + ' .back { }', 0);
	this.backStyle = styleSheet.rules[0].style;
}

Deck.prototype.initCards = function() {
	this.initedCards = true;
	var deckId = this.row.id;

	this.set = this.table.doc.createSet(function(state) {
		return state.type == 'card' && state.deck == deckId;
	});

	this.set.onEach(function(row) {
		var card = new Card(row, this, this.table);
		this.table.addCard(card);
		row.on('removed', this.table.removeCard.bind(this.table, card));
	}.bind(this));
};

Deck.prototype.onChange = function(change) {
	if (!this.initedCards) {
		this.initCards();
	}

	if (change.size) {
		this.width = change.size[0];
		this.height = change.size[1];
		this.cardStyle.width = this.width + 'px';
		this.cardStyle.height = this.height + 'px';
	}
	if (change.backUrl) {
		this.backUrl = change.backUrl;
		this.backStyle.backgroundImage = 'url(' + this.backUrl + ')';
	}
	if (change.spriteUrl) {
		this.spriteUrl = change.spriteUrl;
		this.frontStyle.backgroundImage = 'url(' + this.spriteUrl + ')';
	}
};

Deck.add = function(doc, opt) {
	var x = opt.x || 10;
	var y = opt.y || 10;
	var z = opt.z || 0;
	var density = opt.density || 7/52;
	var backColor = opt.backColor || 'red';
	var type = opt.type || 'regular';
	var data = deckTypes[type];
	if (!data) throw new Error('Unknown deck type');

	// create deck row
	var deckId = doc.add({
		type: 'deck',
		backUrl: data.backs[backColor],
		spriteUrl: data.src,
		size: data.size
	}).id;

	// create card rows
	var i = 0;
	for (var suit = 0; suit < 4; suit++) {
		for (var rank = 0; rank < 13; rank++) {
			doc.add({
				type: 'card',
				deck: deckId,
				suit: suit,
				rank: rank,
				position: {
					x: x + i * density,
					y: y + i * density
				},
				z: z + i,
				faceup: false
			});
			i++;
		}
	}
};

Deck.prototype.width = 10;
Deck.prototype.height = 10;
Deck.prototype.spriteUrl = '';
Deck.prototype.backUrl = '';

module.exports = Deck;

var Card = require('./card');
var deckTypes = require('./cards.json');

function Deck(row, table) {
	this.id = row.id;
	this.row = row;
	this.table = table;

	this.el = document.createElement('img');
	this.el.className = 'deck';
	this.el.title = 'Remove this deck';
	this.el.onclick = this.onClick.bind(this);

	row.on('change', this.onChange.bind(this));
	row.on('*', console.log.bind(console, 'row event'));

	this.style = document.createElement('style');
	this.style.type = 'text/css';
	document.documentElement.firstChild.appendChild(this.style);
	var styleSheet = this.style.sheet;

	styleSheet.insertRule('.card-' + this.row.id + ' { }', 0);
	this.cardStyle = styleSheet.cssRules[0].style;

	styleSheet.insertRule('.card-' + this.row.id + ' .front { }', 0);
	this.frontStyle = styleSheet.cssRules[0].style;

	styleSheet.insertRule('.card-' + this.row.id + ' .back { }', 0);
	this.backStyle = styleSheet.cssRules[0].style;
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

Deck.prototype.onClick = function() {
	// remove the deck
	var doc = this.table.doc;
	this.set.forEach(function(row) {
		doc.rm(row.id);
	});
	doc.rm(this.row.id);
};

Deck.prototype.onChange = function(change) {
	if (!this.initedCards) {
		this.initCards();
	}

	if (change.type === null) {
		this.table.removeDeck(this);
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
	if (change.iconUrl) {
		this.el.src = change.iconUrl;
	}
};

Deck.add = function(doc, opt) {
	var x = opt.x || 10;
	var y = opt.y || 10;
	var z = opt.z || 0;
	var density = opt.density || 13/52;
	var backColor = opt.backColor || 'red';
	var type = opt.type || 'regular';
	var data = deckTypes[type];
	if (!data) throw new Error('Unknown deck type');
	var back = data.backs[backColor];

	// create deck row
	var deckId = doc.add({
		type: 'deck',
		backUrl: back.src,
		spriteUrl: data.src,
		iconUrl: back.icon,
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
					y: y + i * density,
					z: z + i
				},
				held: false,
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

var DragController = require('./drag-controller');
var KeyController = require('./key-controller');
var Deck = require('./deck');
var CardSelection = require('./selection');

function CardTable(el, doc) {
	this.el = el;
	this.doc = doc;
	this.cards = [];
	this.decks = [];
	this.cardsHeld = {};

	this.doc.on('sync', this.onSync.bind(this));

	this.decksSet = this.doc.createSet('type', 'deck');
	this.decksSet.on('add', this.onDeckRowAdded.bind(this));
	this.decksSet.on('removed', console.log.bind(console, 'removed deck'));

	this.optionsBarEl = el.querySelector('.options-bar');
	this.loaderEl = el.querySelector('.loader');
	this.cardsEl = el.querySelector('.card-table');
	el.querySelector('.add-deck').onclick = this.onClickAddDeck.bind(this);

	this.decksEl = el.querySelector('.decks');

	this.dragController = new DragController(this.cardsEl, this);
	this.keyController = new KeyController(window, this);
	this.cardsEl.oncontextmenu = this.onRightClick.bind(this);

	this.selection = new CardSelection(this, this.cardsEl);
}

CardTable.prototype.getCardAtEl = function(el) {
	for (; el && el.parentNode != this.el; el = el.parentNode) {
		if (el._card) return el._card;
	}
};

CardTable.prototype.getCardAtPoint = function(x, y) {
	var cards = this.cards.filter(function(card) {
		return x > card.x &&
			y > card.y &&
			(x <= card.x + card.deck.width) &&
			(y <= card.y + card.deck.height);
	});
	return cards.length && cards.reduce(function(a, b) {
		return a.z > b.z ? a : b;
	});
};

CardTable.prototype.addCard = function(card) {
	this.cards.push(card);
	this.cardsEl.appendChild(card.el);
};

CardTable.prototype.onDeckRowAdded = function(row) {
	var deck = new Deck(row, this);
	this.decks.push(deck);
	this.decksEl.appendChild(deck.el);
	// 'removed' doesn't seem to fire. detect removal in onChange
	//row.on('removed', this.removeDeck.bind(this, deck));
};

CardTable.prototype.onClickAddDeck = function() {
	Deck.add(this.doc, {
		x: Math.random() * 200,
		y: Math.random() * 100,
		type: 'regular',
		backColor: ['red', 'green', 'blue'][Math.floor(Math.random()*3)]
	});
};

CardTable.prototype.onRightClick = function(e) {
	e.preventDefault();
	this.selection.flip();
};

CardTable.prototype.onKeyDown = {
	SPACE: function(e) {
		e.preventDefault();
		/*
		for (var id in this.cardsHeld) {
			var card = this.cardsHeld[id];
			card.setZ(0);
		}
		*/
	},
	f: function() {
		this.selection.flip();
	}
};

CardTable.prototype.removeCard = function(card) {
	var i = this.cards.indexOf(card);
	if (i < 0) return;
	this.cards.splice(i, 1);
	this.cardsEl.removeChild(card.el);
};

CardTable.prototype.removeDeck = function(deck) {
	var i = this.decks.indexOf(deck);
	if (i < 0) return;
	this.decksEl.removeChild(deck.el);
	this.decks.splice(i, 1);
};

CardTable.prototype.dragStart = function(e) {
	e.preventDefault();
	var card = this.getCardAtEl(e.target);
	if (!card) {
		// start selection box
		if (!e.shiftKey) {
			this.selection.clear();
		}
		return this.selection.dragSelect(e);
	}
	// move selection
	if (card.selected) {
		if (e.shiftKey) {
			this.selection.deselect(card);
		}
	} else {
		this.selection.select(card);
	}
	return this.selection.dragMove(e);
};

CardTable.prototype.onSync = function() {
	// add extra delay to make sure initial updates don't get animated
	setTimeout(this.setSynced.bind(this, true), 125);
};

CardTable.prototype.setSynced = function(synced) {
	// synced = whether we think the cards are in a stable state
	this.synced = synced;
	this.el.classList.add(synced ? 'synced' : 'syncing');
	this.el.classList.remove(synced ? 'syncing' : 'synced');
};

module.exports = {
	CardTable: CardTable
};

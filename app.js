var DragController = require('./drag-controller');
var Deck = require('./deck');

function CardTable(el, doc) {
	this.el = el;
	this.doc = doc;
	this.cards = [];
	this.decks = [];

	this.decksSet = this.doc.createSet('type', 'deck');
	this.decksSet.on('add', this.onDeckRowAdded.bind(this));

	this.cardsEl = el.querySelector('.card-table');
	el.querySelector('.add-deck').onclick = this.onClickAddDeck.bind(this);

	this.dragController = new DragController(this.cardsEl, this);
	this.el.oncontextmenu = this.onRightClick.bind(this);
}

CardTable.prototype.getCardAtEl = function(el) {
	for (; el && el.parentNode != this.el; el = el.parentNode) {
		if (el._card) return el._card;
	}
};

CardTable.prototype.addCard = function(card) {
	this.cards.push(card);
	this.cardsEl.appendChild(card.el);
};

CardTable.prototype.onDeckRowAdded = function(row) {
	var deck = new Deck(row, this);
	this.decks.push(deck);
	row.on('removed', this.removeDeck.bind(this, row));
};

CardTable.prototype.onClickAddDeck = function() {
	Deck.add(this.doc, {
		x: Math.random() * 200,
		y: Math.random() * 100,
		type: 'regular',
		backColor: 'red'
	});
};

CardTable.prototype.onRightClick = function(e) {
	e.preventDefault();
	var card = this.getCardAtEl(e.target);
	if (card) {
		card.flip();
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
	this.decks.splice(i, 1);
};

CardTable.prototype.onDragStart = function(e) {
	e.preventDefault();
	var card = this.getCardAtEl(e.target);
	if (card) {
		this.dragController.setBehavior(card);
		card.onDragStart(e);
		return;
	}
};

module.exports = {
	CardTable: CardTable
};

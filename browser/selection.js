var SelectionBox = require('./selectionbox');

module.exports = CardSelection;

// get 

function CardSelection(table, el) {
	this.el = el;
	this.table = table;
	this.cards = {};
}

var S = CardSelection.prototype;

S.select = function(card) {
	this.cards[card.id] = card;
	card.select();
};

S.deselect = function(card) {
	delete this.cards[card.id];
	card.deselect();
};

S.clear = function() {
	for (var id in this.cards) {
		this.cards[id].deselect();
	}
	this.cards = {};
};

S.dragSelect = function(e) {
	// create a draggable selection box at the cursor
	var self = this;
	if (!e.shiftKey) {
		this.clear();
	}

	var alreadySelected = {};
	for (var id in this.cards) {
		alreadySelected[id] = true;
	}

	return new SelectionBox({
		container: this.el,

		add: function(el) {
			var card = el._card;
			if (!card) return;
			if (alreadySelected[card.id]) return;
			self.select(card);
		},

		remove: function(el) {
			var card = el._card;
			if (!card) return;
			if (alreadySelected[card.id]) return;
			self.deselect(el._card);
		}
	}).dragStart(e);
};

S.dragMove = function(e) {
	var self = this;
	var prevMouse = e;

	return {
		drag: function(e) {
			var dx = e.pageX - prevMouse.pageX;
			var dy = e.pageY - prevMouse.pageY;
			prevMouse = e;
			self.moveBy(dx, dy);
		},
		dragEnd: function() {
		}
	};
};

S.moveBy = function(dx, dy) {
	for (var id in this.cards) {
		this.cards[id].moveBy(dx, dy);
	}
};

S.flip = function() {
	for (var id in this.cards) {
		this.cards[id].flip();
	}
};

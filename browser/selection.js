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

S.dragStart = function(e) {
	e.preventDefault();
	var card = this.table.getCardAtEl(e.target);
	if (!card) {
		// start selection box
		if (!e.shiftKey) {
			this.clear();
		}
		return this.dragSelect(e);
	}
	// move selection
	if (card.selected) {
		if (e.shiftKey) {
			this.deselect(card);
		}
	} else {
		if (!e.shiftKey) {
			this.clear();
		}
		this.select(card);
	}
	return this.dragMove(e);
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

	this.setHeld(true);

	return {
		drag: function(e) {
			var dx = e.pageX - prevMouse.pageX;
			var dy = e.pageY - prevMouse.pageY;
			prevMouse = e;
			self.moveBy(dx, dy);
		},
		dragEnd: function() {
			self.setHeld(false);
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

S.setHeld = function(held) {
	var ids = [];
	if (held) for (var id in this.cards) {
		ids.push(id);
	}
	this.table.setMyHeldCards(ids);
};

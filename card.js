function Card(row, deck, table) {
	this.row = row;
	this.deck = deck;
	this.table = table;

	this.el = document.createElement('div');
	this.el._card = this;
	this.el.className = 'card';
	
	this.frontEl = document.createElement('div');
	this.el.appendChild(this.frontEl);
	this.frontEl.className = 'front';

	this.backEl = document.createElement('div');
	this.backEl.className = 'back';
	this.el.appendChild(this.backEl);

	row.on('change', this.onChange.bind(this));
}

Card.prototype.suits = ['spades', 'diamonds', 'hearts', 'clubs'];
Card.prototype.ranks = ['ace', 'two', 'three', 'four', 'five', 'six', 'seven',
	'eight', 'nine', 'ten', 'jack', 'queen', 'king', 'joker'];

Card.prototype.x = 10;
Card.prototype.y = 10;
Card.prototype.rank = 0;
Card.prototype.suit = 0;
Card.prototype.faceup = false;

Card.prototype.onChange = function(change) {
	if (change.rank != null) {
		this.rank = change.rank;
	}
	if (change.suit != null) {
		this.suit = change.suit;
	}
	if (change.rank != null || change.suit != null) {
		this.updateFace();
	}
	if (change.position) {
		this.setPosition(change.position);
	}
	if (change.z != null) {
		this.setZ(change.z);
	}
	if (change.faceup != null) {
		this.setFaceup(change.faceup);
	}
	if (change.held != null) {
		this.setHeld(change.held);
	}
};

Card.prototype.updateFace = function() {
	if (!this.deck) {
		console.error('Missing deck');
		return;
	}
	this.frontEl.style.backgroundPosition =
		-(this.rank * this.deck.width) + 'px ' +
		-(this.suit * this.deck.height) + 'px';
};

Card.prototype.setPosition = function(pos) {
	this.x = pos.x;
	this.y = pos.y;
	this.z = pos.z;
	var style = this.el.style;
	style.top = this.y + 'px';
	style.left = this.x + 'px';
	style.zIndex = this.z;
};

Card.prototype.setZ = function(z) {
	this.z = z;
	this.el.style.zIndex = this.z;
};

Card.prototype.setFaceup = function(faceup) {
	this.faceup = faceup;
	this.updateClassname();
	if (this.table.synced) {
		// If synced, render the animation and schedule the opacity change.
		// Change the opacity at the apex of the flip transition, so the sides
		// appear to change seamlessly.
		setTimeout(this.updateOpacity.bind(this), 125);
	} else {
		// If not synced, change opacity immediately.
		this.updateOpacity();
	}
};

Card.prototype.setHeld = function(held) {
	this.held = held;
	this.updateClassname();
};

Card.prototype.updateClassname = function() {
	this.el.className = 'card card-' + this.deck.id +
		(this.faceup ? ' faceup' : ' facedown') +
		(this.held ? ' held' : '');
};

Card.prototype.updateOpacity = function() {
	this.backEl.style.opacity = this.faceup ? 0 : 1;
};

Card.prototype.flip = function() {
	this.row.set('faceup', !this.faceup);
};

Card.prototype.toString = function() {
	return this.ranks[this.rank] + ' of ' + this.suits[this.suit];
};

Card.prototype.onDragStart = function(e) {
	e.preventDefault();
	// TODO: show who is holding the card
	this.row.set('held', true);
	this.prevMouse = e;
};

Card.prototype.onDrag = function(e) {
	if (this.prevMouse) {
		var dx = e.pageX - this.prevMouse.pageX;
		var dy = e.pageY - this.prevMouse.pageY;
		this.row.set('position', {
			x: this.x + dx,
			y: this.y + dy
		});
	}
	this.prevMouse = e;
};

Card.prototype.onDragEnd = function(e, dragController) {
	this.row.set('held', false);
	dragController.setBehavior(this.table);
};

module.exports = Card;
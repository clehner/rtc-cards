var debounce = require('debounce');

function Card(row, deck, table) {
	this.id = row.id;
	this.row = row;
	this.deck = deck;
	this.table = table;
	this.usersHeldBy = [];

	this.el = document.createElement('div');
	this.el._card = this;
	this.el.className = 'card';
	
	this.frontEl = document.createElement('div');
	this.el.appendChild(this.frontEl);
	this.frontEl.className = 'front';

	this.backEl = document.createElement('div');
	this.backEl.className = 'back';
	this.el.appendChild(this.backEl);

	row.on('update', this.onUpdate.bind(this));

	this.updatePosition = debounce(this.updatePosition, 50);
}

Card.containsPoint = function(x, y) {
	return function(card) {
		return card.containsPoint(x, y);
	};
};

Card.prototype.suits = ['spades', 'diamonds', 'hearts', 'clubs'];
Card.prototype.ranks = ['ace', 'two', 'three', 'four', 'five', 'six', 'seven',
	'eight', 'nine', 'ten', 'jack', 'queen', 'king', 'joker'];

Card.prototype.x = 10;
Card.prototype.y = 10;
Card.prototype.rank = 0;
Card.prototype.suit = 0;
Card.prototype.faceup = false;

Card.prototype.onUpdate = function(update, change) {
	// source id that made this update
	var authorId = update[2];
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
	if (change.faceup != null) {
		this.setFaceup(change.faceup);
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
	this.position = pos;
	this.x = pos.x;
	this.y = pos.y;
	this.z = pos.z;
	var style = this.el.style;
	style.top = this.y + 'px';
	style.left = this.x + 'px';
	style.zIndex = this.z;
	this.frontEl.style.zIndex = this.z;
	this.backEl.style.zIndex = this.z;
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

Card.prototype.updateClassname = function() {
	this.el.className = 'card card-' + this.deck.id +
		(this.faceup ? ' faceup' : ' facedown') +
		(this.held ? ' held' : '') +
		(this.selected ? ' selected' : '');
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

Card.prototype.moveBy = function(dx, dy) {
	var position = {
		x: Math.round(this.x + dx),
		y: Math.round(this.y + dy),
		z: this.z
	};
	this.setPosition(position);
	this.updatePosition();
};

Card.prototype.updatePosition = function() {
	this.row.set('position', this.position);
};

Card.prototype.select = function() {
	this.selected = true;
	this.updateClassname();
};

Card.prototype.deselect = function() {
	this.selected = false;
	this.updateClassname();
};

function getUserColor(user) {
	return user.getColor();
}

Card.prototype.heldBy = function(user, held) {
	var i = this.usersHeldBy.indexOf(user);
	if (held == (i == -1)) {
		if (held) this.usersHeldBy.push(user);
		else this.usersHeldBy.splice(i, 1);
	}
	this.held = this.usersHeldBy.length > 0;
	this.updateClassname();
	if (this.held) {
		// Arrange the colors of the border to show up to four users
		// holding the card.
		var users = this.usersHeldBy.slice(0, 4);
		if (users.length == 2 || users.length == 3) users[2] = users[0];
		if (users.length == 3) users[3] = users[1];

		var color = users.map(getUserColor).join(' ');
		this.el.style.borderColor = color;
	}
};

Card.prototype.containsPoint = function(x, y) {
	return x > this.x && y > this.y &&
		(x <= this.x + this.deck.width) &&
		(y <= this.y + this.deck.height);
};

module.exports = Card;

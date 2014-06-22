module.exports = SelectionBox;

function SelectionBox(opt) {
	this.el = document.createElement('div');
	this.el.className = 'selection-box';

	this.container = opt.container;
	this.add = opt.add || function() {};
	this.remove = opt.remove || function() {};
}

function elIntersects(rect, el) {
	var left = el.offsetLeft;
	var top = el.offsetTop;
	var width = el.offsetWidth;
	var height = el.offsetHeight;

	return (rect.left + rect.width) > left &&
		(rect.top + rect.height) > top &&
		rect.left < (left + width) && 
		rect.top < (top + height);
}

var S = SelectionBox.prototype;

S.dragStart = function(e) {
	this.container.appendChild(this.el);

	this.startX = e.offsetX;
	this.startY = e.offsetY;
	this.startPageX = e.pageX;
	this.startPageY = e.pageY;

	this.el.style.left = this.startX + 'px';
	this.el.style.top = this.startY + 'px';

	return this;
};

S.drag = function(e) {
	var x = this.startX + e.pageX - this.startPageX;
	var y = this.startY + e.pageY - this.startPageY;

	var rect = {
		width: Math.abs(x - this.startX),
		height: Math.abs(y - this.startY),
		left: Math.min(x, this.startX),
		top: Math.min(y, this.startY)
	};

	var s = this.el.style;
	s.left = rect.left + 'px';
	s.top = rect.top + 'px';
	s.width = rect.width + 'px';
	s.height = rect.height + 'px';

	// detect overlaps
	var els = this.container.childNodes;
	for (var i = 0; i < els.length; i++) {
		var el = els[i];
		if (el == this.el) continue;
		var intersects = elIntersects(rect, el);
		if (intersects && !el._intersects) {
			this.add(el);
		} else if (!intersects && el._intersects) {
			this.remove(el);
		}
		el._intersects = intersects;
	}
};

S.dragEnd = function() {
	this.container.removeChild(this.el);
	var els = this.container.childNodes;
	for (var i = 0; i < els.length; i++) {
		els[i]._intersects = false;
	}
};

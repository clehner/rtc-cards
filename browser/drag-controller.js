function updateListeners(prev, next, map) {
	for (var name in map) {
		var listener = map[name];
		if (next[name] && !prev[name]) {
			listener[0].addEventListener(listener[1], listener[2], false);
		} else if (prev[name] && !next[name]) {
			listener[0].removeEventListener(listener[1], listener[2], false);
		}
	}
}

function DragController(element, defaultBehavior) {
	var self = this;
	var behavior = 0;
	var which;
	var offsetX, offsetY;

	function calculateOffsets(el) {
		offsetX = offsetY = 0;
		for (; el && el != element; el = el.offsetParent) {
			offsetX += el.offsetLeft - el.scrollLeft;
			offsetY += el.offsetTop - el.scrollTop;
		}
	}

	function correctEvent(e) {
		// Add coords relative to element
		e._x = e.offsetX + offsetX;
		e._y = e.offsetY + offsetY;
	}

	function onMouseDown(e) {
		if (which && which != e.which) {
			return;
		}
		which = e.which;

		calculateOffsets(e.target);
		correctEvent(e);

		var result = behavior.dragStart(e, self);
		if (result) setBehavior(result);
	}

	function onMouseMove(e) {
		correctEvent(e);
		var result = behavior.drag(e, self);
		if (result) setBehavior(result);
	}

	function onMouseUp(e) {
		if (e.which != which) return;
		which = 0;
		correctEvent(e);
		var result = behavior.dragEnd(e, self);
		setBehavior(result || defaultBehavior);
	}

	function setBehavior(newBehavior) {
		updateListeners(behavior, newBehavior, {
			dragStart: [element, 'mousedown', onMouseDown],
			drag: [document, 'mousemove', onMouseMove],
			dragEnd: [document, 'mouseup', onMouseUp]
		});
		behavior = newBehavior;
	}

	this.setBehavior = setBehavior;
	setBehavior(defaultBehavior);
}

module.exports = DragController;

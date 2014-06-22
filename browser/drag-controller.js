
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

/*

function DragController(element, options) {
	if (!element) return null;
	if (!options) options = 0;
	var self = this;
	var onDragStart = options.onDragStart;
	var onDrag = options.onDrag;
	var onDragEnd = options.onDragEnd;
	var context = options;
	if (options.onActivate) options.onActivate();
	var which;

	var offsetX, offsetY;
	function calculateOffsets(el) {
		var x = 0, y = 0;
		for (; el && el != element; el = el.offsetParent) {
			x += el.offsetLeft - el.scrollLeft;
			y += el.offsetTop - el.scrollTop;
		}
		offsetX = x;
		offsetY = y;
	}

	// Add coords relative to element
	function correctEvent(e) {
		e._x = e.offsetX + offsetX;
		e._y = e.offsetY + offsetY;
	}

	function onMouseMove(e) {
		correctEvent(e);
		if (onDrag) onDrag.call(context, e, self);
	}

	function onMouseUp(e) {
		if (e.which != which) return;
		which = 0;
		document.removeEventListener("mouseup", onMouseUp, false);
		document.removeEventListener("mousemove", onMouseMove, true);
		correctEvent(e);
		if (onDragEnd) onDragEnd.call(context, e, self);
	}

	function onTouchEnd(e) {
		if (e.touches.length > 0) return;
		document.removeEventListener("touchend", onTouchEnd, false);
		document.removeEventListener("touchcancel", onTouchEnd, false);
		document.removeEventListener("touchmove", onMouseMove, true);
		//e._x = lastX;
		//e._y = lastY;
		if (onDragEnd) onDragEnd.call(context, e, self);
	}

	this.setTempBehavior = function (opt) {
	};
}

module.exports = DragController;

function DragController(el, handler, context) {

	function onMouseDown(e) {
		if (which && which != e.which) {
			return;
		}
		which = e.which;

		if (!onDragStart) return;
		calculateOffsets(e.target);
		correctEvent(e);
		var behavior = onDragStart.call(context, e, self);
		if (!behavior) return;

		if (e.touches) {
			e.preventDefault();
			document.addEventListener("touchmove", onMouseMove, true);
			document.addEventListener("touchend", onTouchEnd, false);
			document.addEventListener("touchcancel", onTouchEnd, false);
		} else {
			document.addEventListener("mousemove", onMouseMove, true);
			document.addEventListener("mouseup", onMouseUp, false);
		}
	}

	el.addEventListener("touchstart", onMouseDown, false);
	el.addEventListener("mousedown", onMouseDown, false);
}
*/

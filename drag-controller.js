/*
function calculateOffsets() {
	var x = 0, y = 0;
	for (var el = element; el; el = el.offsetParent) {
		x += el.offsetLeft - el.scrollLeft;
		y += el.offsetTop - el.scrollTop;
	}
	offsetX = x;
	offsetY = y;
}

function DragController(el) {
	this.el = el;
}
DragController.prototype.mousedown = function(e) {
};
DragController.prototype.setBehavior = function(behavior, context) {
	// unbind event listeners if needed
	if (this.behavior && this.behavior.onDragStart) {
		if (!behavior || !behavior.onDragStart) {
			this.el.removeEventListener('mousedown', this.onMouseDown, false);
		}
		if (!behavior || this.behavior.onDrag && !behavior.onDrag) {
			this.el.removeEventListener('mousedown', this.onMouseDown, false);
		}
	}
	if (this.behavior && this.behavior.onDragStart && !behavior.) {
	}
	this.behavior = behavior;
	this.context = context;
};
*/

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

	var lastX, lastY;
	var offsetX, offsetY;
	function calculateOffsets() {
		var x = 0, y = 0;
		for (var el = element; el; el = el.offsetParent) {
			x += el.offsetLeft - el.scrollLeft;
			y += el.offsetTop - el.scrollTop;
		}
		offsetX = x;
		offsetY = y;
	}

	// Add coords relative to element
	function correctEvent(e) {
		lastX = e._x = e.pageX - offsetX;
		lastY = e._y = e.pageY - offsetY;
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
		e._x = lastX;
		e._y = lastY;
		if (onDragEnd) onDragEnd.call(context, e, self);
	}

	function onMouseDown(e) {
		if (which && which != e.which) {
			return;
		}
		which = e.which;
		if (e.touches) {
			e.preventDefault();
			document.addEventListener("touchmove", onMouseMove, true);
			document.addEventListener("touchend", onTouchEnd, false);
			document.addEventListener("touchcancel", onTouchEnd, false);
		} else {
			document.addEventListener("mousemove", onMouseMove, true);
			document.addEventListener("mouseup", onMouseUp, false);
		}

		calculateOffsets();
		correctEvent(e);
		if (onDragStart) onDragStart.call(context, e, self);
	}
	element.addEventListener("touchstart", onMouseDown, false);
	element.addEventListener("mousedown", onMouseDown, false);

	this.setBehavior = function (opt) {
		onDragStart = opt.onDragStart;
		onDrag = opt.onDrag;
		onDragEnd = opt.onDragEnd;
		context = opt;
		if (opt.onActivate) opt.onActivate();
	};
}

module.exports = DragController;

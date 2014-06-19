function KeyController(el, behavior) {

    function getKeyName(e) {
        return KeyController.keycodes[e.keyCode] ||
            String.fromCharCode(e.keyCode);
    }

    function onKeyDown(e) {
        var key = getKeyName(e);
        if (behavior && behavior.onKeyDown) {
            var handler = behavior.onKeyDown[key];
            if (handler) handler.call(behavior, e);
        }
    }

    function onKeyUp(e) {
        var key = getKeyName(e);
        if (behavior && behavior.onKeyUp) {
            var handler = behavior.onKeyUp[key];
            if (handler) handler.call(behavior, e);
        }
    }

    this.setBehavior = function(beh) {
        behavior = beh;
    };

    this.activate = function() {
        el.addEventListener('keydown', onKeyDown, false);
        el.addEventListener('keyup', onKeyUp, false);
    };

    this.deactivate = function() {
        el.removeEventListener('keydown', onKeyDown, false);
        el.removeEventListener('keyup', onKeyUp, false);
    };

    this.activate();
}

KeyController.keycodes = {
    32: 'SPACE',
    27: 'ESCAPE',
    13: 'ENTER',
    38: 'ARROW_UP',
    40: 'ARROW_DOWN',
    9: 'TAB'
};

module.exports = KeyController;

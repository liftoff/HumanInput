/*
NOTE: Using _HI instead of just 'HI' throughout tests so we don't inadvertently
reference window.HI which is a common mistake I've made in the past in various
plugins (e.g. using "HI.whatever" instead of "this.HI.whatever").
*/

chai.should();

function keyEvent(key, type) {
    // Returns a new object for use in creating a KeyboardEvent for the given *key* and *type*.  The 'target' (and similar) properties will always be 'window'.
    // NOTE:  Only works with basic letters like 'a', 'b', or 'c'
    var baseEvent = {
        altKey: false,
        bubbles: true,
        cancelBubble: false,
        cancelable: true,
        charCode: 0,
//         code: "KeyA",
        ctrlKey: false,
        currentTarget: window,
        defaultPrevented: false,
        detail: 0,
        eventPhase: 0,
//         key: "a",
//         keyCode: 65,
        location: 0,
        metaKey: false,
        repeat: false,
        returnValue: true,
        scoped: false,
        shiftKey: false,
        srcElement: window,
        target: window
//         which: 65
    };
    baseEvent.key = key;
    baseEvent.code = 'Key' + key.toUpperCase();
    var newEvent = new KeyboardEvent(type, baseEvent);
    // For some reason Webkit-based browsers don't let you set the keyCode/which ahead of time so we have to do this:
    delete newEvent.keyCode;
    delete newEvent.which;
    var keyCode = key.charCodeAt(0) - 32; // This only works for ASCII letters
    Object.defineProperty(newEvent, "keyCode", {"value" : keyCode});
    Object.defineProperty(newEvent, "which", {"value" : keyCode})
    return newEvent;
}

describe('HumanInput Keyboard Event Tests', function () {
    var HumanInput

    before(function () {
        HumanInput = window.HumanInput;
    });

    it('Keyboard Key Events', function () {
        var keydownEvent = {}, keydownEvent2 = {}, keyupEvent = {}, keyupEvent2 = {}, normalEvent = {};
        var settings = {logLevel: 'DEBUG'};
        var _HI = new HumanInput(window, settings);

        // Setup our HumanInput event callbacks
        _HI.once('keydown', function(key, code) { keydownEvent.HIEvent = this.HIEvent; keydownEvent.key = key; keydownEvent.code = code; });
        _HI.once('keydown:z', function(key, code) { keydownEvent2.HIEvent = this.HIEvent; keydownEvent2.key = key; keydownEvent2.code = code; });
        _HI.once('z', function(key, code) { normalEvent.HIEvent = this.HIEvent; normalEvent.key = key; normalEvent.code = code; });
        _HI.once('keyup', function(key, code) { keyupEvent.HIEvent = this.HIEvent; keyupEvent.key = key; keyupEvent.code = code; });
        _HI.once('keyup:z', function(key, code) { keyupEvent2.HIEvent = this.HIEvent; keyupEvent2.key = key; keyupEvent2.code = code; });
        window.dispatchEvent(keyEvent('z', 'keydown'));
        window.dispatchEvent(keyEvent('z', 'keyup'));
        keydownEvent.HIEvent.should.equal('keydown');
        keydownEvent2.HIEvent.should.equal('keydown:z');
        normalEvent.HIEvent.should.equal('z');
        keyupEvent.HIEvent.should.equal('keyup');
        keyupEvent2.HIEvent.should.equal('keyup:z');
    });

    it('Keyboard Combo Events', function () {
        var normalEvent = {};
        var settings = {logLevel: 'DEBUG'};
        var _HI = new HumanInput(window, settings);

        // Setup our HumanInput event callbacks
        _HI.once('a-z', function(key, code) { normalEvent.HIEvent = this.HIEvent; normalEvent.key = key; normalEvent.code = code; });
        window.dispatchEvent(keyEvent('z', 'keydown'));
        window.dispatchEvent(keyEvent('z', 'keyup'));
        keydownEvent.HIEvent.should.equal('keydown');
        keydownEvent2.HIEvent.should.equal('keydown:z');
        normalEvent.HIEvent.should.equal('z');
        keyupEvent.HIEvent.should.equal('keyup');
        keyupEvent2.HIEvent.should.equal('keyup:z');
    });

});

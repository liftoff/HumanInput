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

describe('HumanInput Sequence Event Tests', function () {
    var HumanInput

    before(function () {
        HumanInput = window.HumanInput;
    });

    it('Basic Sequences', function () {
        var seqEvent, seqEvent2;
        var settings = {logLevel: 'DEBUG'};
        var _HI = new HumanInput(window, settings);

        // Setup our HumanInput event callbacks
        _HI.once('a b c', function() { seqEvent = this.HIEvent; });
        window.dispatchEvent(keyEvent('a', 'keydown'));
        window.dispatchEvent(keyEvent('a', 'keyup'));
        window.dispatchEvent(keyEvent('b', 'keydown'));
        window.dispatchEvent(keyEvent('b', 'keyup'));
        window.dispatchEvent(keyEvent('c', 'keydown'));
        window.dispatchEvent(keyEvent('c', 'keyup'));
        seqEvent.should.equal('a b c');
        seqEvent = null;
        // Now test that all possible combinations of sequences will be fired
        _HI.once('b c d', function() { seqEvent = this.HIEvent; });
        // NOTE: We generate 'a b c d' below but 'b c d' must also fire since it's one of the possible sequences inside the longer one
        window.dispatchEvent(keyEvent('a', 'keydown'));
        window.dispatchEvent(keyEvent('a', 'keyup'));
        window.dispatchEvent(keyEvent('b', 'keydown'));
        window.dispatchEvent(keyEvent('b', 'keyup'));
        window.dispatchEvent(keyEvent('c', 'keydown'));
        window.dispatchEvent(keyEvent('c', 'keyup'));
        window.dispatchEvent(keyEvent('d', 'keydown'));
        window.dispatchEvent(keyEvent('d', 'keyup'));
        seqEvent.should.equal('b c d');
    });

    it('Advanced Sequences', function () {
        var seqEvent, seqEvent2;
        var settings = {logLevel: 'DEBUG'};
        var _HI = new HumanInput(window, settings);

        // After firing a lot of events the buffer should hit its max; allowing this sequence to work:
        _HI.once('d e f g h i', function() { seqEvent = this.HIEvent; });
        window.dispatchEvent(keyEvent('a', 'keydown'));
        window.dispatchEvent(keyEvent('a', 'keyup'));
        window.dispatchEvent(keyEvent('b', 'keydown'));
        window.dispatchEvent(keyEvent('b', 'keyup'));
        window.dispatchEvent(keyEvent('c', 'keydown'));
        window.dispatchEvent(keyEvent('c', 'keyup'));
        window.dispatchEvent(keyEvent('d', 'keydown'));
        window.dispatchEvent(keyEvent('d', 'keyup'));
        window.dispatchEvent(keyEvent('e', 'keydown'));
        window.dispatchEvent(keyEvent('e', 'keyup'));
        window.dispatchEvent(keyEvent('f', 'keydown'));
        window.dispatchEvent(keyEvent('f', 'keyup'));
        window.dispatchEvent(keyEvent('g', 'keydown'));
        window.dispatchEvent(keyEvent('g', 'keyup'));
        window.dispatchEvent(keyEvent('h', 'keydown'));
        window.dispatchEvent(keyEvent('h', 'keyup'));
        window.dispatchEvent(keyEvent('i', 'keydown'));
        window.dispatchEvent(keyEvent('i', 'keyup'));
        seqEvent.should.equal('d e f g h i');
    });

});

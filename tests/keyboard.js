/*
NOTE: Using _HI instead of just 'HI' throughout tests so we don't inadvertently
reference window.HI which is a common mistake I've made in the past in various
plugins (e.g. using "HI.whatever" instead of "this.HI.whatever").
*/

chai.should();

// NOTE: keyEvent() is imported to the index.html test page via utils.js

describe('Keyboard: A HumanInput instance', function () {
    var HumanInput = window.HumanInput;
    let _HI;

    beforeEach(function () {
        var settings = {logLevel: 'DEBUG'};
        _HI = new HumanInput(window, settings);
        _HI.init();
    });

    it('should work with keydown, keyup, and assumed (<key>) events', function () {
        var keydownEvent = {}, keydownEvent2 = {}, keyupEvent = {}, keyupEvent2 = {}, normalEvent = {};

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

    it('should work with combo and ordered-combo events', function () {
        var normalCombo, orderedCombo;

        _HI.once('a-z', function() { normalCombo = this.HIEvent; });
        _HI.once('z->a', function() { orderedCombo = this.HIEvent; });
        window.dispatchEvent(keyEvent('z', 'keydown'));
        window.dispatchEvent(keyEvent('a', 'keydown'));
        window.dispatchEvent(keyEvent('a', 'keyup'));
        window.dispatchEvent(keyEvent('z', 'keyup'));
        normalCombo.should.equal('a-z');
        orderedCombo.should.equal('z->a');
    });

    it('should work with edge case characters (e.g. colon and space)', function () {
        var colon, space, bang;

        _HI.once(':', function() { colon = this.HIEvent; });
        _HI.once('space', function() { space = this.HIEvent; });
        _HI.once('!', function() { bang = this.HIEvent; });
        window.dispatchEvent(keyEvent(':', 'keydown'));
        window.dispatchEvent(keyEvent(':', 'keyup'));
        window.dispatchEvent(keyEvent('space', 'keydown'));
        window.dispatchEvent(keyEvent('space', 'keyup'));
        window.dispatchEvent(keyEvent('!', 'keydown'));
        window.dispatchEvent(keyEvent('!', 'keyup'));
        colon.should.equal(':');
        space.should.equal('space');
        bang.should.equal('!');
    });

});

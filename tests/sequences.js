/*
NOTE: Using _HI instead of just 'HI' throughout tests so we don't inadvertently
reference window.HI which is a common mistake I've made in the past in various
plugins (e.g. using "HI.whatever" instead of "this.HI.whatever").
*/

chai.should();

describe('Sequences: A HumanInput instance', function () {
    var HumanInput

    before(function () {
        HumanInput = window.HumanInput;
    });

    it('should work with basic sequences', function () {
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

    it('should work with advanced sequences', function () {
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

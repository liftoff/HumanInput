/*
NOTE: Using _HI instead of just 'HI' throughout tests so we don't inadvertently
reference window.HI which is a common mistake I've made in the past in various
plugins (e.g. using "HI.whatever" instead of "this.HI.whatever").
*/

chai.should();

var mouseEventObj = {
    bubbles: true, cancelable: true, clientX: 250, clientY: 250, isPrimary: true,
    layerX: 250, layerY: 250, offsetX: 250, offsetY: 250, pageX: 250, pageY: 250,
    pointerId: 1, pressure: 0,
    relatedTarget: window, // Not sure if this one is a good idea
    screenX: 250, screenY: 250, target: window,
    // Might as well support these (future proofing):
    tiltX: 0, tiltY: 0,
    view: window, x: 250, y: 250
};

describe('Hold: A HumanInput instance', function () {
    var HumanInput = window.HumanInput;
    let _HI;

    beforeEach(function () {
        var settings = {logLevel: 'DEBUG', holdInterval: 250};
        _HI = new HumanInput(window, settings);
        _HI.init();
    });

    describe('should trigger specific hold:<time>:<event> events when', function() {

        it('the pointer is down for 500ms', function(done) {
            var result,
                browserEvent = new MouseEvent('mousedown', mouseEventObj);
            _HI.once('hold:500:pointer:left', function() { done(); });
            window.dispatchEvent(browserEvent);
            setTimeout(function() {
                browserEvent = new MouseEvent('mouseup', mouseEventObj);
                window.dispatchEvent(browserEvent);
            }, 1500);
        });

        it('a key is down for 500ms', function(done) {
            var result,
                browserEvent = new MouseEvent('mousedown', mouseEventObj);
            _HI.once('hold:500:z', function() { done(); });
            window.dispatchEvent(keyEvent('z', 'keydown'));
            setTimeout(function() {
                window.dispatchEvent(keyEvent('z', 'keyup'));
            }, 1500);
        });

    });

});

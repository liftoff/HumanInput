/* global describe, it, before, expect */
// require('./setup');

chai.should();

var mouseEventDict = {
    bubbles: true,
    cancelable: true,
    clientX: 10,
    clientY: 10,
    isPrimary: true,
    layerX: 10,
    layerY: 10,
    offsetX: 10,
    offsetY: 10,
    pageX: 10,
    pageY: 10,
    pointerId: 1,
    pressure: 0,
    relatedTarget: window, // Not sure if this one is a good idea
    screenX: 10,
    screenY: 10,
    target: window,
    // Might as well support these (future proofing):
    tiltX: 0,
    tiltY: 0,
    view: window,
    x: 10,
    y: 10
};

describe('HumanInput tests', function () {
    var HumanInput

    before(function () {
        HumanInput = window.HumanInput;
    })

    it('works', function () {
        var browserEvent;
        var downVar = false, upVar = false;
        var settings = {logLevel: 'DEBUG'};
        var HI = new HumanInput(window, settings);
        console.log('HI.settings.listenEvents:', HI.settings.listenEvents);
        // Setup our HumanInput event callbacks
        HI.on('pointer:left:down', function() { downVar = true; });
        HI.on('pointer:left:up', function() { upVar = true; });
        browserEvent = new MouseEvent('mousedown', mouseEventDict);
        window.dispatchEvent(browserEvent);
        chai.assert.isTrue(downVar);
        var browserEvent = new MouseEvent('mouseup', mouseEventDict);
        window.dispatchEvent(browserEvent);
        chai.assert.isTrue(upVar);
    })
});

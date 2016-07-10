/* global describe, it, before, expect */
// require('./setup');

chai.should();

var mouseEventDict = {
    bubbles: true,
    cancelable: true,
    clientX: 250,
    clientY: 250,
    isPrimary: true,
    layerX: 250,
    layerY: 250,
    offsetX: 250,
    offsetY: 250,
    pageX: 250,
    pageY: 250,
    pointerId: 1,
    pressure: 0,
    relatedTarget: window, // Not sure if this one is a good idea
    screenX: 250,
    screenY: 250,
    target: window,
    // Might as well support these (future proofing):
    tiltX: 0,
    tiltY: 0,
    view: window,
    x: 250,
    y: 250
};

describe('HumanInput Pointer Tests', function () {
    var HumanInput

    before(function () {
        HumanInput = window.HumanInput;
    });

    it('Basic Pointer Events (Up/Down)', function () {
        var browserEvent, downVar, pVar, upVar;
        var settings = {logLevel: 'DEBUG'};
        var HI = new HumanInput(window, settings);

        // Setup our HumanInput event callbacks
        HI.on('pointer:left:down', function() { downVar = this.HIEvent; });
        HI.on('pointer:left', function() { pVar = this.HIEvent; });
        HI.on('pointer:left:up', function() { upVar = this.HIEvent; });
        browserEvent = new MouseEvent('mousedown', mouseEventDict);
        window.dispatchEvent(browserEvent);
        downVar.should.equal('pointer:left:down');
        browserEvent = new MouseEvent('mouseup', mouseEventDict);
        window.dispatchEvent(browserEvent);
        upVar.should.equal('pointer:left:up');
        pVar.should.equal('pointer:left');
    });
    it('Swipe Events', function () {
        var browserEvent, left, right, up, down;
        var settings = {logLevel: 'DEBUG'};
        var HI = new HumanInput(window, settings);

        // Setup our HumanInput event callbacks
        HI.on('swipe:left', function() { left = this.HIEvent; });
        HI.on('swipe:right', function() { right = this.HIEvent; });
        HI.on('swipe:up', function() { up = this.HIEvent; });
        HI.on('swipe:down', function() { down = this.HIEvent; });
        browserEvent = new MouseEvent('mousedown', mouseEventDict);
        window.dispatchEvent(browserEvent);
        mouseEventDict.clientX -= 100;
        browserEvent = new MouseEvent('mouseup', mouseEventDict);
        window.dispatchEvent(browserEvent);
        left.should.equal('swipe:left');
        browserEvent = new MouseEvent('mousedown', mouseEventDict);
        window.dispatchEvent(browserEvent);
        mouseEventDict.clientX += 100;
        browserEvent = new MouseEvent('mouseup', mouseEventDict);
        window.dispatchEvent(browserEvent);
        right.should.equal('swipe:right');
        browserEvent = new MouseEvent('mousedown', mouseEventDict);
        window.dispatchEvent(browserEvent);
        mouseEventDict.clientY -= 100;
        browserEvent = new MouseEvent('mouseup', mouseEventDict);
        window.dispatchEvent(browserEvent);
        up.should.equal('swipe:up');
        browserEvent = new MouseEvent('mousedown', mouseEventDict);
        window.dispatchEvent(browserEvent);
        mouseEventDict.clientY += 100;
        browserEvent = new MouseEvent('mouseup', mouseEventDict);
        window.dispatchEvent(browserEvent);
        down.should.equal('swipe:down');
    });
    it('Pan Events', function () {
        var browserEvent, pan, panTestObj;
        var settings = {logLevel: 'DEBUG'};
        var HI = new HumanInput(window, settings);

        // Setup our HumanInput event callbacks
        HI.on('pan', function(e, panObj) { pan = this.HIEvent; panTestObj = panObj; });
        browserEvent = new MouseEvent('mousedown', mouseEventDict);
        window.dispatchEvent(browserEvent);
        for (var i=0; i < 100; i++) {
            mouseEventDict.clientX += 1;
            mouseEventDict.clientY += 1;
            browserEvent = new MouseEvent('mousemove', mouseEventDict);
            window.dispatchEvent(browserEvent);
        }
        browserEvent = new MouseEvent('mouseup', mouseEventDict);
        window.dispatchEvent(browserEvent);
        // xMoved and yMoved should be 1 for each call of the event but x and y should increment each time
        panTestObj.xMoved.should.equal(1);
        panTestObj.xOrig.should.equal(250);
        panTestObj.xPrev.should.equal(349);
        panTestObj.x.should.equal(350);
        panTestObj.yMoved.should.equal(1);
        panTestObj.yOrig.should.equal(250);
        panTestObj.yPrev.should.equal(349);
        panTestObj.y.should.equal(350);
    });
});

// Temp notes
// foo.should.be.a('string');
// foo.should.equal('bar');
// foo.should.have.length(3);

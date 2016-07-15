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
var wheelEvent = {
    bubbles: true, button: 0, buttons: 0, cancelBubble: false, cancelable: true,
    clientX: 503, clientY: 379, currentTarget: null, deltaMode: 0, deltaX: -0,
    deltaY: -53, deltaZ: 0, detail: 0, eventPhase: 0, fromElement: null,
    layerX: 503, layerY: 379, movementX: 0, movementY: 0, offsetX: 503,
    offsetY: 379, pageX: 503, pageY: 379, region: null, relatedTarget: null,
    relatedTargetScoped: false, returnValue: true, scoped: false, screenX: 503,
    screenY: 476, srcElement: window, target: window, toElement: window,
    type: "wheel", view: Window, wheelDelta: 120, wheelDeltaX: 0,
    wheelDeltaY: 120, which: 1, x: 503, y: 379,
}

describe('Pointer: A HumanInput instance', function () {
    var HumanInput

    before(function () {
        HumanInput = window.HumanInput;
    });

    it('should work with basic pointer events (up/down)', function () {
        var browserEvent, downVar, pVar, upVar;
        var settings = {logLevel: 'DEBUG'};
        var _HI = new HumanInput(window, settings);

        // Setup our HumanInput event callbacks
        _HI.on('pointer:left:down', function() { downVar = this.HIEvent; });
        _HI.on('pointer:left', function() { pVar = this.HIEvent; });
        _HI.on('pointer:left:up', function() { upVar = this.HIEvent; });
        browserEvent = new MouseEvent('mousedown', mouseEventObj);
        window.dispatchEvent(browserEvent);
        downVar.should.equal('pointer:left:down');
        // Make sure we're tracking state properly as well:
        _HI.state.down.should.contain('pointer:left');
        browserEvent = new MouseEvent('mouseup', mouseEventObj);
        window.dispatchEvent(browserEvent);
        upVar.should.equal('pointer:left:up');
        pVar.should.equal('pointer:left');
    });

    it('should work with swipe events', function () {
        var browserEvent, left, right, up, down;
        var settings = {logLevel: 'DEBUG'};
        var _HI = new HumanInput(window, settings);

        // Setup our HumanInput event callbacks
        _HI.on('swipe:left', function() { left = this.HIEvent; });
        _HI.on('swipe:right', function() { right = this.HIEvent; });
        _HI.on('swipe:up', function() { up = this.HIEvent; });
        _HI.on('swipe:down', function() { down = this.HIEvent; });
        browserEvent = new MouseEvent('mousedown', mouseEventObj);
        window.dispatchEvent(browserEvent);
        mouseEventObj.clientX -= 100;
        browserEvent = new MouseEvent('mouseup', mouseEventObj);
        window.dispatchEvent(browserEvent);
        left.should.equal('swipe:left');
        browserEvent = new MouseEvent('mousedown', mouseEventObj);
        window.dispatchEvent(browserEvent);
        mouseEventObj.clientX += 100;
        browserEvent = new MouseEvent('mouseup', mouseEventObj);
        window.dispatchEvent(browserEvent);
        right.should.equal('swipe:right');
        browserEvent = new MouseEvent('mousedown', mouseEventObj);
        window.dispatchEvent(browserEvent);
        mouseEventObj.clientY -= 100;
        browserEvent = new MouseEvent('mouseup', mouseEventObj);
        window.dispatchEvent(browserEvent);
        up.should.equal('swipe:up');
        browserEvent = new MouseEvent('mousedown', mouseEventObj);
        window.dispatchEvent(browserEvent);
        mouseEventObj.clientY += 100;
        browserEvent = new MouseEvent('mouseup', mouseEventObj);
        window.dispatchEvent(browserEvent);
        down.should.equal('swipe:down');
    });

    it('should work with pan events', function () {
        var browserEvent, pan, panTestObj;
        var settings = {logLevel: 'DEBUG'};
        var _HI = new HumanInput(window, settings);

        // Setup our HumanInput event callbacks
        _HI.on('pan', function(e, panObj) { pan = this.HIEvent; panTestObj = panObj; });
        browserEvent = new MouseEvent('mousedown', mouseEventObj);
        window.dispatchEvent(browserEvent);
        for (var i=0; i < 100; i++) {
            mouseEventObj.clientX += 1;
            mouseEventObj.clientY += 1;
            browserEvent = new MouseEvent('mousemove', mouseEventObj);
            window.dispatchEvent(browserEvent);
        }
        // Check state before mouseup
        _HI.state.down.should.contain('pointer:left');
        // NOTE: 'pan' is really just a pointerdown/mousedown/touchstart event where the user happens to move it around =)
        browserEvent = new MouseEvent('mouseup', mouseEventObj);
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
        // Double-check that the state accurately reflects that nothing is down at the moment
        _HI.state.down.should.not.contain('pointer:left');
    });
    it('should handle the dragend edge case', function () {
        var browserEvent, up;
        var settings = {logLevel: 'DEBUG'};
        var _HI = new HumanInput(window, settings);

        // This tests if the dragend event works as a surrogate for mouseup (because mouseup never fires when dragging things)
        _HI.on('pointer:left:up', function() { up = this.HIEvent; });
        browserEvent = new MouseEvent('mousedown', mouseEventObj);
        window.dispatchEvent(browserEvent);
        mouseEventObj.clientX -= 100;
        // Check state before dragend (which should simulate pointerup/mouseup)
        _HI.state.down.should.contain('pointer:left');
        browserEvent = new DragEvent('dragend', mouseEventObj); // Mouse type should work OK for this
        window.dispatchEvent(browserEvent);
        up.should.equal('pointer:left:up');
        // Check state before dragend (which should simulate pointerup/mouseup)
        _HI.state.down.should.not.contain('pointer:left');
    });

    it('should work with click events', function () {
        var browserEvent, click = '', dblclick = '', tripleclick = '';
        var settings = {logLevel: 'DEBUG'};
        var _HI = new HumanInput(window, settings);

        _HI.on('click', function() { click = this.HIEvent; });
        _HI.on('dblclick', function() { dblclick = this.HIEvent; });
        _HI.on('tripleclick', function() { tripleclick = this.HIEvent; });
        // For some reason dblclick and tripleclick events don't seem to work (they don't dispatch)
        mouseEventObj.detail = 1; // One click
        browserEvent = new MouseEvent('click', mouseEventObj);
        window.dispatchEvent(browserEvent);
        mouseEventObj.detail = 2; //   Two click
        browserEvent = new MouseEvent('click', mouseEventObj);
        window.dispatchEvent(browserEvent);
        mouseEventObj.detail = 3; //     Three click
        browserEvent = new MouseEvent('click', mouseEventObj);
        window.dispatchEvent(browserEvent);
                                   //       Four!
                                   //         Click 'till you can't
                                   //           click anymore!
        click.should.equal('click');
        dblclick.should.equal('dblclick');
        tripleclick.should.equal('tripleclick');
    });
});

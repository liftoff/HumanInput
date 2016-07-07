

import { handlePreventDefault, addListeners, removeListeners } from './utils';
import HumanInput from './humaninput';

var pointerEvents = ['pan', 'pointerdown', 'pointerup', 'pointercancel', 'wheel']; // Better than mouse/touch!
var mouseTouchEvents = ['pan', 'mousedown', 'mouseup', 'touchstart', 'touchend', 'touchcancel', 'wheel'];
var POINTERSUPPORT = false; // If the browser supports Pointer events
var motionEvents = ['pointermove'];
var noMouseEvents; // Minor state tracking

// Setup our default listenEvents
if (POINTERSUPPORT) { // If we have Pointer Events we don't need mouse/touch
    HumanInput.defaultListenEvents = HumanInput.defaultListenEvents.concat(pointerEvents);
} else {
    HumanInput.defaultListenEvents = HumanInput.defaultListenEvents.concat(mouseTouchEvents);
    motionEvents = ['mousemove', 'touchmove'];
}

export class PointerPlugin {

    constructor(HI) { // HI == current instance of HumanInput
        var self = this;
        self.HI = HI;
        // These functions need to be bound to the HumanInput instance to work properly
        ['_click', '_dragendPointerup', '_pointerdown', '_pointerup',
         '_pointercancel', '_pointerMoveCheck', '_trackMotion', '_wheel'
        ].forEach(function(event) {
            HI[event] = self[event].bind(HI);
        });
        HI.on('hold', function(event) {
            if (event.includes('pointer:')) {
                // Pointer events are special in that we don't want to trigger 'hold' if the pointer moves
                removeListeners(window, motionEvents, HI._pointerMoveCheck, true);
                // Unfortunately the only way to figure out the current pointer position is to use the mousemove/touchmove/pointermove events:
                addListeners(window, motionEvents, HI._pointerMoveCheck, true);
                // NOTE: We'll remove the 'mousemove' event listener when the 'hold' events are finished
            }
        });
        HI._mousedown = HI._pointerdown;
        HI._touchstart = HI._pointerdown;
        HI._mouseup = HI._pointerup;
        HI._touchend = HI._pointerup;
        HI._touchcancel = HI._pointercancel;
        HI._tap = HI._click;
        HI.on('hi:resetstates', self._resetStates, HI);
        HI.on('hi:removedown', function(e) {
            removeListeners(window, motionEvents, HI._pointerMoveCheck, true);
        });
        HI.on('hold', self._holdCheck, HI);
    }

    init(HI) {
        var self = this;
        var state = HI.state;
        state.multitap = 0;      // Tracks multitouch taps
        state.pointerCount = 0;  // Tracks how many pointers/touches are currently active
        state.pointers = {};     // Tracks pointer/touch events
        state.scrollX = 0;       // Tracks the distance scrolled in 'scroll' events
        state.scrollY = 0;       // Ditto
        removeListeners(window, motionEvents, HI._pointerMoveCheck, true);
        removeListeners(HI.elem, motionEvents, HI._trackMotion, true);
        // Exports (these will be applied to the current instance of HumanInput)
        self.exports = {
            mouse: self.mouse
        };
        return self;
    }

    _resetStates() {
        removeListeners(window, motionEvents, HI._pointerMoveCheck, true);
        removeListeners(HI.elem, motionEvents, HI._trackMotion, true);
        this.state.pointers = {};
        this.state.pointerCount = 0;
    }

    _holdCheck(event) {
        if (event.includes('pointer:')) {
            // Pointer events are special in that we don't want to trigger 'hold' if the pointer moves
            removeListeners(window, motionEvents, this._pointerMoveCheck, true);
            // Unfortunately the only way to figure out the current pointer position is to use the mousemove/touchmove/pointermove events:
            addListeners(window, motionEvents, this._pointerMoveCheck, true);
            // NOTE: We'll remove the 'mousemove' event listener when the 'hold' events are finished
        }
    }

    _pointerMoveCheck(e) {
        // This function gets attached to the 'mousemove' event and is used by self._holdCounter to figure out if the mouse moved and if so stop considering it a 'hold' event.
        var x, y, id, pointer,
            self = this,
            moveThreshold = self.settings.moveThreshold,
            pointers = self.state.pointers,
            touches = e.touches,
            ptype = e.pointerType;
        if (ptype || e.type == 'mousemove') { // PointerEvent or MouseEvent
            id = e.pointerId || 1;
        } else if (touches && touches.length) { // TouchEvent
            for (i=0; i < touches.length; i++) {
                id = touches[i].identifier;
            }
        }
        pointer = pointers[id];
        if (pointer) {
            x = e.clientX || pointer.event.clientX;
            y = e.clientY || pointer.event.clientY;
            if (x && y) {
                if (Math.abs(pointer.x-x) > moveThreshold || Math.abs(pointer.y-y) > moveThreshold) {
                    clearTimeout(self.state.holdTimeout);
                    removeListeners(window, motionEvents, self._pointerMoveCheck, true);
                }
            }
        }
    }

    _trackMotion(e) {
        // Gets attached to the 'touchmove' or 'pointermove' event if one or more fingers are down in order to track the movements (if 'pan' is in listenEvents).
        var id, pointer,
            self = this,
            results = [],
            event = 'pan', // Single finger version
            panObj = {},
            pointers = self.state.pointers,
            touches = e.touches,
            ptype = e.pointerType;
        // This keeps track of our pointer/touch state in self.state.pointers:
        if (ptype || e.type == 'mousemove') { // PointerEvent or MouseEvent
            id = e.pointerId || 1; // MouseEvent is always 0
            pointer = pointers[id];
            if (!pointer) { return; } // Got removed in the middle of everything
            pointer.event = e;
        } else if (touches && touches.length) { // TouchEvent
            for (i=0; i < touches.length; i++) {
                id = touches[i].identifier;
                pointer = pointers[id];
                if (!pointer) { return; }
                pointer.event = touches[i];
            }
        }
        // Construct a useful object for pan events
        panObj.xOrig = pointer.x;
        panObj.yOrig = pointer.y;
        panObj.xPrev = pointer.xPrev || pointer.x;
        panObj.yPrev = pointer.yPrev || pointer.y;
        panObj.x = e.clientX || pointer.event.clientX;
        panObj.y = e.clientY || pointer.event.clientY;
        panObj.xMoved = panObj.x - panObj.xPrev;
        panObj.yMoved = panObj.y - panObj.yPrev;
        // Also update the pointer obj with current data
        pointer.xPrev = panObj.x;
        pointer.yPrev = panObj.y;
        self._resetSeqTimeout();
        if (self.filter(e)) {
            if (self.state.pointerCount > 1) {
                event = 'multitouch:';
                results = results.concat(self._triggerWithSelectors(event + 'pan', [e, pointers]));
                results = results.concat(self._triggerWithSelectors(event + self.state.pointerCount + ':pan', [e, pointers]));
            } else {
                results = results.concat(self._triggerWithSelectors(event, [e, panObj]));
            }
            handlePreventDefault(e, results);
        }
    }

    _dragendPointerup(e) {
        // This function is primarily a means to deal with the fact that mouseup/pointerup never fire when clicking and dragging with a mouse.
        // It creates a simulated mouseup/pointerup event so our state tracking doesn't get out of whack.
        var self = this;
        var id = e.pointerId || 1;
        var pointers = self.state.pointers;
        // Arg, this will add to the file size...
        var eventDict = {
            bubbles: true,
            cancelable: true,
            clientX: e.clientX,
            clientY: e.clientY,
            isPrimary: true,
            layerX: e.layerX,
            layerY: e.layerY,
            offsetX: e.offsetX,
            offsetY: e.offsetY,
            pageX: e.pageX,
            pageY: e.pageY,
            pointerId: id,
            pressure: e.pressure || 0,
            relatedTarget: window, // Not sure if this one is a good idea
            screenX: e.screenX,
            screenY: e.screenY,
            target: e.target,
            // Might as well support these (future proofing):
            tiltX: e.tiltX || 0,
            tiltY: e.tiltY || 0,
            view: window,
            x: e.x,
            y: e.y
        };
        var upEvent = new MouseEvent('mouseup', eventDict);
        if (!pointers[id]) { return; } // Got removed in the middle of everything
        if (POINTERSUPPORT) { // Fall back ("some day" we can get rid of this)
            upEvent = new PointerEvent('pointerup', eventDict);
        }
        self._pointerup(e); // Pass the potato
        // Don't need this anymore
        window.removeEventListener('dragend', self._dragendPointerup, true);
    }

    _pointerdown(e) {
        var i, id,
            self = this,
            state = self.state,
            mouse = self.mouse(e),
            results,
            changedTouches = e.changedTouches,
            ptype = e.pointerType,
            event = 'pointer',
            d = ':down';
        if (e.type == 'mousedown' && noMouseEvents) {
            return; // We already handled this via touch/pointer events
        }
        // Regardless of the filter status we need to keep track of things
        if (ptype || e.type == 'mousedown') { // PointerEvent or MouseEvent
            id = e.pointerId || 1; // 1 is used for MouseEvent
            state.pointers[id] = {
                x: e.clientX,
                y: e.clientY,
                event: e,
                timestamp: Date.now()
            };
        } else if (changedTouches && changedTouches.length) { // TouchEvent
            for (i=0; i < changedTouches.length; i++) {
                id = changedTouches[i].identifier;
                state.pointers[id] = {
                    x: changedTouches[i].clientX,
                    y: changedTouches[i].clientY,
                    event: changedTouches[i],
                    timestamp: Date.now()
                };
            }
            // Disable mouse events since we're going to be handling everything via touch
            noMouseEvents = true;
            // For touches emulate pointer:left
            mouse.buttonName = 'left';
        }
        // Make sure we still trigger _pointerup() on drag:
        window.addEventListener('dragend', self._dragendPointerup, true);
        // Handle multitouch
        state.pointerCount++; // Keep track of how many we have down at a time
        if (state.pointerCount > 1 || self.settings.listenEvents.includes('pan')) {
            // Ensure we only have *one* eventListener no matter how many pointers/touches:
            removeListeners(window, motionEvents, self._trackMotion, true);
            addListeners(window, motionEvents, self._trackMotion, true);
        }
        self._addDown(event + ':' + mouse.buttonName);
        self._resetSeqTimeout();
        if (self.filter(e)) {
// Make sure we trigger both pointer:down and the more specific pointer:<button>:down (if available):
            results = self._triggerWithSelectors(event + d, [e]);
            if (mouse.buttonName !== undefined) {
                event += ':' + mouse.buttonName;
                results = results.concat(self._triggerWithSelectors(event + d, [e]));
            }
            results = results.concat(self._handleDownEvents(e));
            handlePreventDefault(e, results);
        }
    }

    _pointerup(e) {
        var i, id, mouse, event, results,
            self = this,
            state = self.state,
            moveThreshold = self.settings.moveThreshold,
            clientX = e.clientX,
            clientY = e.clientY,
            pointers = state.pointers,
            diffs = {}, // Tracks the x/y coordinate changes
            changedTouches = e.changedTouches,
            ptype = e.pointerType,
            swipeThreshold = self.settings.swipeThreshold,
            u = 'up',
            pEvent = 'pointer:',
            notFiltered = self.filter(e);
        if (e.type == 'mouseup' && noMouseEvents) {
            return; // We already handled this via touch/pointer events
        }
        if (ptype || e.type == 'mouseup') { // PointerEvent or MouseEvent
            id = e.pointerId || 1; // 1 is used for MouseEvent
        } else if (changedTouches && changedTouches.length) { // TouchEvent
            for (i=0; i < changedTouches.length; i++) {
                id = changedTouches[i].identifier;
                clientX = changedTouches[i].clientX;
                clientY = changedTouches[i].clientY;
            }
        }
        if (pointers[id]) { // This can happen when the contextmenu intervenes
            diffs.x = pointers[id].x - clientX;
            diffs.y = pointers[id].y - clientY;
        }
        self._resetSeqTimeout();
        if (notFiltered) {
    // Make sure we trigger both pointer:up and the more specific pointer:<button>:up:
            results = self._triggerWithSelectors(pEvent + u, [e]);
            mouse = self.mouse(e);
            if (mouse.buttonName !== undefined) {
                pEvent += mouse.buttonName;
            } else {
                // :left is assumed/emulated for touch events
                pEvent += 'left';
            }
            results = results.concat(self._triggerWithSelectors(pEvent + ':' + u, [e]));
            // Now perform swipe detection...
            event = 'swipe:';
            if (Math.abs(diffs.x) > Math.abs(diffs.y)) {
                if (diffs.x > swipeThreshold) {
                    event += 'left';
                } else if (diffs.x < -(swipeThreshold)) {
                    event += 'right';
                }
            } else {
                if (diffs.y > swipeThreshold) {
                    event += 'up';
                } else if (diffs.y < -(swipeThreshold)) {
                    event += 'down';
                }
            }
        }
        // Cleanup
        delete pointers[id];
        state.pointerCount--;
        if (state.pointerCount > 0) { // Still more? Multitouch!
            if (diffs.x < moveThreshold && diffs.y < moveThreshold) {
                state.multitap++;
            } else { // One finger out of whack throws off the whole stack
                state.multitap = 0;
            }
        } else {
            if (state.multitap) {
                event = 'multitouch:'+ (state.multitap+1) + ':tap';
                results = self._triggerWithSelectors(event, [e]);
                self._removeDown(pEvent);
                self._addDown(event);
                if (notFiltered) {
                    results = results.concat(self._handleDownEvents(e));
                    self._handleSeqEvents(e);
                }
                self._removeDown(event);
                state.multitap = 0;
            } else {
                if (event != 'swipe:') { // If there's a :<direction> it means it was a swipe this._removeDown(pEvent);
                    self._addDown(event);
                    if (notFiltered) {
                        results = results.concat(self._handleDownEvents(e));
                        self._handleSeqEvents(e);
                    }
                    self._removeDown(event);
                } else {
                    if (notFiltered) {
                        self._handleSeqEvents(e);
                    }
                    self._removeDown(pEvent);
                }
            }
            handlePreventDefault(e, results);
            removeListeners(window, motionEvents, self._trackMotion, true);
        }
    }

    _pointercancel(e) {
        // Cleans up any leftovers from _pointerdown()
        var i, id,
            self = this,
            state = self.state,
            pointers = state.pointers,
            changedTouches = e.changedTouches,
            ptype = e.pointerType,
            event = 'pointer:',
            mouse = self.mouse(e);
        if (ptype || e.type.includes('mouse')) { // No 'mousecancel' (yet) but you never know
            id = e.pointerId || 1; // 1 is used for MouseEvent
            if (pointers[id]) {
                delete pointers[id];
            }
        } else if (changedTouches && changedTouches.length) { // TouchEvent
            for (i=0; i < changedTouches.length; i++) {
                id = changedTouches[i].identifier;
                if (pointers[id]) {
                    delete pointers[id];
                }
            }
            // Touch events emulate left mouse button
            mouse.buttonName = 'left';
        }
        self._removeDown(event + mouse.buttonName);
        state.pointerCount--;
        if (!state.pointerCount) { // It's empty; clean up the 'move' event listeners
            removeListeners(window, motionEvents, self._trackMotion, true);
        }
    }

    _click(e) {
        var self = this;
        var event = e.type;
        var numClicks = e.detail;
        if (numClicks === 2) { event = 'dblclick'; }
        else if (numClicks === 3) { event = 'tripleclick'; }
    // NOTE: No browsers seem to keep track beyond 3 clicks (yet).  When they do it might be a good idea to add 'quadrupleclick' and 'clickattack' events to this function =)
        self._resetSeqTimeout();
        if (self.filter(e)) {
            self._addDown(event);
            let results = self._handleDownEvents(e);
            self._removeDown(event);
            handlePreventDefault(e, results);
        }
    }

    _wheel(e) {
        var self = this;
        var event = 'wheel';
        self._resetSeqTimeout();
        if (self.filter(e)) {
            // Trigger just 'wheel' first
            let results = self._triggerWithSelectors(event, [e]);
            // Up and down scrolling is simplest:
            if (e.deltaY > 0) { results = results.concat(self._doDownEvent(event + ':down', e)); }
            else if (e.deltaY < 0) { results = results.concat(self._doDownEvent(event + ':up', e)); }
            // Z-axis scrolling is also straightforward:
            if (e.deltaZ > 0) { results = results.concat(self._doDownEvent(event + ':out', e)); }
            else if (e.deltaZ < 0) { results = results.concat(self._doDownEvent(event + ':in', e)); }
/*
NOTE: Since browsers implement left and right scrolling via shift+scroll we can't
      be certain if a developer wants to listen for say, 'shift-wheel:left' or
      just 'wheel:left'.  Therefore we must trigger both events for every left
      and right scroll action (if shift is down at the time).  If you can think
      of a better way to handle this situation please submit a PR or at least
      open an issue at Github indicating how this problem can be better solved.
*/
            if (e.deltaX > 0) {
                results = results.concat(self._doDownEvent(event + ':right', e));
                if (self.isDown('shift')) {
                    // Ensure that the singular 'wheel:right' is triggered even though the shift key is held
                    results = results.concat(self._triggerWithSelectors(event + ':right', [e]));
                }
            } else if (e.deltaX < 0) {
                results = results.concat(self._doDownEvent(event + ':left', e));
                if (self.isDown('shift')) {
                    // Ensure that the singular 'wheel:left' is triggered even though the shift key is held
                    results = results.concat(self._triggerWithSelectors(event + ':left', [e]));
                }
            }
            handlePreventDefault(e, results);
        }
    }

    mouse(e) {
        /**:HumanInput.prototype.mouse(e)

        Given a MouseEvent object, returns an object:

        .. code-block:: javascript

            {
                type:        e.type, // Just preserves it
                left:        boolean,
                right:       boolean,
                middle:      boolean,
                back:        boolean,
                forward:     boolean,
                eraser:      boolean,
                buttonName:  string
            }
        */
        var m = { type: e.type };
        if (e.type != 'mousemove' && e.type != 'wheel') {
            if (e.button === 0) { m.left = true; m.buttonName = 'left'; }
            else if (e.button === 1) { m.middle = true; m.buttonName = 'middle'; }
            else if (e.button === 2) { m.right = true; m.buttonName = 'right'; }
            else if (e.button === 3) { m.back = true; m.buttonName = 'back'; }
            else if (e.button === 4) { m.forward = true; m.buttonName = 'forward'; }
            else if (e.button === 5) { m.forward = true; m.buttonName = 'eraser'; }
            else { m.buttonName = e.button; }
        }
        m.button = e.button; // Save original button number
        return m;
    }

}

HumanInput.plugins.push(PointerPlugin);


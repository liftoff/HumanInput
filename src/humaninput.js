/**
 * humaninput.js - HumanInput is a Human-generated event library for humans (keyboard, mouse, gesture, touch, gamepad, speech recognition and more)
 * Copyright (c) 2016, Dan McDougall
 * @link https://github.com/liftoff/HumanInput
 * @license Apache-2.0
 */

(function() {
"use strict";

// Sandbox-side variables and shortcuts
var window = this,
    MACOS = (navigator.userAgent.indexOf('Mac OS X') != -1),
    KEYSUPPORT = false, // If the browser supports KeyboardEvent.key
    defaultEvents = ['keydown', 'keypress', 'keyup', 'click', 'dblclick', 'wheel', 'contextmenu', 'compositionstart', 'compositionupdate', 'compositionend', 'cut', 'copy', 'paste', 'select'],
    pointerEvents = ['pointerdown', 'pointerup'], // Better than mouse/touch!
    mouseTouchEvents = ['mousedown', 'mouseup', 'touchstart', 'touchend'],
    finishedKeyCombo = false,
    downState = [],
    seqTimer, // Used to remove sequence events after a period of inactivity
    // Internal utility functions
    noop = function(a) { return a },
    toString = Object.prototype.toString,
    getLoggingName = function(obj) {
        // Try to get a usable name/prefix for the default logger
        var name = '';
        if (obj.name) { name += " " + obj.name }
        else if (obj.id) { name += " " + obj.id }
        else if (obj.nodeName) { name += " " + obj.nodeName }
        return '[HI' + name + ']';
    },
    getNode = function(nodeOrSelector) {
        if (typeof nodeOrSelector === 'string') {
            var result = document.querySelector(nodeOrSelector);
            return result;
        }
        return nodeOrSelector;
    },
    normEvents = function(events) { // Converts events to an array if it's a single event (a string)
        if (_.isString(events)) { events = [events]; }
        return events;
    },
    handlePreventDefault = function(e, results) { // Just a DRY method
        // If any of the 'results' are false call preventDefault()
        if (results.indexOf(false) != -1) {
            e.preventDefault();
        }
    },
    cloneArray = function(arr) {
        var copy, i;
        if(_.isArray(arr)) {
            copy = arr.slice(0);
            for(i = 0; i < copy.length; i++) {
                copy[i] = cloneArray(copy[i]);
            }
            return copy;
        } else {
            return arr;
        }
    },
    arrayCombinations = function(arr, separator) {
        var result = [], remaining, i, n;
        if (arr.length == 1) {
            return arr[0];
        } else {
            remaining = arrayCombinations(arr.slice(1), separator);
            for (i = 0; i < remaining.length; i++) {
                for (n = 0; n < arr[0].length; n++) {
                    result.push(arr[0][n] + separator + remaining[i]);
                }
            }
            return result;
        }
    },
    getCoord = function (e, c) {
        return /touch/.test(e.type) ? (e.originalEvent || e).changedTouches[0]['page' + c] : e['page' + c];
    },
    isUpper = function(str) { if (str == str.toUpperCase()) { return true; }},
    startsWith = function(substr, str) {return str != null && substr != null && str.indexOf(substr) == 0;},
    _ = _ || noop; // Internal underscore-like function (just the things we need)

// Setup a few functions borrowed from underscore.js...
['Function', 'String', 'Number'].forEach(function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) == '[object ' + name + ']';
    };
});
_.isArray = Array.isArray;
_.toArray = function(obj) {
    var i, array = [];
    for (i = obj.length >>> 0; i--;) { array[i] = obj[i]; }
    return array;
};
_.partial = function(func) {
    var args = _.toArray(arguments);
    args.shift(); // Remove 'func'
    return function() {
        return func.apply(this, args.concat(_.toArray(arguments)));
    };
};

// Check if the browser supports KeyboardEvent.key:
if (Object.keys(KeyboardEvent.prototype).indexOf('key') != -1) {
    KEYSUPPORT = true;
}

/* Mouse/Pointer/Touch TODO:

    * Function: Calculate the center between two points (necessary for detecting pinch/spread)
    * Function: Calculate angle between two points (necessary for detecting rotation)
    * Function: Calculate the scale of movement between two points ('pinch:0.2' 'spread:0.4')
    * Maybe: Figure something out for drag & drop.

*/


var HumanInput = function(elem, settings) {
    /**:HumanInput(elem, settings)

    A library for managing human input on the web.  Features:

        * Can manage keyboard shortcuts including sophisticated macros and modifiers.
        * Supports international keyboards, alternate keyboard layouts, and software keyboards (IME friendly).
        * Supports mouse events which can be combined with the keyboard for highly advanced user interfaces.
        * Includes a plugin architecture with plugins available for touch events and gamepads/joysticks!
        * Any key or button can be a modifier.  Even gamepad buttons and multi-finger touches!
        * Super easy to debug with a powerful built-in logger (but you can use your own too!) and event emulation/trigger capabilities.
        * Can be extended to support other forms of input.

    HumanInput uses the key names implemented in the DOM Level 3 KeyboardEvent standard:

    http://www.w3.org/TR/DOM-Level-3-Events-key/

    Settings
    --------
    listenEvents (events to listen on)
    translate (localization function)
    noKeyRepeat
    sequenceTimeout
    maxSequenceBuf
    uniqueNumpad
    swipeThreshold
    eventOptions

    */
    if (!(this instanceof HumanInput)) { return new HumanInput(elem, settings); }
    var self = this, // Explicit is better than implicit
        i, xDown, yDown, recordedEvents, noMouseEvents, ctrlKeys, altKeys, osKeys,
        lastDownLength = 0;
    self.__version__ = "DEVELOPMENT BUILD DO NOT USE THIS VERSION IN PRODUCTION.  Use a version from the dist directory (https://github.com/liftoff/HumanInput/tree/master/dist)";
    // NOTE: Most state-tracking variables are set inside HumanInput.init()

    // Constants
    self.OSKEYS = ['OS', 'OSLeft', 'OSRight'],
    self.CONTROLKEYS = ['Control', 'ControlLeft', 'ControlRight'],
    self.ALTKEYS = ['Alt', 'AltLeft', 'AltRight'],
    self.SHIFTKEYS = ['Shift', 'ShiftLeft', 'ShiftRight', '⇧'],
    self.ALLMODIFIERS = self.OSKEYS.concat(self.CONTROLKEYS, self.ALTKEYS, self.SHIFTKEYS),
    self.MODIFIERPRIORITY = {}; // This gets filled out below
    self.ControlKeyEvent = 'ctrl';
    self.ShiftKeyEvent = 'shift';
    self.AltKeyEvent = 'alt';
    self.OSKeyEvent = 'os';
    self.AltAltNames = ['option', '⌥'];
    self.AltOSNames = ['meta', 'win', '⌘', 'cmd', 'command'];

    // Apply our settings:
    settings = settings || {};
    self.l = settings.translate || noop;
    settings.listenEvents = settings.listenEvents || HumanInput.defaultListenEvents;
    settings.eventOptions = settings.eventOptions || {}; // Options (3rd arg) to pass to addEventListener()
    settings.noKeyRepeat = settings.noKeyRepeat || true; // Disable key repeat by default
    settings.sequenceTimeout = settings.sequenceTimeout || 3000; // 3s default
    settings.maxSequenceBuf = settings.maxSequenceBuf || 12;
    settings.uniqueNumpad = settings.uniqueNumpad || false;
    settings.swipeThreshold = settings.swipeThreshold || 100; // 100px minimum to be considered a swipe
    settings.disableSequences = settings.disableSequences || false;
    settings.disableSelectors = settings.disableSelectors || false;
    self.settings = settings;
    self.elem = getNode(elem || window);
    self.log = new self.logger(settings.logLevel || 'INFO', getLoggingName(elem));

    // Setup the modifier priorities so we can maintain a consistent ordering of combo events
    ctrlKeys = self.CONTROLKEYS.concat(['ctrl']);
    altKeys = self.ALTKEYS.concat(self.AltAltNames)
    osKeys = self.OSKEYS.concat(self.AltOSNames);
    for (i=0; i < ctrlKeys.length; i++) {
        self.MODIFIERPRIORITY[ctrlKeys[i].toLowerCase()] = 5;
    }
    for (i=0; i < self.SHIFTKEYS.length; i++) {
        self.MODIFIERPRIORITY[self.SHIFTKEYS[i].toLowerCase()] = 4;
    }
    for (i=0; i < altKeys.length; i++) {
        self.MODIFIERPRIORITY[altKeys[i].toLowerCase()] = 3;
    }
    for (i=0; i < osKeys.length; i++) {
        self.MODIFIERPRIORITY[osKeys[i].toLowerCase()] = 2;
    }

    // Internal functions and variables:
    self._getInstanceName = function() {
        for (var name in window) {
            if (window[name] === self)
                return name;
        }
    };
    self._resetKeyStates = function() {
        // This gets called after the sequenceTimeout to reset the state of all keys and modifiers
        // It saves us in the event that a user changes windows while a key is held down (e.g. command-tab)
        self.modifiers = {};
        self.seqBuffer = [];
        self.down = [];
        downState = [];
        lastDownLength = 0;
        finishedKeyCombo = false;
    };
    self._addDown = function(event, alt) {
        // Adds the given *event* to self.down and downState to ensure the two stay in sync in terms of how many items they hold.
        // If an *alt* event is given it will be stored in downState explicitly
        var index = self.down.indexOf(event);
        if (index == -1) {
            index = downState.indexOf(event);
        }
        if (index == -1 && alt) {
            index = downState.indexOf(alt);
        }
        if (index == -1) {
            self.down.push(event);
            if (alt) {
                downState.push(alt);
            } else {
                downState.push(event);
            }
        }
    };
    self._removeDown = function(event) {
        // Removes the given *event* from self.down and downState (if found); keeping the two in sync in terms of indexes
        var index = self.down.indexOf(event);
        if (index == -1) {
            // Event changed between 'down' and 'up' events
            index = downState.indexOf(event);
        }
        if (index == -1) { // Still no index?  Try one more thing: Upper case
            index = downState.indexOf(event.toUpperCase()); // Handles the situation where the user releases a key *after* a Shift key combo
        }
        if (index != -1) {
            self.down.splice(index, 1);
            downState.splice(index, 1);
        }
        lastDownLength = self.down.length;
    };
    self._doDownEvent = function(event) {
        /*
            Adds the given *event* to self.down, calls self._handleDownEvents(), removes the event from self.down, then returns the triggered results.
            Any additional arguments after the given *event* will be passed to self._handleDownEvents().
        */
        var results, args = _.toArray(arguments);
        args.shift(); // Remove 'event'
        self._addDown(event);
        results = self._handleDownEvents.apply(self, args);
        self._handleSeqEvents();
        self._removeDown(event);
        return results;
    };
    self._resetSeqTimeout = function() {
        // Ensure that the seqBuffer doesn't get emptied (yet):
        clearTimeout(seqTimer);
        seqTimer = setTimeout(function() {
            self.log.debug(self.l('Resetting key states due to timeout'));
            self._resetKeyStates();
        }, self.settings.sequenceTimeout);
    };
    self._genericEvent = function(prefix, e) {
        // Can be used with any event handled via addEventListener() to trigger a corresponding event in HumanInput
        var notFiltered = self.filter(e);
        if (notFiltered) {
            if (prefix.type) { e = prefix; prefix = null; };
            if (prefix) { prefix = prefix + ':' } else { prefix = ''; }
            self.trigger(self.scope + prefix + e.type, e);
            if (e.target) {
                // Also triger events like '<event>:#id' or '<event>:.class':
                self._handleSelectors(prefix + e.type, e);
            }
        }
    };
    self._handleSelectors = function(eventName) {
        // Triggers the given *eventName* using various combinations of information taken from the given *e.target*.
        var results = [], args = _.toArray(arguments), toBind = self;
        args.shift(); // Remove the eventName from arguments
        if (args[0] && args[0].target) {
            toBind = args[0].target;
            if (toBind.id) {
                results = self.trigger.apply(toBind, [self.scope + eventName + ':#' + toBind.id].concat(args));
            }
            if (toBind.classList && toBind.classList.length) {
                for (var i=0; i<toBind.classList.length; i++) {
                    results = results.concat(self.trigger.apply(toBind, [self.scope + eventName + ':.' + toBind.classList.item(i)].concat(args)));
                }
            }
        }
        return results;
    };
    self._keyEvent = function(key) {
        // Given a *key* like 'ShiftLeft' returns the "official" key event or just the given *key* in lower case
        if (self.CONTROLKEYS.indexOf(key) != -1) {
            return self.ControlKeyEvent;
        } else if (self.ALTKEYS.indexOf(key) != -1) {
            return self.AltKeyEvent;
        } else if (self.SHIFTKEYS.indexOf(key) != -1) {
            return self.ShiftKeyEvent;
        } else if (self.OSKEYS.indexOf(key) != -1) {
            return self.OSKeyEvent;
        } else {
            return key.toLowerCase();
        }
    };
    self._seqCombinations = function(buffer, joinChar) {
        /**:HumanInput._seqCombinations(buffer[, joinChar])

        Returns all possible alternate name combinations of events (as an Array) for a given buffer (*buffer*) which must be an Array of Arrays in the form of::

            [['ControlLeft', 'c'], ['a']]

        The example above would be returned as an Array of strings that can be passed to :js:func:`HumanInput._seqSlicer` like so::

            ['controlleft-c a', 'ctrl-c a']

        The given *joinChar* will be used to join the characters for key combinations.

        .. note:: Events will always be emitted in lower case.  To use events with upper case letters use the 'shift' modifier (e.g. 'shift-a').  Shifted letters that are not upper case do not require the 'shift' modifier (e.g. '?').
        */
        joinChar = joinChar || '-';
        var replacement = cloneArray(buffer), out = [], temp = [], i, j;
        for (i=0; i < buffer.length; i++) {
            out.push(replacement[i].join(joinChar).toLowerCase());
        }
        out = [out.join(' ')];
        for (i=0; i < buffer.length; i++) {
            // Normalize names and make sure they're lower-case
            for (j=0; j < buffer[i].length; j++) {
                replacement[i][j] = [self._keyEvent(buffer[i][j])];
            }
        }
        for (i=0; i < replacement.length; i++) {
            temp.push(arrayCombinations(replacement[i], joinChar));
        }
        temp = temp.join(' ');
        if (temp != out[0]) { // Only if they're actually different
            out.push(temp);
        }
        return out;
    };
    self._downEvents = function() {
        /* Returns all events that could represent the current state of ``self.down``.  e.g. ['shiftleft-a', 'shift-a'] but not ['shift', 'a']
        */
        var i, events = [],
            skipPrecise,
            shiftKeyIndex = -1,
            shiftedKey,
            down = self.down.slice(0), // Make a copy because we're going to mess with it
            unshiftedDown = downState.slice(0);
        if (down.length) {
            if (down.length > 1) {
                // Before sorting, fire the precise key combo event
                if (self.modifiers.shift) {
                    for (i=0; i < down.length; i++) {
                        shiftKeyIndex = down[i].indexOf('Shift');
                        if (shiftKeyIndex != -1) { break; }
                    }
                }
                for (i=0; i < down.length; i++) {
                    if (down[i] != downState[i] && shiftKeyIndex != -1) {
                        // Key was shifted; use the un-shifted key for a user-friendly "precise" event...
                        shiftedKey = true;
                    }
                }
                if (shiftedKey) { // _keypress() wound up with a shifted key
                    if (down.length == 2) {
                        // We don't need to trigger a "precise" event since "shift-><key>" turns into just "<key>"
                        skipPrecise = true;
                    }
                    // Remove the 'shift' key so folks can use just "A" instead of "shift-a"
                    down.splice(shiftKeyIndex, 1);
                }
                if (!skipPrecise) {
                    events = events.concat(self._seqCombinations([down], '->'));
                    if (shiftedKey) {
                        events = events.concat(self._seqCombinations([unshiftedDown], '->'));
                    }
                }
            }
            self._sortEvents(down);
            // Make events for all alternate names (e.g. 'controlleft-a' and 'ctrl-a'):
            events = events.concat(self._seqCombinations([down]));
            if (shiftedKey) {
                self._sortEvents(unshiftedDown);
                events = events.concat(self._seqCombinations([unshiftedDown]));
            }
        }
        return events;
    };
    self._handleDownEvents = function() {
        var i, events = [],
            results = [];
        events = self._downEvents();
        for (i=0; i < events.length; i++) {
            results = results.concat(self.trigger.apply(self, [self.scope + events[i]].concat(_.toArray(arguments))));
            results = results.concat(self._handleSelectors.apply(self, [events[i]].concat(_.toArray(arguments))));
        }
        return results;
    };
    self._handleSeqEvents = function() {
        // NOTE: This function should only be called when a button or key is released (i.e. when state changes to UP)
        var combos, i, results,
            down = self.down.slice(0);
        if (lastDownLength < down.length) { // User just finished a combo (e.g. ctrl-a)
            down = self._sortEvents(down);
            self.seqBuffer.push(down);
            if (self.seqBuffer.length > self.settings.maxSequenceBuf) {
                // Make sure it stays within the specified max
                self.seqBuffer.shift();
            }
            if (self.seqBuffer.length > 1) {
                // Trigger all combinations of sequence buffer events
                combos = self._seqCombinations(self.seqBuffer);
                for (var i=0; i<combos.length; i++) {
                    self._seqSlicer(combos[i]).forEach(function(item) {
                        results = self.trigger(self.scope + item, self);
                    });
                }
                if (results.length) {
                // Reset the sequence buffer on matched event so we don't end up triggering more than once per sequence
                    self.seqBuffer = [];
                }
            }
        }
        self._resetSeqTimeout();
    };
    self._normSpecial = function(location, key, code) {
        // Just a DRY function for keys that need some extra love
        if (code.indexOf('Left') != -1 || code.indexOf('Right') != -1) {
            // Use the left and right variants of the name as the 'key'
            key = code; // So modifiers can be more specific
        } else if (self.settings.uniqueNumpad && location == 3) {
            return 'numpad' + key; // Will be something like 'numpad5' or 'numpadenter'
        }
        if (startsWith('arrow', key.toLowerCase())) {
            key = key.substr(5); // Remove the 'arrow' part
        }
        return key;
    };
    self._setModifiers = function(code, bool) {
        // Set all modifiers matching *code* to *bool*
        if (self.ALLMODIFIERS.indexOf(code)) {
            if (self.SHIFTKEYS.indexOf(code) != -1) {
                self.modifiers.shift = bool;
            }
            if (self.CONTROLKEYS.indexOf(code) != -1) {
                self.modifiers.ctrl = bool;
            }
            if (self.ALTKEYS.indexOf(code) != -1) {
                self.modifiers.alt = bool;
                self.modifiers.option = bool;
                self.modifiers['⌥'] = bool;
            }
            if (self.OSKEYS.indexOf(code) != -1) {
                self.modifiers.meta = bool;
                self.modifiers.command = bool;
                self.modifiers.os = bool;
                self.modifiers['⌘'] = bool;
            }
            self.modifiers[code] = bool; // Required for differentiating left and right variants
        }
    };
    self._keydown = function(e) {
        // NOTE: e.which and e.keyCode will be incorrect for a *lot* of keys
        //       and basically always incorrect with alternate keyboard layouts
        //       which is why we replace self.down[<the key>] inside _keypress()
        //       when we can (for browsers that don't support KeyboardEvent.key).
        var results = [],
            keyCode = e.which || e.keyCode,
            location = e.location || 0,
// NOTE: Should I put e.code first below?  Hmmm.  Should we allow keyMaps to override the browser's native key name if it's available?
            code = self.keyMaps[location][keyCode] || self.keyMaps[0][keyCode] || e.code,
            key = e.key || code,
            notFiltered = self.filter(e);
        key = self._normSpecial(location, key, code);
        // Set modifiers and mark the key as down whether we're filtered or not:
        self._setModifiers(key, true);
        if (key == 'Compose') { // This indicates that the user is entering a composition
            self.state.composing = true;
            return;
        }
        if (downState.indexOf(key) == -1) {
            self._addDown(key, code);
        }
        // Don't let the sequence buffer reset if the user is active:
        self._resetSeqTimeout();
        if (notFiltered) {
            if (e.repeat && self.settings.noKeyRepeat) {
                e.preventDefault(); // Make sure keypress doesn't fire after this
                return false; // Don't do anything if key repeat is disabled
            }
            // This is in case someone wants just on('keydown'):
            results = self.trigger(self.scope + 'keydown', e, key, code);
            results = results.concat(self._handleSelectors('keydown', e));
            handlePreventDefault(e, results);
            if (self.down.length > 5) { // 6 or more keys down at once?  FACEPLANT!
                results = results.concat(self.trigger(self.scope + 'faceplant', e)); // ...or just key mashing :)
            }
            results = results.concat(self.trigger(self.scope + 'keydown:' + key.toLowerCase(), e, key, code));
            results = results.concat(self._handleSelectors('keydown:' + key.toLowerCase(), e));
/* NOTE: For browsers that support KeyboardEvent.key we can trigger the usual
         events inside _keydown() (which is faster) but other browsers require
         _keypress() be called first to fix localized/shifted keys.  So for those
         browser we call _handleDownEvents() inside _keyup(). */
            if (KEYSUPPORT) {
                results = results.concat(self._handleDownEvents(e));
            }
            handlePreventDefault(e, results);
        }
    };
// NOTE: Use of _keypress is only necessary until Safari supports KeyboardEvent.key!
    self._keypress = function(e) {
        // NOTE: keypress events don't always fire when modifiers are used!
        //       This means that such browsers may never get sequences like 'ctrl-?'
//         self.log.debug('_keypress()', e);
        var charCode = e.charCode || e.which;
        var key = e.key || String.fromCharCode(charCode);
        if (!KEYSUPPORT && charCode > 47 && key.length) {
            // Replace the possibly-incorrect key with the correct one
            self.down.pop();
            self.down.push(key);
        }
    };
    self._keyup = function(e) {
        var results, keyCode = e.which || e.keyCode,
            location = e.location || 0,
// NOTE: Should I put e.code first below?  Hmmm.  Should we allow keyMaps to override the browser's native key name if it's available?
            code = self.keyMaps[location][keyCode] || self.keyMaps[0][keyCode] || e.code,
            key = e.key || code,
            notFiltered = self.filter(e);
        key = self._normSpecial(location, key, code);
        // Uncomment this to debug _keyup() itself:
//         self.log.debug('_keyup()', e, 'self.down:', self.down, 'seqBuffer:', self.seqBuffer);
        if (!downState.length) { // Implies key states were reset or out-of-order somehow
            return; // Don't do anything since our state is invalid
        }
        if (self.state.composing) {
            self.state.composing = false;
            return;
        }
        if (notFiltered) {
            if (!KEYSUPPORT) {
                self._handleDownEvents(e);
            }
            // This is in case someone wants just on('keyup'):
            results = self.trigger(self.scope + 'keyup', e, key, code);
            results = results.concat(self._handleSelectors('keyup', e));
            results = results.concat(self.trigger(self.scope + 'keyup:' + key.toLowerCase(), e));
            results = results.concat(self._handleSelectors('keyup:' + key.toLowerCase(), e));
            self._handleSeqEvents();
            handlePreventDefault(e, results);
        }
        // Remove the key from self.down even if we're filtered (state must stay accurate)
        self._removeDown(key);
        self._setModifiers(code, false); // Modifiers also need to stay accurate
    };
    // This is my attempt at a grand unified theory of pointing device and touch input:
//     self.touches = {
//         0: [TouchEvent,TouchEvent],
//         1: [TouchEvent]
//     };
// NOTE: Pointer Events use pointerId instead of touches[0].identifier
    self._pointerdown = function(e) {
        var i, id,
            mouse = self.mouse(e),
            results = [],
            changedTouches = e.changedTouches,
            ptype = e.pointerType,
            event = 'pointer',
            d = ':down',
            notFiltered = self.filter(e);
//         self.log.debug('_pointerdown() event: ' + e.type, e, mouse, 'downEvent:', self.state._downEvent);
        if (e.type == 'mousedown' && noMouseEvents) {
            return; // We already handled this via touch/pointer events
        }
        if (ptype) { // PointerEvent
            if (ptype == 'touch') {
                id = e.pointerId;
                if (!self.touches[id]) {
                    self.touches[id] = e;
                }
            }
        } else if (changedTouches && changedTouches.length) { // TouchEvent
            // Regardless of the filter status we need to keep track of things
            for (i=0; i < changedTouches.length; i++) {
                id = changedTouches[i].identifier;
                if (!self.touches[id]) {
                    self.touches[id] = changedTouches[i];
                }
            }
        }
        xDown = getCoord(e, 'X');
        yDown = getCoord(e, 'Y');
        self._resetSeqTimeout();
        if (notFiltered) {
// Make sure we trigger both pointer:down and the more specific pointer:<button>:down (if available):
            results = self.trigger(self.scope + event + d, e);
            results = results.concat(self._handleSelectors(event + d, e));
            if (mouse.buttonName !== undefined) {
                event += ':' + mouse.buttonName;
                results = results.concat(self.trigger(self.scope + event + d, e));
                results = results.concat(self._handleSelectors(event + d, e));
            }
            handlePreventDefault(e, results);
        }
        self._addDown(event);
        self._handleDownEvents(e);
    };
    self._mousedown = self._pointerdown;
    self._touchstart = self._pointerdown;
    self._pointerup = function(e) {
        var i, id, mouse, click, xDiff, yDiff, event,
            changedTouches = e.changedTouches,
            ptype = e.pointerType,
            swipeThreshold = self.settings.swipeThreshold,
            results = [],
            u = ':up',
            pEvent = 'pointer';
//         self.log.debug('_pointerup() event: ' + e.type, e, mouse, 'seqBuffer:', self.seqBuffer);
        if (ptype) { // PointerEvent
            if (ptype == 'touch') {
                id = e.pointerId;
                if (self.touches[id]) {
                    xDown = self.touches[id].pageX;
                    yDown = self.touches[id].pageY;
                    xDiff = e.pageX - xDown;
                    yDiff = e.pageY - yDown;
                    delete self.touches[id];
                }
            }
        } else if (changedTouches) {
// NOTE: Right around here is where touch-related gestures like pinch, zoom, etc would be handled (if not via a plugin)
            if (changedTouches.length) { // Should only ever be 1 for *up events
//                 HI.log.debug('changedTouches.length:', changedTouches.length);
                for (i=0; i < changedTouches.length; i++) {
                    id = changedTouches[i].identifier;
                    if (self.touches[id]) {
                        xDown = self.touches[id].pageX;
                        yDown = self.touches[id].pageY;
                        xDiff = e.pageX - xDown;
                        yDiff = e.pageY - yDown;
                        delete self.touches[id];
                    }
                }
            }
            // If movement is less than 20px call preventDefault() so we don't get mousedown/mouseup events (when touch support is present but not pointer events)
            if (Math.abs(e.pageX - xDown) < 20 && Math.abs(e.pageY - yDown) < 20) {
                noMouseEvents = true; // Prevent emulated mouse events
            }
            // If there was zero movement make sure we also fire a click event
            if (e.pageX == xDown && e.pageY == yDown) {
                click = true;
            }
        }
        if (noMouseEvents && e.type == 'mouseup') {
            noMouseEvents = false;
            return;
        }
        self._resetSeqTimeout();
        if (self.filter(e)) {
    // Make sure we trigger both pointer:up and the more specific pointer:<button>:up:
            results = self.trigger(self.scope + pEvent + u, e);
            mouse = self.mouse(e);
            if (mouse.buttonName !== undefined) {
                pEvent += ':' + mouse.buttonName;
                results = results.concat(self.trigger(self.scope + pEvent + u, e));
                results = results.concat(self._handleSelectors(pEvent + u, e));
            }
            // Now perform swipe detection...
            xDiff = xDown - getCoord(e, 'X');
            yDiff = yDown - getCoord(e, 'Y');
            event = 'swipe';
            if (Math.abs(xDiff) > Math.abs(yDiff)) {
                if (xDiff > swipeThreshold) {
                    event += ':left';
                } else if (xDiff < -(swipeThreshold)) {
                    event += ':right';
                }
            } else {
                if (yDiff > swipeThreshold) {
                    event += ':up';
                } else if (yDiff < -(swipeThreshold)) {
                    event += ':down';
                }
            }
            if (event != 'swipe') {
                self._removeDown(pEvent);
                self._addDown(event);
                results = results.concat(self._handleDownEvents(e));
                results = results.concat(self._handleSelectors(event, e));
                self._handleSeqEvents();
                self._removeDown(event);
            } else {
                self._handleSeqEvents();
                self._removeDown(pEvent);
                if (click) {
                // TODO: Check to see if this click emulation is actually necessary:
                    results = results.concat(self.trigger(self.scope + 'click', e));
                    results = results.concat(self._handleSelectors('click', e));
                }
                handlePreventDefault(e, results);
            }
        }
        xDown = null;
        yDown = null;
    };
    self._mouseup = self._pointerup;
    self._touchend = self._pointerup;
//     self._pointercancel = function(e) {
//         // TODO
//     };
// NOTE: Intentionally not sending click, dblclick, or contextmenu events to the
//       seqBuffer because that wouldn't make sense (no 'down' or 'up' equivalents).
    self._click = function(e) {
        var results, mouse = self.mouse(e),
            event = 'click',
            notFiltered = self.filter(e);
//         self.log.debug('_click()', e, mouse);
        self._resetSeqTimeout();
        if (notFiltered) {
            if (mouse.left) {
                results = self.trigger(self.scope + event, e);
            }
            results = self.trigger(self.scope + event + ':' + mouse.buttonName, e);
            results = results.concat(self._handleSelectors(event, e));
            handlePreventDefault(e, results);
        }
    };
    self._tap = self._click;
// NOTE: dblclick with the right mouse button doesn't appear to work in Chrome
    self._dblclick = function(e) {
        var results, mouse = self.mouse(e),
            event = 'dblclick',
            notFiltered = self.filter(e);
//         self.log.debug('_dblclick()', e, mouse);
        self._resetSeqTimeout();
        if (notFiltered) {
            // Trigger 'dblclick' for normal left dblclick
            if (mouse.left) { results = self.trigger(self.scope + event, e); }
            results = self.trigger(self.scope + event + ':' + mouse.buttonName, e);
            results = results.concat(self._handleSelectors(event, e));
            handlePreventDefault(e, results);
        }
    };
    self._wheel = function(e) {
        var results,
            notFiltered = self.filter(e),
            event = 'wheel';
//         self.log.debug('_wheel()', e);
        self._resetSeqTimeout();
        if (notFiltered) {
            results = self.trigger(self.scope + event, e); // Trigger just 'wheel' first
            results = results.concat(self._handleSelectors(event, e));
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
                    results = results.concat(self.trigger(self.scope + event, e));
                    results = results.concat(self._handleSelectors(event, e));
                }
            } else if (e.deltaX < 0) {
                results = results.concat(self._doDownEvent(event + ':left', e));
                if (self.isDown('shift')) {
                    // Ensure that the singular 'wheel:left' is triggered even though the shift key is held
                    results = results.concat(self.trigger(self.scope + event, e));
                    results = results.concat(self._handleSelectors(event, e));
                }
            }
            handlePreventDefault(e, results);
        }
    };
    self._contextmenu = function(e) {
        var results, notFiltered = self.filter(e),
            event = 'contextmenu';
//         self.log.debug('_contextmenu()', e);
        self._resetSeqTimeout();
        if (notFiltered) {
            results = self.trigger(self.scope + event, e);
            results = results.concat(self._handleSelectors(event, e));
        }
        handlePreventDefault(e, results);
    };
    self._composition = function(e) {
        var results,
            notFiltered = self.filter(e),
            data = e.data,
            event = 'compos';
//         self.log.debug('_composition() (' + e.type + ')', e);
        if (notFiltered) {
            results = self.trigger(self.scope + e.type, e, data);
            if (data) {
                if (e.type == 'compositionupdate') {
                    event += 'ing:"' + data + '"';
                } else if (e.type == 'compositionend') {
                    event += 'ed:"' + data + '"';
                }
                results = results.concat(self.trigger(self.scope + event, e));
                results = results.concat(self._handleSelectors(event, e));
                handlePreventDefault(e, results);
            }
        }
    };
    self._compositionstart = self._composition;
    self._compositionupdate = self._composition;
    self._compositionend = self._composition;
    self._clipboard = function(e) {
        var data, results,
            notFiltered = self.filter(e),
            event = e.type + ':"';
//         self.log.debug('_clipboard() (' + e.type + ')', e);
        if (notFiltered) {
            if (window.clipboardData) { // IE
                data = window.clipboardData.getData('Text');
            } else if (e.clipboardData) { // Standards-based browsers
                data = e.clipboardData.getData('text/plain');
            }
            if (!data && (e.type == 'copy' || e.type == 'cut')) {
                data = self.getSelText();
            }
            if (data) {
                // First trigger a generic event so folks can just grab the copied/cut/pasted data
                results = self.trigger(self.scope + e.type, e, data);
                results = results.concat(self._handleSelectors(e.type, e, data));
                // Now trigger a more specific event that folks can match against
                results = results.concat(self.trigger(self.scope + event + data + '"', e));
                results = results.concat(self._handleSelectors(event + data + '"', e));
                handlePreventDefault(e, results);
            }
        }
    };
    self._paste = self._clipboard;
    self._copy = self._clipboard;
    self._cut = self._clipboard;
    self._select = function(e) {
        var results,
            data = self.getSelText(),
            event = e.type + ':"';
//         self.log.debug('_select()', e, data);
        results = self.trigger(self.scope + e.type, e, data);
        results = results.concat(self._handleSelectors(e.type, e, data));
        if (data) {
            results = results.concat(self.trigger(self.scope + event + data + '"', e, data));
            results = results.concat(self._handleSelectors(event + data + '"', e));
            handlePreventDefault(e, results);
        }
    };

    // API functions
    self.filter = function(event) {
        /**:HumanInput.filter(event)

        This function gets called before HumanInput events are triggered.  If it returns ``False`` then ``trigger()`` will not be called.

        Override this function to implement your own filter.

        .. note:: The given *event* won't always be a browser-generated event but it should always have a 'type' and 'target'.
        */
        var tagName = (event.target || event.srcElement).tagName,
            // The events we're concerned with:
            keyboardEvents = ['keydown', 'keyup', 'keypress'];
        if (keyboardEvents.indexOf(event.type) != -1) {
            // Don't trigger keyboard events if the user is typing into a form
            return !(tagName == 'INPUT' || tagName == 'SELECT' || tagName == 'TEXTAREA');
        }
        return true;
    };
    self.startRecording = function() {
        /**:HumanInput.startRecording()

        Starts recording all triggered events.  The array of recorded events will be returned when :js:func:`HumanInput.stopRecording` is called.

        .. note:: You can tell if HumanInput is currently recording events by examining the ``HI.recording`` (instance) attribute (boolean).

        .. warning:: Don't leave the recording running for too long as there's no limit to how big it can get!
        */
        self.recording = true;
        recordedEvents = [];
    };
    self.stopRecording = function(filter) {
        /**:HumanInput.stopRecording([filter])

        Returns an array of all the events that were triggered since :js:func:`HumanInput.startRecording` was called.  If a *filter* (String) is given it will be used to limit what gets returned.  Example::

            HI.startRecording();
            // User types ctrl-a followed by ctrl-s
            events = HI.stopRecording('-(?!\\>)'); // Only return events that contain '-' (e.g. combo events) but not '->' (ordered combos)
            ["controlleft-a", "ctrl-a", "controlleft-s", "ctrl-s", "controlleft-a controlleft-s", "ctrl-a ctrl-s"]

        Alternatively, if ``filter == 'keystroke'`` the first completed keystroke (e.g. ``ctrl-b``) typed by the user will be returned.  Here's an example demonstrating how this can be used with :js:func:`HumanInput.once` to capture a keystroke::

            HI.startRecording();
            HI.once('keyup', (e) => {
                var keystroke = HI.stopRecording('keystroke');
                HI.log.info('User typed:', keystroke, e);
            });

        .. note:: You can call ``stopRecording()`` multiple times after a recording to try different filters or access the array of recorded events.
        */
        var events, keystroke, regex = new RegExp(filter);
        self.recording = false;
        if (!filter) { return recordedEvents; }
        if (filter == 'keystroke') {
            for (var i=0; i<recordedEvents.length; i++) {
                if (recordedEvents[i].indexOf('keyup') != -1) { break; }
                keystroke = recordedEvents[i];
            };
            return keystroke;
        }
        // Apply the filter
        events = recordedEvents.filter(function(item) {
            return regex.test(item);
        });
        return events;
    };
    self.isDown = function(name) {
        /**:HumanInput.isDown(name)

        Returns ``true`` if the given *name* (string) is currently held (aka 'down' or 'pressed').  It works with simple keys like, 'a' as well as key combinations like 'ctrl-a'.

        .. note:: Strings are used to track keys because key codes are browser and platform dependent (unreliable).
        */
        var i, down, downAlt,
            downEvents = self._downEvents();
        name = name.toLowerCase();
        if (downEvents.indexOf(name) != -1) {
            return true;
        }
        for (i=0; i < self.down.length; i++) {
            down = self.down[i].toLowerCase();
            downAlt = downState[i].toLowerCase(); // In case something changed between down and up events
            if (name == down || name == downAlt) {
                return true;
            } else if (self.SHIFTKEYS.indexOf(self.down[i]) != -1) {
                if (name == self.ShiftKeyEvent) {
                    return true;
                }
            } else if (self.CONTROLKEYS.indexOf(self.down[i]) != -1) {
                if (name == self.ControlKeyEvent) {
                    return true;
                }
            } else if (self.ALTKEYS.indexOf(self.down[i]) != -1) {
                if (name == self.AltKeyEvent) {
                    return true;
                }
            } else if (self.OSKEYS.indexOf(self.down[i]) != -1) {
                if (name == self.OSKeyEvent) {
                    return true;
                }
            }
        }
        return false;
    };
    self.getSelText = function() {
        /**:HumanInput.getSelText()

        :returns: The text that is currently highlighted in the browser.

        Example:

            HumanInput.getSelText();
            "localhost" // Assuming the user had highlighted the word, "localhost"
        */
        var txt = '';
        if (window.getSelection) {
            txt = window.getSelection();
        } else if (document.getSelection) {
            txt = document.getSelection();
        } else if (document.selection) {
            txt = document.selection.createRange().text;
        } else {
            return;
        }
        return txt.toString();
    };
    self.on = function(events, callback, context, times) {
        normEvents(events).forEach(function(event) {
            var splitRegex, splitEvents, splitChar;
            if (event.indexOf(':') != -1) { // Contains a scope (or other divider); we need to split it up to resolve aliases
                splitChar = ':';
            } else if (event.indexOf(':') != -1) { // It's (likely) a sequence
                splitChar = ' ';
            }
            if (splitChar) { // NOTE: This won't hurt anything if we accidentally matched on something in quotes
                splitRegex = new RegExp(splitChar + '(?=(?:(?:[^"]*"){2})*[^"]*$)', 'g');
                splitEvents = event.split(splitRegex);
                event = '';
                splitEvents.forEach(function(evt) {
                    evt = self.aliases[evt] || evt; // Resolve any (individual) aliases
                    event += evt + splitChar;
                });
                event = event.replace(new RegExp(splitChar + '+$'), ""); // Remove traililng colons
            }
            event = self.aliases[event] || event; // Resolve any aliases
            if (event.length == 1 && isUpper(event)) { // Convert uppercase chars to shift-<key> equivalents
                event = 'shift-' + event;
            }
            event = event.toLowerCase(); // All events are normalized to lowercase for consistency
            if (event.indexOf('-') != -1) { // Combo
                if (event.indexOf('->') == -1) {
                    // Pre-sort non-ordered combos
                    event = self._normCombo(event);
                }
            }
            var callList = self.events[event],
                callObj = {
                    callback: callback,
                    context: context,
                    times: times
                };
            if (!callList) {
                callList = self.events[event] = [];
            }
            callList.push(callObj);
        });
        return self;
    };
    self.once = function(events, callback, context) {
        return self.on(events, callback, context, 1);
    };
    self.off = function(events, callback, context) {
        var i, n;
        if (!arguments.length) { // Called with no args?  Remove all events:
            self.events = {};
        } else {
            events = events ? normEvents(events) : Object.keys(self.events);
            for (i in events) {
                var event = events[i],
                    callList = self.events[event];
                if (callList) {
                    var newList = [];
                    for (var n in callList) {
                        if (callback) {
                             if (callList[n].callback.toString() == callback.toString()) {
                                if (context && callList[n].context != context) {
                                    newList.push(callList[n]);
                                } else if (context === null && callList[n].context) {
                                    newList.push(callList[n]);
                                }
                             } else {
                                newList.push(callList[n]);
                             }
                        } else if (context && callList[n].context != context) {
                            newList.push(callList[n]);
                        }
                    }
                    if (!newList.length) {
                        delete self.events[event];
                    } else {
                        self.events[event] = newList;
                    }
                }
            }
        }
        return self;
    };
    self.trigger = function(events) {
        var i, j, event, callList, callObj,
            results = [], // Did we successfully match and trigger an event?
            args = [];
        events = normEvents(events);
        Array.prototype.push.apply(args, arguments);
        args.shift(); // Remove 'events'
        for (i=0; i < events.length; i++) {
            event = self.aliases[events[i]] || events[i]; // Apply the alias, if any
            self.log.debug('Triggering:', event, args);
            if (self.recording) { recordedEvents.push(event); }
            callList = self.events[event];
            if (callList) {
                for (j=0; j < callList.length; j++) {
                    callObj = callList[j];
                    if (callObj.times) {
                        callObj.times -= 1;
                        if (callObj.times == 0) {
                            self.off(event, callObj.callback, callObj.context);
                        }
                    }
                    results.push(callObj.callback.apply(callObj.context || this, args));
                }
            }
        }
        return results;
    };
    // Some API shortcuts
    self.emit = self.trigger; // Some people prefer 'emit()'; we can do that!
    // Add some generic window/document events so plugins don't need to handle
    // them on their own; it's better to have *one* listener.
    if (typeof document.hidden !== "undefined") {
        document.addEventListener('visibilitychange', function(e) {
            if (document.hidden) {
                self.trigger('document:hidden', e);
            } else {
                self.trigger('document:visible', e);
            }
        }, false);
    }
    if (self.elem === window) { // Only attach window events if HumanInput was instantiated on the 'window'
        // These events are usually user-initiated so they count:
        ['resize', 'beforeunload', 'hashchange', 'languagechange'].forEach(function(event) {
            window.addEventListener(event, self._genericEvent.bind(self, 'window'), true);
        });
        // Orientation change is almost always human-initiated:
        if (window.orientation !== undefined) {
            window.addEventListener('orientationchange', function(e) {
                self.trigger('window:orientation', e);
                // NOTE: There's built-in aliases for 'landscape' and 'portrait'
                if (Math.abs(window.orientation) === 90) {
                    self.trigger('window:orientation:landscape', e);
                } else {
                    self.trigger('window:orientation:portrait', e);
                }
            }, false);
        }
    }
    self.init(self);
};

HumanInput.plugins = [];
// Setup our default listenEvents
if (window.PointerEvent) { // If we have Pointer Events we don't need mouse/touch
    HumanInput.defaultListenEvents = defaultEvents.concat(pointerEvents);
} else {
    HumanInput.defaultListenEvents = defaultEvents.concat(mouseTouchEvents);
}

HumanInput.noop = noop;
HumanInput.prototype.init = function(self) {
    /**:HumanInput.prototype.init(self)

    Initializes the HumanInput library and can also be used at any time to
    reset everything.
    */
    var i, plugin, initResult, attr;
    self.scope = ''; // The current event scope (empty string means global scope)
    self.down = []; // Tracks which keys/buttons are currently held down (pressed)
    self.modifiers = {}; // Tracks (traditional) modifier keys
    self.seqBuffer = []; // For tracking sequences like 'a b c'
    self.touches = {}; // Tracks ongoing touch events
    self.state = {}; // Stores temporary/fleeting state information
    // Built-in aliases
    self.aliases = {
        tap: 'click',
        middleclick: 'pointer:middle',
        rightclick: 'pointer:right',
        doubleclick: 'dblclick', // For consistency with naming
        tripleclick: Array(4).join('pointer:left ').trim(),
        quadrupleclick: Array(5).join('pointer:left ').trim(),
        konami: 'up up down down left right left right b a enter',
        portrait: 'window:orientation:portrait',
        landscape: 'window:orientation:landscape',
        hulksmash: 'faceplant'
    };
    self.events = {}; // Tracks functions attached to events
    finishedKeyCombo = false; // Internal state tracking of keyboard combos like ctrl-c
    downState = []; // Used to keep keydown and keyup events in sync when the 'key' gets replaced inside the keypress event
    seqTimer = null; // Make it 'like new' :)
    // Apply some post-instantiation settings
    if (self.settings.disableSequences) {
        self._handleSeqEvents = noop;
    }
    if (self.settings.disableSelectors) {
        self._handleSelectors = noop;
    }
    // This tries to emulate fullscreen detection since the Fullscreen API doesn't friggin' work when the user presses F11 or selects fullscreen from the menu...
    if (self.elem === window) {
        self.on('window:resize', function() {
            // NOTE: This may not work with multiple monitors
            if (window.outerWidth === screen.width && window.outerHeight === screen.height) {
                self.state.fullscreen = true;
                self.trigger('fullscreen', true);
            } else if (self.state.fullscreen) {
                self.state.fullscreen = false;
                self.trigger('fullscreen', false);
            }
        });
    }
    // Set or reset our event listeners
    self.off('hi:pause');
    self.on('hi:pause', function() {
        self.log.debug(self.l('Pause: Removing event listeners'));
        self.settings.listenEvents.forEach(function(event) {
            var opts = self.settings.eventOptions[event] || true;
            if (_.isFunction(self['_'+event])) {
                self.elem.removeEventListener(event, self['_'+event], opts);
            }
        });
    });
    self.off(['hi:initialized', 'hi:resume']); // In case of re-init
    self.on(['hi:initialized', 'hi:resume'], function() {
        self.log.debug('HumanInput Version: ' + self.__version__);
        self.log.debug(self.l('Start/Resume: Addding event listeners'), self.settings.listenEvents);
        self.settings.listenEvents.forEach(function(event) {
            var opts = self.settings.eventOptions[event] || true;
            if (_.isFunction(self['_'+event])) {
                self.elem.removeEventListener(event, self['_'+event], opts);
                self.elem.addEventListener(event, self['_'+event], opts);
            } else { // No function for this event; use the generic event handler and hope for the best
                self['_'+event] = self._genericEvent.bind(self, self.elem.name);
                self.elem.addEventListener(event, self['_'+event], opts);
            }
        });
    });
// NOTE: We *may* have to deal with control codes at some point in the future so I'm leaving this here for the time being:
//     self.controlCodes = {0: "NUL", 1: "DC1", 2: "DC2", 3: "DC3", 4: "DC4", 5: "ENQ", 6: "ACK", 7: "BEL", 8: "BS", 9: "HT", 10: "LF", 11: "VT", 12: "FF", 13: "CR", 14: "SO", 15: "SI", 16: "DLE", 21: "NAK", 22: "SYN", 23: "ETB", 24: "CAN", 25: "EM", 26: "SUB", 27: "ESC", 28: "FS", 29: "GS", 30: "RS", 31: "US"};
//     for (var key in self.controlCodes) { self.controlCodes[self.controlCodes[key]] = key; } // Also add the reverse mapping
// BEGIN CODE THAT IS ONLY NECESSARY FOR SAFARI
    // NOTE: These location-based keyMaps will only be necessary as long as Safari lacks support for KeyboardEvent.key.
    //       Some day we'll be able to get rid of these (hurry up Apple!).
    self.keyMaps = { // NOTE: 0 will be used if not found in a specific location
        // These are keys that we can only pick up on keydown/keyup and have no
        // straightforward mapping from their keyCode/which values:
        0: { // KeyboardEvent.DOM_KEY_LOCATION_STANDARD
            'Backspace': 8,
            'Tab': 9,
            'Enter': 13,
            'Shift': 16,
            'Control': 17,
            'Alt': 18,
            'Pause': 19,
            'CapsLock': 20,
            'Escape': 27,
            'Space': 32,
            'PageUp': 33,
            'PageDown': 34,
            'End': 35,
            'Home': 36,
            'ArrowLeft': 37,
            'Left': 37,
            'ArrowUp': 38,
            'Up': 38,
            'ArrowRight': 39,
            'Right': 39,
            'ArrowDown': 40,
            'Down' : 40,
            'PrintScreen': 42,
            'Insert': 45,
            'Delete': 46,
            'Semicolon': 59,
            '=': 61,
            'OS': 92,
            'Select': 93,
            'NumLock': 144,
            'ScrollLock': 145,
            'VolumeDown': 174,
            'VolumeUp': 175,
            'MediaTrackPrevious': 177,
            'MediaPlayPause': 179,
            ',': 188,
            '-': 189,
            '.': 190,
            '/': 191,
            '`': 192,
            '[': 219,
            '\\': 220,
            ']': 221,
            "'": 222,
            'AltGraph': 225,
            'Compose': 229
        },
        1: { // KeyboardEvent.DOM_LOCATION_LEFT
            'ShiftLeft': 16,
            'ControlLeft': 17,
            'AltLeft': 18,
            'OSLeft': 91
        },
        2: { // KeyboardEvent.DOM_LOCATION_RIGHT
            'ShiftRight': 16,
            'ControlRight': 17,
            'AltRight': 18,
            'OSRight': 92
        }
    };
    if (self.settings.uniqueNumpad) {
        self.keyMaps[3] = { // KeyboardEvent.DOM_LOCATION_NUMPAD
            'NumpadMultiply': 106,
            'NumpadAdd': 107,
            'NumpadSubtract': 109,
            'NumpadDecimal': 46,
            'Slash': 111
        }
    } else {
        self.keyMaps[3] = { // KeyboardEvent.DOM_LOCATION_NUMPAD
            '*': 106,
            '+': 107,
            '-': 109,
            '.': 46,
            '/': 111
        }
    }
    // The rest of the keyMaps are straightforward:
    // 1 - 0
    for (i = 48; i <= 57; i++) {
        self.keyMaps[0][i] = '' + (i - 48);
    }
    // A - Z
    for (i = 65; i <= 90; i++) {
        self.keyMaps[0][i] = String.fromCharCode(i);
    }
    // NUM_PAD_0 - NUM_PAD_9
    for (i = 96; i <= 105; i++) {
        self.keyMaps[3][i] = 'Numpad' + (i - 96);
    }
    // F1 - F12
    for (i = 112; i <= 123; i++) {
        self.keyMaps[0][i] = 'F' + (i - 112 + 1);
    }
    // Extra Mac keys:
    if (MACOS) {
        var attr, macSpecials = {
            3: 'Enter',
            63289: 'NumpadClear',
            63276: 'PageUp',
            63277: 'PageDown',
            63275: 'End',
            63273: 'Home',
            63234: 'ArrowLeft',
            63232: 'ArrowUp',
            63235: 'ArrowRight',
            63233: 'ArrowDown',
            63302: 'Insert',
            63272: 'Delete'
        };
        for (attr in macSpecials) { self.keyMaps[0][attr] = macSpecials[attr]; }
        for (i = 63236; i <= 63242; i++) {
            self.keyMaps[0][i] = 'F' + (i - 63236 + 1);
        }
    }
    // Make keyMaps work both forward and in reverse:
    for (i=0; i<=3; i++) {
        Object.keys(self.keyMaps[i]).forEach(function(key) {
            if (key.length > 1 && (!(isNaN(key)))) {
                key = parseInt(key);
            }
            self.keyMaps[i][self.keyMaps[i][key]] = key;
        });
    }
// END CODE THAT IS ONLY NECESSARY FOR SAFARI
    // Enable plugins
    if (HumanInput.plugins.length) {
        for (i=0; i < HumanInput.plugins.length; i++) {
            plugin = new HumanInput.plugins[i](self);
            self.log.debug(self.l('Initializing Plugin:'), plugin.__name__);
            if (_.isFunction(plugin.init)) {
                initResult = plugin.init(self);
                for (attr in initResult.exports) {
                    self[attr] = initResult.exports[attr];
                }
            }
        }
    }
    self.trigger('hi:initialized', self);
};

HumanInput.prototype.logger = function(lvl, prefix) {
    var self = this,
        fallback = function() {
            var args = _.toArray(arguments);
            args[0] = prefix + self.levels[level] + ' ' + args[0];
            if (_.isFunction(window.console.log)) {
                window.console.log.apply(window.console, args);
            }
        },
        writeErr = fallback,
        writeWarn = fallback,
        writeInfo = fallback,
        writeDebug = fallback,
        write = function(level) {
            var args = Array.prototype.slice.call(arguments, 1);
            if (prefix.length) { args.unshift(prefix); }
            if (level == 40 && self.logLevel <= 40) {
                writeErr.apply(window.console, args);
            } else if (level == 30 && self.logLevel <= 30) {
                writeWarn.apply(window.console, args);
            } else if (level == 20 && self.logLevel <= 20) {
                writeInfo.apply(window.console, args);
            } else if (level == 10 && self.logLevel <= 10) {
                writeDebug.apply(window.console, args);
            }
        };
    prefix = prefix || '';
    self.levels = {
        40: 'ERROR', 30: 'WARNING', 20: 'INFO', 10: 'DEBUG',
        'ERROR': 40, 'WARNING': 30, 'INFO': 20, 'DEBUG': 10
    };
    if (_.isFunction(window.console.error)) { writeErr = window.console.error }
    if (_.isFunction(window.console.warn)) { writeWarn = window.console.warn }
    if (_.isFunction(window.console.info)) { writeInfo = window.console.info }
    if (_.isFunction(window.console.debug)) { writeDebug = window.console.debug }
    self.setLevel = function(level) {
        level = level.toUpperCase();
        self.error = _.partial(write, 40);
        self.warn = _.partial(write, 30);
        self.info = _.partial(write, 20);
        self.debug = _.partial(write, 10);
        self.logLevel = level;
        if (isNaN(level)) { self.logLevel = level = self.levels[level]; }
        // These conditionals are just a small performance optimization:
        if (level > 40) { self.error = noop; }
        if (level > 30) { self.warn = noop; }
        if (level > 20) { self.info = noop; }
        if (level > 10) { self.debug = noop; }
    };
    self.setLevel(lvl);
};

HumanInput.prototype.pushScope = function(scope) {
    /**:HumanInput.pushScope(scope)

    Pushes the given *scope* into HumanInput.scope.  Examples::

        > HI = HumanInput(window);
        > HI.pushScope('foo');
        > HI.scope;
        'foo:'
        > HI.pushScope('bar');
        > HI.scope;
        'foo.bar:'
    */
    if (this.scope.length) {
        this.scope = this.scope.slice(0, -1) + '.' + scope + ':';
    } else {
        this.scope = scope + ':';
    }
};

HumanInput.prototype.popScope = function() {
    /**:HumanInput.popScope()

    Pops (and returns) the last scope out of HumanInput.scope.  Examples::

        > HI = HumanInput(window);
        > HI.scope;
        'foo.bar:'
        > HI.popScope();
        > HI.scope;
        'foo:'
        > HI.popScope();
        > HI.scope;
        ''
    */
    if (this.scope.length) {
        this.scope = this.scope.slice(0, -1).split('.').slice(0, -1).join('.') + ':';
    }
    if (this.scope == ':') { this.scope = ''; }
};

HumanInput.prototype.pause = function() {
    /**:HumanInput.pause()

    Halts all triggering of events until :js:func:`HumanInput.resume` is called.
    */
    this.state.paused = true;
    this.trigger('hi:pause', this);
};

HumanInput.prototype.resume = function() {
    /**:HumanInput.resume()

    Restarts triggering of events after a call to :js:func:`HumanInput.pause`.
    */
    this.state.paused = false;
    this.trigger('hi:resume', this);
};

HumanInput.prototype._seqSlicer = function(seq) {
    /**:HumanInput._seqSlicer(seq)

    Returns all possible combinations of sequence events given a string of keys.  For example::

        'a b c d'

    Would return:

        ['a b c d', 'b c d', 'c d']

    .. note:: There's no need to emit 'a b c' since it would have been emitted before the 'd' was added to the sequence.
    */
    var events = [], i, s, joined;
    // Split by spaces but ignore spaces inside quotes:
    seq = seq.split(/ +(?=(?:(?:[^"]*"){2})*[^"]*$)/g);
    for (i=0; i < seq.length-1; i++) {
        s = seq.slice(i);
        joined = s.join(' ');
        if (events.indexOf(joined) == -1) {
            events.push(joined);
        }
    }
    return events;
};

HumanInput.prototype._sortEvents = function(events) {
    var i, priorities = this.MODIFIERPRIORITY;
    // Basic (case-insensitive) lexicographic sorting first
    events.sort(function (a, b) {
        return a.toLowerCase().localeCompare(b.toLowerCase());
    });
    // Now sort by length
    events.sort(function (a, b) { return b.length - a.length; });
    // Now apply our special sorting rules
    events.sort(function(a, b) {
        a = a.toLowerCase();
        b = b.toLowerCase();
        if (a in priorities) {
            if (b in priorities) {
                if (priorities[a] > priorities[b]) { return -1 }
                else if (priorities[a] < priorities[b]) { return 1 }
                else { return 0 }
            }
            return -1;
        } else if (b in priorities) {
            return 1;
        } else {
            return 0;
        }
    });
    return events;
};

HumanInput.prototype._normCombo = function(event) {
    /**:HumanInput._normCombo(event)

    Returns normalized (sorted) event combos (i.e. events with '-').  When given things like, '⌘-Control-A' it would return 'ctrl-os-a'.

    It replaces alternate key names such as '⌘' with their internally-consistent versions ('os') and ensures consistent (internal) ordering using the following priorities:

    1. ctrl
    2. shift
    3. alt
    4. os
    5. length of event name
    6. Lexicographically

    Events will always be sorted in that order.
    */
    var self = this, i,
        events = event.split('-'), // Separate into parts
        elen = events.length,
        ctrlCheck = function(key) {
            if (key == 'control') { // This one is simpler than the others
                return self.ControlKeyEvent;
            }
            return key;
        },
        altCheck = function(key) {
            for (var j=0; j < self.AltAltNames.length; j++) {
                if (key == self.AltAltNames[j]) {
                    return self.AltKeyEvent;
                }
            }
            return key;
        },
        osCheck = function(key) {
            for (var j=0; j < self.AltOSNames.length; j++) {
                if (key == self.AltOSNames[j]) {
                    return self.OSKeyEvent;
                }
            }
            return key;
        };
    // First ensure all the key names are consistent
    for (i=0; i < elen; i++) {
        if (events[i] == '') { // Was a literal -
            events[i] == '-';
        }
        events[i] = events[i].toLowerCase();
        events[i] = ctrlCheck(events[i]);
        events[i] = altCheck(events[i]);
        events[i] = osCheck(events[i]);
    }
    // Now sort them
    self._sortEvents(events);
    return events.join('-');
};

HumanInput.prototype.mouse = function(e) {
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
        if (e.button == 0) { m.left = true; m.buttonName = 'left'; }
        else if (e.button == 1) { m.middle = true; m.buttonName = 'middle'; }
        else if (e.button == 2) { m.right = true; m.buttonName = 'right'; }
        else if (e.button == 3) { m.back = true; m.buttonName = 'back'; }
        else if (e.button == 4) { m.forward = true; m.buttonName = 'forward'; }
        else if (e.button == 5) { m.forward = true; m.buttonName = 'eraser'; }
        else { m.buttonName = e.button; }
    }
    m.button = e.button; // Save original button number
    return m;
};


// Export as CommonJS module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HumanInput;
}
// Everything else
if (typeof define === "function" && define.amd) {
    define([], function() { return HumanInput; });
} else if (typeof exports !== "undefined" && exports !== null) {
    exports.HumanInput = HumanInput;
} else { // Export as a regular global
    window.HumanInput = HumanInput;
}

}).call(this);

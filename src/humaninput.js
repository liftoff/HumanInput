/**
 * humaninput.js - HumanInput is a Human-generated event library for humans (keyboard, mouse, gesture, touch, gamepad, speech recognition and more)
 * Copyright (c) 2016, Dan McDougall
 * @link https://github.com/liftoff/HumanInput
 * @license Apache-2.0
 */

import { polyfill } from './polyfills';
polyfill(); // Won't do anything unless we execute it

import { getNode, noop, isFunction, getLoggingName, handlePreventDefault, cloneArray, arrayCombinations } from './utils';
import { Logger } from './logger';
import { EventHandler } from './events';
// Remove this line if you don't care about Safari keyboard support:
import { keyMaps } from './keymaps'; // Removing this saves ~1.3k in minified output!

// Sandbox-side variables and shortcuts
// const window = this;
const _HI = window.HumanInput; // For noConflict
const screen = window.screen;
const document = window.document;
const OSKEYS = ['OS', 'OSLeft', 'OSRight'];
const CONTROLKEYS = ['Control', 'ControlLeft', 'ControlRight'];
const ALTKEYS = ['Alt', 'AltLeft', 'AltRight'];
const SHIFTKEYS = ['Shift', 'ShiftLeft', 'ShiftRight', '⇧'];
const MODPRIORITY = {}; // This gets filled out below
const ControlKeyEvent = 'ctrl';
const ShiftKeyEvent = 'shift';
const AltKeyEvent = 'alt';
const OSKeyEvent = 'os';
const AltAltNames = ['option', '⌥'];
const AltOSNames = ['meta', 'win', '⌘', 'cmd', 'command'];

// Original defaultEvents (before modularization)
// var defaultEvents = [
//     "blur", "click", "compositionend", "compositionstart", "compositionupdate",
//     "contextmenu", "copy", "cut", "focus", "hold", "input", "keydown", "keypress",
//     "keyup", "pan", "paste", "reset", "scroll", "select", "submit", "wheel"];

// NOTE: "blur", "reset", and "submit" are all just handled via _genericEvent()
var defaultEvents = [
    "blur", "click", "compositionend", "compositionstart", "compositionupdate",
    "contextmenu", "focus", "hold", "input", "keydown", "keypress",
    "keyup", "reset", "submit"];

var instances = [];
var plugins = [];
var plugin_instances = [];

// Lesser state tracking variables
var lastDownLength = 0;
var finishedKeyCombo = false; // Used with combos like ctrl-c

// Check if the browser supports KeyboardEvent.key:
var KEYSUPPORT = false;
if (Object.keys(window.KeyboardEvent.prototype).includes('key')) {
    KEYSUPPORT = true;
}

class HumanInput extends EventHandler {

// Core API functions

    constructor(elem, settings) {
        var i; // Just a byte saver
        // These are the defaults:
        var defaultSettings = {
            listenEvents: HumanInput.defaultListenEvents,
            addEvents: [],
            removeEvents: [],
            eventOptions: {},
            noKeyRepeat: true,
            sequenceTimeout: 3500,
            holdInterval: 250,
            maxSequenceBuf: 12,
            uniqueNumpad: false,
            swipeThreshold: 50,
            moveThreshold: 5,
            disableSequences: false,
            disableSelectors: false,
            eventMap: {},
            translate: noop,
            logLevel: 'INFO'
        };
        // Apply settings over the defaults:
        for (var item in settings) {
            defaultSettings[item] = settings[item];
        }
        settings = defaultSettings;
        var log = new Logger(settings.logLevel, getLoggingName(elem));
        super(log);
// Interestingly, you can't just return an existing instance if you haven't called super() yet
// (may be a WebPack thing) which is why this is down here and not at the top of the constructor:
        if (instances.length) {
            // Existing instance(s); check them for duplicates on the same element
            for (let inst in instances) {
                if (instances[inst].elem === elem) {
                    return instances[inst]; // Enforce singleton per element (efficiency!)
                }
            }
        }
        instances.push(this); // Used when enforcing singletons
        var self = this;
        var listenEvents = settings.listenEvents;
        // For localization of our few strings:
        self.l = settings.translate;
        listenEvents = listenEvents.concat(settings.addEvents);
        if (settings.removeEvents.length) {
            listenEvents = listenEvents.filter(function(item) {
                return (!settings.removeEvents.includes(item));
            });
        }

        self.settings = settings;
        self.elem = getNode(elem || window);
        self.Logger = Logger; // In case someone wants to use it separately
        self.log = log;
        self.VERSION = "1.1.0-modular";
        // NOTE: Most state-tracking variables are set inside HumanInput.init()

        // Setup the modifier priorities so we can maintain a consistent ordering of combo events
        var ctrlKeys = CONTROLKEYS.concat(['ctrl']);
        var altKeys = ALTKEYS.concat(AltAltNames);
        var osKeys = OSKEYS.concat(AltOSNames);
        for (i=0; i < ctrlKeys.length; i++) {
            MODPRIORITY[ctrlKeys[i].toLowerCase()] = 5;
        }
        for (i=0; i < SHIFTKEYS.length; i++) {
            MODPRIORITY[SHIFTKEYS[i].toLowerCase()] = 4;
        }
        for (i=0; i < altKeys.length; i++) {
            MODPRIORITY[altKeys[i].toLowerCase()] = 3;
        }
        for (i=0; i < osKeys.length; i++) {
            MODPRIORITY[osKeys[i].toLowerCase()] = 2;
        }

        // This needs to be set early on so we don't get errors in the early trigger() calls:
        self.eventMap = {forward: {}, reverse: {}};
        // NOTE: keyMaps are only necessary for Safari
        self.keyMaps = {0: {}, 1: {}, 2: {}};
        if (keyMaps) { self.keyMaps = keyMaps; }

        // Apply some post-instantiation settings
        if (settings.disableSequences) {
            self._handleSeqEvents = noop;
        }
        if (settings.disableSelectors) {
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

        // Reset states if the user alt-tabs away (or similar)
        self.on('window:blur', self._resetStates);

        // These functions need to be bound to work properly ('this' will be window or self.elem which isn't what we want)
        ['_composition', '_contextmenu', '_holdCounter',
         '_keydown', '_keypress', '_keyup', 'trigger'].forEach(function(event) {
            self[event] = self[event].bind(self);
        });

        // Take care of our multi-function functions :)
        self._compositionstart = self._composition;
        self._compositionupdate = self._composition;
        self._compositionend = self._composition;

        // Start er up!
        self.init();
    }

    get instances() {
        return instances;
    }

    get plugins() {
        return plugins;
    }

    map(eventMap) {
        /**:HumanInput.map(eventMap)

        This function will update ``this.eventMap`` with the given *obj*'s keys and values and then with it's values and keys (so lookups can be performed in reverse).
        */
        for (var item in eventMap) {
            // Create both forward and reverse mappings
            this.eventMap.forward[item] = eventMap[item];
            this.eventMap.reverse[eventMap[item]] = item;
        }
    }

    init() {
        var self = this;
        var settings = self.settings;
        var listenEvents = settings.listenEvents;
        var debug = self.log.debug;
        if (self.eventCount) { // It already exists/reset scenario
            // This is so a reset can be detected and handled properly by external stuff
            self.trigger('hi:reset');
        }
        self.scope = ''; // The current event scope (empty string means global scope)
        self.state = { // Stores temporary/fleeting state information
            down: [], // Tracks which keys/buttons are currently held down (pressed)
            downAlt: [], // Used to keep keydown and keyup events in sync when the 'key' gets replaced inside the keypress event
            holdStart: null, // Tracks the start time of hold events
            holdArgs: [], // Keeps track of arguments that will be passed to hold events
            seqBuffer: [] // For tracking sequences like 'a b c'
        };
        self.events = {}; // Tracks functions attached to events
        // The eventMap can be used to change the name of triggered events (e.g. 'w': 'forward')
        self.eventMap = {forward: {}, reverse: {}};
        self.map(settings.eventMap); // Apply any provided eventMap
        // NOTE:  Possible new feature:  Transform events using registerable functions:
//         self.transforms = []; // Used for transforming event names
        finishedKeyCombo = false; // Internal state tracking of keyboard combos like ctrl-c

        // Enable plugins
        for (let i=0; i < plugins.length; i++) {
            // Instantiate the plugin (if not already)
            if (!(plugin_instances[i] instanceof plugins[i])) {
                plugin_instances[i] = new plugins[i](self);
            }
            let plugin = plugin_instances[i];
            debug(self.l('Initializing Plugin:'), plugin.NAME);
            if (isFunction(plugin.init)) {
                let initResult = plugin.init(self);
                for (let attr in initResult.exports) {
                    self[attr] = initResult.exports[attr];
                }
            }
        }

        // Set or reset our event listeners (enables changing built-in events at a later time)
        self.off('hi:pause');
        self.on('hi:pause', function() {
            debug(self.l('Pause: Removing event listeners ', listenEvents));
            listenEvents.forEach(function(event) {
                var opts = settings.eventOptions[event] || true;
                if (isFunction(self['_'+event])) {
                    self.elem.removeEventListener(event, self['_'+event], opts);
                }
            });
        });
        self.off(['hi:initialized', 'hi:resume']); // In case of re-init
        self.on(['hi:initialized', 'hi:resume'], function() {
            debug('HumanInput Version: ' + self.VERSION);
            debug(self.l('Start/Resume: Addding event listeners'), listenEvents);
            listenEvents.forEach(function(event) {
                var opts = settings.eventOptions[event] || true;
                if (isFunction(self['_'+event])) {
                    // TODO: Figure out why removeEventListener isn't working
                    self.elem.removeEventListener(event, self['_'+event], opts);
                    self.elem.addEventListener(event, self['_'+event], opts);
                } else { // No function for this event; use the generic event handler and hope for the best
                    self['_'+event] = self._genericEvent.bind(self, '');
                    self.elem.addEventListener(event, self['_'+event], opts);
                }
            });
        });

        self.trigger('hi:initialized', self);
    }

    noConflict() {
        window.HumanInput = _HI;
        return HumanInput;
    }

// Core *internal* API functions

    _resetStates() {
        // This gets called after the sequenceTimeout to reset the state of all keys and modifiers (and a few other things)
        // Besides the obvious usefulness of this with sequences, it also serves as a fallback mechanism if something goes
        // wrong with state tracking.
        // NOTE: As long as something is 'down' this won't (normally) be called because the sequenceTimeout gets cleared on 'down' events and set on 'up' events.
        var state = this.state;
        state.seqBuffer = [];
        state.down = [];
        state.downAlt = [];
        state.holdArgs = [];
        lastDownLength = 0;
        finishedKeyCombo = false;
        clearTimeout(state.holdTimeout);
        this.trigger('hi:resetstates');
    }

    _resetSeqTimeout() {
        // Ensure that the seqBuffer doesn't get emptied (yet):
        var self = this;
        clearTimeout(self.state.seqTimer);
        self.state.seqTimer = setTimeout(function() {
            self.log.debug(self.l('Resetting event sequence states due to timeout'));
            self._resetStates();
        }, self.settings.sequenceTimeout);
    }

    _genericEvent(prefix, e) {
        // Can be used with any event handled via addEventListener() to trigger a corresponding event in HumanInput
        var notFiltered = this.filter(e), results;
        if (notFiltered) {
            if (prefix.type) { e = prefix; prefix = null; }
            if (prefix) { prefix = prefix + ':'; } else { prefix = ''; }
            results = this.trigger(this.scope + prefix + e.type, e);
            if (e.target) {
                // Also triger events like '<event>:#id' or '<event>:.class':
                results = results.concat(this._handleSelectors(prefix + e.type, e));
            }
            handlePreventDefault(e, results);
        }
    }

    _sortEvents(events) {
        /**:HumanInput._sortEvents(events)

        Sorts and returns the given *events* array (which is normally just a copy of ``this.state.down``) according to HumanInput's event sorting rules.
        */
        var priorities = MODPRIORITY;
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
                    if (priorities[a] > priorities[b]) { return -1; }
                    else if (priorities[a] < priorities[b]) { return 1; }
                    else { return 0; }
                }
                return -1;
            } else if (b in priorities) {
                return 1;
            } else {
                return 0;
            }
        });
        return events;
    }

    _handleSelectors(eventName) {
        // Triggers the given *eventName* using various combinations of information taken from the given *e.target*.
        var results = [];
        var args = Array.from(arguments).slice(1);
        var toBind = this; // A fallback
        var constructedEvent;
        if (args[0] && args[0].target) {
            toBind = args[0].target;
            if (toBind.id) {
                constructedEvent = eventName + ':#' + toBind.id;
                results = this.trigger.apply(toBind, [constructedEvent].concat(args));
            }
            if (toBind.classList && toBind.classList.length) {
                for (var i=0; i<toBind.classList.length; i++) {
                    constructedEvent = eventName + ':.' + toBind.classList.item(i);
                    results = results.concat(this.trigger.apply(toBind, [constructedEvent].concat(args)));
                }
            }
        }
        return results;
    }

    _addDown(event, alt) {
        // Adds the given *event* to this.state.down and this.state.downAlt to ensure the two stay in sync in terms of how many items they hold.
        // If an *alt* event is given it will be stored in this.state.downAlt explicitly
        var state = this.state;
        var index = state.down.indexOf(event);
        if (index == -1) {
            index = state.downAlt.indexOf(event);
        }
        if (index == -1 && alt) {
            index = state.downAlt.indexOf(alt);
        }
        if (index == -1) {
            state.down.push(event);
            if (alt) {
                state.downAlt.push(alt);
            } else {
                state.downAlt.push(event);
            }
        }
        this.trigger('hi:adddown', event, alt); // So plugins and modules can do stuff when this happens
    }

    _removeDown(event) {
        // Removes the given *event* from this.state.down and this.state.downAlt (if found); keeping the two in sync in terms of indexes
        var self = this;
        var state = self.state;
        var settings = self.settings;
        var down = state.down;
        var downAlt = state.downAlt;
        var index = state.down.indexOf(event);
        clearTimeout(state.holdTimeout);
        if (index === -1) {
            // Event changed between 'down' and 'up' events
            index = downAlt.indexOf(event);
        }
        if (index === -1) { // Still no index?  Try one more thing: Upper case
            index = downAlt.indexOf(event.toUpperCase()); // Handles the situation where the user releases a key *after* a Shift key combo
        }
        if (index !== -1) {
            down.splice(index, 1);
            downAlt.splice(index, 1);
        }
        lastDownLength = down.length;
        if (settings.listenEvents.includes('hold')) {
            state.holdArgs.pop();
            state.heldTime = settings.holdInterval;
            state.holdStart = Date.now(); // This needs to be reset whenever this.state.down changes
            if (down.length) {
                // Continue 'hold' events for any remaining 'down' events
                state.holdTimeout = setTimeout(this._holdCounter, settings.holdInterval);
            }
        }
        this.trigger('hi:removedown', event); // So plugins and modules can do stuff when this happens
    }

    _doDownEvent(event) {
        /*
            Adds the given *event* to this.state.down, calls this._handleDownEvents(), removes the event from this.state.down, then returns the triggered results.
            Any additional arguments after the given *event* will be passed to this._handleDownEvents().
        */
        var self = this;
        var args = Array.from(arguments).slice(1);
        self._addDown(event);
        var results = self._handleDownEvents.apply(self, args);
        self._handleSeqEvents(args[0]); // args[0] will be the browser event
        self._removeDown(event);
        return results;
    }

    _keyEvent(key) {
        // Given a *key* like 'ShiftLeft' returns the "official" key event or just the given *key* in lower case
        if (CONTROLKEYS.includes(key)) {
            return ControlKeyEvent;
        } else if (ALTKEYS.includes(key)) {
            return AltKeyEvent;
        } else if (SHIFTKEYS.includes(key)) {
            return ShiftKeyEvent;
        } else if (OSKEYS.includes(key)) {
            return OSKeyEvent;
        } else {
            return key.toLowerCase();
        }
    }

// NOTE: Context menu support can't be modularized (see note below for details)
    _contextmenu(e) {
        if (this.filter(e)) {
            var results = this._triggerWithSelectors(e.type, [e]);
            /* NOTE: Unless the contextmenu is cancelled (i.e. preventDefault) we need to ensure that we reset all 'down' events.
               The reason for this is because when the context menu comes up in the browser it immediately loses track of all
               keys/buttons just like if the user were to alt-tab to a different application; the 'up' events will never fire.
            */
            if (!handlePreventDefault(e, results)) {
                this._resetStates();
            }
        }
    }

// NOTE:  Possible new feature:
//     _transform(event) {
//         /**:HumanInput._transform()
//
//         Iterates over all the functions registered in ``this.transforms`` passing the given *event* and returns the result.
//         */
//         for (let renamer in this.transforms) {
//             event = renamer(event);
//         }
//         return event;
//     }

    _handleShifted(down) {
        /* A DRY function to remove the shift key from *down* if warranted (e.g. just ['!'] instead of ['ShiftLeft', '!']).  Returns true if *down* was modified.

        Note that *down* should be a copy of ``this.state.down`` and not the actual ``this.state.down`` array.
        */
        var self = this;
        var shifted;
        var lastItemIndex = down.length - 1;
        var shiftKeyIndex = -1;
        for (let i=0; i < down.length; i++) {
            shiftKeyIndex = down[i].indexOf('Shift');
            if (shiftKeyIndex != -1) { break; }
        }
        if (shiftKeyIndex != -1) {
            // The last key in the 'down' array is all we care about...
            // Use the difference between the 'key' and 'code' (aka the 'alt' name) to detect chars that require shift but aren't uppercase:
            if (down[lastItemIndex] != self.state.downAlt[lastItemIndex]) {
                down.splice(shiftKeyIndex, 1); // Remove the shift key
                return true; // We're done here
            }
        }
    }

    _handleDownEvents() {
        var self = this;
        var settings = self.settings;
        var state = self.state;
        var events = self._downEvents();
        var results = [];
        var args = Array.from(arguments);
        for (let i=0; i < events.length; i++) {
            results = results.concat(this._triggerWithSelectors(events[i], args));
        }
        if (settings.listenEvents.includes('hold')) {
            state.holdArgs.push(args);
            state.heldTime = settings.holdInterval; // Restart it
            state.holdStart = Date.now();
            // Start the 'hold:' counter! If no changes to this.state.down, fire a hold:<n>:<event> event for every second the down events are held
            clearTimeout(state.holdTimeout); // Just in case
            state.holdTimeout = setTimeout(self._holdCounter, settings.holdInterval);
        }
        return results;
    }

    _handleSeqEvents(e) {
        // NOTE: This function should only be called when a button or key is released (i.e. when state changes to UP)
        var self = this;
        var state = self.state;
        var seqBuffer = state.seqBuffer;
        var results = [];
        var down = state.down.slice(0);
        if (lastDownLength < down.length) { // User just finished a combo (e.g. ctrl-a)
            if (self.sequenceFilter(e)) {
                self._handleShifted(down);
                self._sortEvents(down);
                seqBuffer.push(down);
                if (seqBuffer.length > self.settings.maxSequenceBuf) {
                    // Make sure it stays within the specified max
                    seqBuffer.shift();
                }
                if (seqBuffer.length > 1) {
                    // Trigger all combinations of sequence buffer events
                    var combos = self._seqCombinations(seqBuffer);
                    for (let i=0; i<combos.length; i++) {
                        let sliced = self._seqSlicer(combos[i]);
                        for (let j=0; j < sliced.length; j++) {
                            results = results.concat(self.trigger(self.scope + sliced[j], self));
                        }
                    }
                    if (results.length) {
                    // Reset the sequence buffer on matched event so we don't end up triggering more than once per sequence
                        seqBuffer = [];
                    }
                }
            }
        }
        this._resetSeqTimeout();
    }

    _normSpecial(location, key, code) {
        // Just a DRY function for keys that need some extra love
        if (key == ' ') { // Spacebar
            return code; // The code for spacebar is 'Space'
        }
        if (code.includes('Left') || code.includes('Right')) {
            // Use the left and right variants of the name as the 'key'
            key = code; // So modifiers can be more specific
        } else if (this.settings.uniqueNumpad && location === 3) {
            return 'numpad' + key; // Will be something like 'numpad5' or 'numpadenter'
        }
        if (key.startsWith('Arrow')) {
            key = key.substr(5); // Remove the 'arrow' part
        }
        return key;
    }

    _holdCounter() {
        // This function triggers 'hold' events every <holdInterval ms> when events are 'down'.
        var self = this;
        var state = self.state;
        var settings = self.settings;
        var events = self._downEvents();
        if (!events.length) { return; }
        clearTimeout(state.holdTimeout);
        var lastArg = state.holdArgs[state.holdArgs.length-1] || [];
        var realHeldTime = Date.now() - state.holdStart;
        self._resetSeqTimeout(); // Make sure the sequence buffer reset function doesn't clear out our hold times
        for (let i=0; i < events.length; i++) {
            // This is mostly so plugins and whatnot can do stuff when hold events are triggered
            self.trigger('hold', events[i], realHeldTime);
            // This is the meat of hold events:
            self._triggerWithSelectors('hold:'+state.heldTime+':'+events[i], lastArg.concat([realHeldTime]));
        }
        state.heldTime += settings.holdInterval;
        if (state.heldTime < 5001) { // Any longer than this and it probably means something went wrong (e.g. browser bug with touchend not firing)
            state.holdTimeout = setTimeout(self._holdCounter, settings.holdInterval);
        }
    }

    _triggerWithSelectors(event, args) {
        // A DRY function that triggers the given *event* normally and then via this._handleSelectors()
        var self = this;
        var results = [];
        var scopedEvent = self.scope + event;
        results = results.concat(self.trigger.apply(self, [scopedEvent].concat(args)));
        results = results.concat(self._handleSelectors.apply(self, [scopedEvent].concat(args)));
        return results;
    }

    _seqSlicer(seq) {
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
            if (events.includes(joined)) {
                events.push(joined);
            }
        }
        return events;
    }

    _seqCombinations(buffer, joinChar) {
        /**:HumanInput._seqCombinations(buffer[, joinChar])

        Returns all possible alternate name combinations of events (as an Array) for a given buffer (*buffer*) which must be an Array of Arrays in the form of::

            [['ControlLeft', 'c'], ['a']]

        The example above would be returned as an Array of strings that can be passed to :js:func:`HumanInput._seqSlicer` like so::

            ['controlleft-c a', 'ctrl-c a']

        The given *joinChar* will be used to join the characters for key combinations.

        .. note:: Events will always be emitted in lower case.  To use events with upper case letters use the 'shift' modifier (e.g. 'shift-a').  Shifted letters that are not upper case do not require the 'shift' modifier (e.g. '?').  This goes for combinations that include other modifiers (e.g. 'ctrl-#' would not be 'ctrl-shift-3').
        */
        var i, j;
        var joinChar_ = joinChar || '-';
        var replacement = cloneArray(buffer);
        var out = [];
        var temp = [];
        for (i=0; i < buffer.length; i++) {
            out.push(replacement[i].join(joinChar_).toLowerCase());
            // Normalize names (shiftleft becomes shift)
            for (j=0; j < buffer[i].length; j++) {
                replacement[i][j] = [this._keyEvent(buffer[i][j])];
            }
        }
        out = [out.join(' ')]; // Make a version that has the original key/modifier names (e.g. shiftleft)
        for (i=0; i < replacement.length; i++) {
            if (replacement[i].length) {
                temp.push(arrayCombinations(replacement[i], joinChar_));
            }
        }
        for (i=0; i < temp.length; i++) {
            temp[i] = this.eventMap.forward[temp[i]] || temp[i];
        }
        temp = temp.join(' ');
        if (temp != out[0]) { // Only if they're actually different
            out.push(temp);
        }
        return out;
    }

    _downEvents() {
        /* Returns all events that could represent the current state of ``this.state.down``.  e.g. ['shiftleft-a', 'shift-a'] but not ['shift', 'a']
        */
        var self = this;
        var events = [];
        var shiftedKey;
        var down = self.state.down.slice(0); // Make a copy because we're going to mess with it
        var downLength = down.length; // Need the original length for reference
        var unshiftedDown = self.state.downAlt.slice(0); // The 'alt' chars (from the code) represent the un-shifted form of the key
        if (downLength) {
            if (downLength === 1) {
                return self._seqCombinations([down]);
            }
            if (downLength > 1) { // Combo; may need shift key removed to generate the correct event (e.g. '!' instead of 'shift-!')
                shiftedKey = self._handleShifted(down);
                // Before sorting, fire the precise combo event
                events = events.concat(self._seqCombinations([down], '->'));
                if (shiftedKey) {
                    // Generate events for the un-shifted chars (e.g. shift->1, shift->2, etc)
                    events = events.concat(self._seqCombinations([unshiftedDown], '->'));
                }
            }
            if (down.length > 1) { // Is there more than one item *after* we may have removed shift?
                self._sortEvents(down);
                // Make events for all alternate names (e.g. 'controlleft-a' and 'ctrl-a'):
                events = events.concat(self._seqCombinations([down]));
            }
            if (shiftedKey) {
                self._sortEvents(unshiftedDown);
                events = events.concat(self._seqCombinations([unshiftedDown]));
            }
        }
        return events;
    }

    _keydown(e) {
        // NOTE: e.which and e.keyCode will be incorrect for a *lot* of keys
        //       and basically always incorrect with alternate keyboard layouts
        //       which is why we replace self.state.down[<the key>] inside _keypress()
        //       when we can (for browsers that don't support KeyboardEvent.key).
        var self = this;
        var state = self.state;
        var results;
        var keyCode = e.which || e.keyCode;
        var location = e.location || 0;
// NOTE: Should I put e.code first below?  Hmmm.  Should we allow keyMaps to override the browser's native key name if it's available?
        var code = self.keyMaps[location][keyCode] || self.keyMaps[0][keyCode] || e.code;
        var key = e.key || code;
        var event = e.type;
        var fpEvent = self.scope + 'faceplant';
        if (e.repeat && self.settings.noKeyRepeat) {
            e.preventDefault(); // Make sure keypress doesn't fire after this
            return false; // Don't do anything if key repeat is disabled
        }
        key = self._normSpecial(location, key, code);
        if (key == 'Compose') { // This indicates that the user is entering a composition
            state.composing = true;
            return;
        }
        if (!state.down.includes(key)) {
            self._addDown(key, code);
        }
        // Don't let the sequence buffer reset if the user is active:
        self._resetSeqTimeout();
        if (self.filter(e)) {
            // This is in case someone wants just on('keydown'):
            results = self._triggerWithSelectors(event, [e, key, code]);
            // Now trigger the more specific keydown:<key> event:
            results = results.concat(self._triggerWithSelectors(event += ':' + key.toLowerCase(), [e, key, code]));
            if (state.down.length > 5) { // 6 or more keys down at once?  FACEPLANT!
                results = results.concat(self.trigger(fpEvent, e)); // ...or just key mashing :)
            }
/* NOTE: For browsers that support KeyboardEvent.key we can trigger the usual
        events inside _keydown() (which is faster) but other browsers require
        _keypress() be called first to fix localized/shifted keys.  So for those
        browser we call _handleDownEvents() inside _keyup(). */
            if (KEYSUPPORT) {
                results = results.concat(self._handleDownEvents(e, key, code));
            }
            handlePreventDefault(e, results);
        }
    }
// NOTE: Use of _keypress is only necessary until Safari supports KeyboardEvent.key!
    _keypress(e) {
        // NOTE: keypress events don't always fire when modifiers are used!
        //       This means that such browsers may never get sequences like 'ctrl-?'
        var charCode = e.charCode || e.which,
            key = e.key || String.fromCharCode(charCode);
        if (!KEYSUPPORT && charCode > 47 && key.length) {
            // Replace the possibly-incorrect key with the correct one
            this.state.down.pop();
            this.state.down.push(key);
        }
    }

    _keyup(e) {
        var self = this;
        var state = self.state;
        var results;
        var keyCode = e.which || e.keyCode;
        var location = e.location || 0;
// NOTE: Should I put e.code first below?  Hmmm.  Should we allow keyMaps to override the browser's native key name if it's available?
        var code = self.keyMaps[location][keyCode] || self.keyMaps[0][keyCode] || e.code;
        var key = e.key || code;
        var event = e.type;
        key = self._normSpecial(location, key, code);
        if (!state.downAlt.length) { // Implies key states were reset or out-of-order somehow
            return; // Don't do anything since our state is invalid
        }
        if (state.composing) {
            state.composing = false;
            return;
        }
        if (self.filter(e)) {
            if (!KEYSUPPORT) {
                self._handleDownEvents(e);
            }
            // This is in case someone wants just on('keyup'):
            results = self._triggerWithSelectors(event, [e, key, code]);
            // Now trigger the more specific keyup:<key> event:
            results = results.concat(self._triggerWithSelectors(event + ':' + key.toLowerCase(), [e, key, code]));
            self._handleSeqEvents(e);
            handlePreventDefault(e, results);
        }
        // Remove the key from this.state.down even if we're filtered (state must stay accurate)
        self._removeDown(key);
    }

    _composition(e) {
        var self = this;
        var data = e.data;
        var event = 'compos';
        if (self.filter(e)) {
            let results = self._triggerWithSelectors(e.type, [e, data]);
            if (data) {
                if (e.type == 'compositionupdate') {
                    event += 'ing:"' + data + '"';
                } else if (e.type == 'compositionend') {
                    event += 'ed:"' + data + '"';
                }
                results = results.concat(self._triggerWithSelectors(event, [e]));
                handlePreventDefault(e, results);
            }
        }
    }

// Public API functions

    filter(event) {
        /**:HumanInput.filter(event)

        This function gets called before HumanInput events are triggered.  If it returns ``False`` then ``trigger()`` will not be called.

        Override this function to implement your own filter.

        .. note:: The given *event* won't always be a browser-generated event but it should always have a 'type' and 'target'.
        */
        var tagName = (event.target || event.srcElement).tagName,
            // The events we're concerned with:
            keyboardEvents = ['keydown', 'keyup', 'keypress'];
        if (event.type && keyboardEvents.includes(event.type)) {
            // Don't trigger keyboard events if the user is typing into a form
            return !(tagName == 'INPUT' || tagName == 'SELECT' || tagName == 'TEXTAREA');
        }
        return true;
    }

    sequenceFilter(event) {
        /**:HumanInput.sequenceFilter(event)

        This function gets called before HumanInput events are added to the sequence buffer.  If it returns ``False`` then the event will not be added to the sequence buffer.

        Override this function to implement your own filter.

        .. note:: The given *event* won't always be a browser-generated event but it should always have a 'type' and 'target'.
        */
        return true; // Don't filter out anything
    }

    pushScope(scope) {
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
        var self = this;
        if (self.scope.length) {
            self.scope = self.scope.slice(0, -1) + '.' + scope + ':';
        } else {
            self.scope = scope + ':';
        }
    }

    popScope() {
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
        var self = this;
        if (self.scope.length) {
            self.scope = self.scope.slice(0, -1).split('.').slice(0, -1).join('.') + ':';
        }
        if (self.scope == ':') { self.scope = ''; }
    }

    pause() {
        /**:HumanInput.pause()

        Halts all triggering of events until :js:func:`HumanInput.resume` is called.
        */
        this.state.paused = true;
        this.trigger('hi:pause', this);
    }

    resume() {
        /**:HumanInput.resume()

        Restarts triggering of events after a call to :js:func:`HumanInput.pause`.
        */
        this.state.paused = false;
        this.trigger('hi:resume', this);
    }

    startRecording() {
        /**:HumanInput.startRecording()

        Starts recording all triggered events.  The array of recorded events will be returned when :js:func:`HumanInput.stopRecording` is called.

        .. note:: You can tell if HumanInput is currently recording events by examining the ``HI.recording`` (instance) attribute (boolean).

        .. warning:: Don't leave the recording running for too long as there's no limit to how big it can get!
        */
        this.state.recording = true;
        this.state.recordedEvents = [];
    }

    stopRecording(filter) {
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
        var keystroke;
        var recordedEvents = this.state.recordedEvents;
        var regex = new RegExp(filter);
        var hasSelector = function(str) {
            return (str.includes(':#') || str.includes(':.'));
        };
        this.state.recording = false;
        if (!filter) { return recordedEvents; }
        if (filter == 'keystroke') {
            // Filter out events with selectors since we don't want those for this sort of thing:
            let filteredEvents = recordedEvents.filter(hasSelector);
            // Return the event that comes before the last 'keyup'
            regex = new RegExp('keyup');
            for (let i=0; i<filteredEvents.length; i++) {
                if (regex.test(filteredEvents[i])) { break; }
                keystroke = filteredEvents[i];
            }
            return keystroke;
        }
        // Apply the filter
        var events = recordedEvents.filter(function(item) {
            return regex.test(item);
        });
        return events;
    }

    getSelText() {
        /**:HumanInput.getSelText()

        :returns: The text that is currently highlighted in the browser.

        Example:

            HumanInput.getSelText();
            "localhost" // Assuming the user had highlighted the word, "localhost"
        */
        var txt = '';
        if (window.getSelection) {
            txt = window.getSelection();
        } else if (document.selection) {
            txt = document.selection.createRange().text;
        } else {
            return;
        }
        return txt.toString();
    }

    isDown(name) {
        /**:HumanInput.isDown(name)

        Returns ``true`` if the given *name* (string) is currently held (aka 'down' or 'pressed').  It works with any kind of key or button as well as combos such as, 'ctrl-a'.  It also works with ``this.eventMap`` if you've remapped any events (e.g. ``HI.isDown('fire') == true``).

        .. note:: Strings are used to track keys because key codes are browser and platform dependent (unreliable).
        */
        var self = this;
        var state = self.state;
        var downEvents = self._downEvents();
        name = name.toLowerCase();
        name = self.eventMap.reverse[name] || name;
        if (downEvents.includes(name)) {
            return true;
        }
        for (let i=0; i < state.down.length; i++) {
            let down = state.down[i].toLowerCase();
            let downAlt = state.downAlt[i].toLowerCase(); // In case something changed between down and up events
            if (name == down || name == downAlt) {
                return true;
            } else if (SHIFTKEYS.includes(state.down[i])) {
                if (name == ShiftKeyEvent) {
                    return true;
                }
            } else if (CONTROLKEYS.includes(state.down[i])) {
                if (name == ControlKeyEvent) {
                    return true;
                }
            } else if (ALTKEYS.includes(state.down[i])) {
                if (name == AltKeyEvent) {
                    return true;
                }
            } else if (OSKEYS.includes(state.down[i])) {
                if (name == OSKeyEvent) {
                    return true;
                }
            }
        }
        return false;
    }

    getDown() {
        /**:HumanInput.getDown()

        ...and boogie!  Returns the current state of all keys/buttons/whatever inside the ``this.state.down`` array in a user friendly format.  For example, if the user is holding down the shift, control, and 'i' this function would return 'ctrl-shift-i' (it will always match HumanInput's event ordering).  The results it returns will always be lowercase.

        .. note:: This function does not return location-specific names like 'shiftleft'.  It will always use the short name (e.g. 'shift').
        */
        var self = this;
        var down = self._sortEvents(self.state.down.slice(0));
        var trailingDash = new RegExp('-$');
        var out = '';
        for (let i=0; i < down.length; i++) {
            out += self._keyEvent(down[i]) + '-';
        }
        return out.replace(trailingDash, ''); // Remove trailing dash
    }

}

HumanInput.instances = instances; // So we can enforce singleton
HumanInput.plugins = plugins;
HumanInput.defaultListenEvents = defaultEvents;

export default HumanInput;

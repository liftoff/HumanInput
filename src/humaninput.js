/**
 * humaninput.js - HumanInput is a Human-generated event library for humans (keyboard, mouse, gesture, touch, gamepad, speech recognition and more)
 * Copyright (c) 2016, Dan McDougall
 * @link https://github.com/liftoff/HumanInput
 * @license Apache-2.0
 */

// import { polyfill } from './polyfills';
// polyfill(); // Won't do anything unless we execute it

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

// Original defaultEvents (before modularization)
// var defaultEvents = [
//     "blur", "click", "compositionend", "compositionstart", "compositionupdate",
//     "contextmenu", "copy", "cut", "focus", "hold", "input", "keydown", "keypress",
//     "keyup", "pan", "paste", "reset", "scroll", "select", "submit", "wheel"];

// NOTE: "blur", "reset", and "submit" are all just handled via _genericEvent()
var defaultEvents = [
    "blur", "click", "compositionend", "compositionstart", "compositionupdate",
    "contextmenu", "copy", "cut", "focus", "hold", "input", "keydown", "keypress",
    "keyup", "paste", "reset", "select", "submit"];

var instances = [];
var plugins = [];
var plugin_instances = [];

// Lesser state tracking variables
var lastDownLength = 0;
var finishedKeyCombo = false; // Used with combos like ctrl-c

// Check if the browser supports KeyboardEvent.key:
var KEYSUPPORT = false;
if (Object.keys(window.KeyboardEvent.prototype).indexOf('key') !== -1) {
    KEYSUPPORT = true;
}

export default class HumanInput extends EventHandler {

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
        settings = Object.assign(defaultSettings, settings);
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
        // For localization of our few strings:
        self.l = settings.translate;
        settings.listenEvents = settings.listenEvents.concat(settings.addEvents);
        if (settings.removeEvents.length) {
            settings.listenEvents = settings.listenEvents.filter(function(item) {
                return (!settings.removeEvents.includes(item));
            });
        }

        self.settings = settings;
        self.elem = getNode(elem || window);
        self.Logger = Logger; // In case someone wants to use it separately
        self.log = log;
        self.VERSION = "DEVELOPMENT BUILD DO NOT USE THIS VERSION IN PRODUCTION.  Use a version from the dist directory (https://github.com/liftoff/HumanInput/tree/master/dist)";
        // NOTE: Most state-tracking variables are set inside HumanInput.init()

        // Constants
        self.OSKEYS = ['OS', 'OSLeft', 'OSRight'],
        self.CONTROLKEYS = ['Control', 'ControlLeft', 'ControlRight'],
        self.ALTKEYS = ['Alt', 'AltLeft', 'AltRight'],
        self.SHIFTKEYS = ['Shift', 'ShiftLeft', 'ShiftRight', '⇧'],
        self.ALLMODIFIERS = self.OSKEYS.concat(self.CONTROLKEYS, self.ALTKEYS, self.SHIFTKEYS),
        self.MODPRIORITY = {}; // This gets filled out below
        self.ControlKeyEvent = 'ctrl';
        self.ShiftKeyEvent = 'shift';
        self.AltKeyEvent = 'alt';
        self.OSKeyEvent = 'os';
        self.AltAltNames = ['option', '⌥'];
        self.AltOSNames = ['meta', 'win', '⌘', 'cmd', 'command'];

        // Setup the modifier priorities so we can maintain a consistent ordering of combo events
        var ctrlKeys = self.CONTROLKEYS.concat(['ctrl']);
        var altKeys = self.ALTKEYS.concat(self.AltAltNames);
        var osKeys = self.OSKEYS.concat(self.AltOSNames);
        for (i=0; i < ctrlKeys.length; i++) {
            self.MODPRIORITY[ctrlKeys[i].toLowerCase()] = 5;
        }
        for (i=0; i < self.SHIFTKEYS.length; i++) {
            self.MODPRIORITY[self.SHIFTKEYS[i].toLowerCase()] = 4;
        }
        for (i=0; i < altKeys.length; i++) {
            self.MODPRIORITY[altKeys[i].toLowerCase()] = 3;
        }
        for (i=0; i < osKeys.length; i++) {
            self.MODPRIORITY[osKeys[i].toLowerCase()] = 2;
        }

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
        ['_clipboard', '_composition', '_contextmenu', '_holdCounter',
         '_keydown', '_keypress', '_keyup', 'trigger'].forEach(function(event) {
            self[event] = self[event].bind(self);
        });

        // Take care of our multi-function functions :)
        self._compositionstart = self._composition;
        self._compositionupdate = self._composition;
        self._compositionend = self._composition;
        self._paste = self._clipboard;
        self._copy = self._clipboard;
        self._cut = self._clipboard;
        self._input = self._select;

        self.applyEvent = function applyEvent(func) {
            func.apply(self, arguments);
        }

        // Start er up!
        self.init();
    }

    get instances() {
        return instances;
    }

    get plugins() {
        return plugins;
    }

    map(obj) {
        /**:HumanInput.map()

        This function will update ``self.eventMap`` with the given *obj*'s keys and values and then with it's values and keys (so lookups can be performed in reverse).
        */
        for (var item in obj) {
            // Create both forward and reverse mappings
            this.eventMap.forward[item] = obj[item];
            this.eventMap.reverse[obj[item]] = item;
        }
    }

    init() {
        var self = this;
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
            modifiers: {}, // Tracks (traditional) modifier keys
//             scrollX: 0, // Tracks the distance scrolled in 'scroll' events
//             scrollY: 0, // Ditto
            seqBuffer: [] // For tracking sequences like 'a b c'
        };
        self.events = {}; // Tracks functions attached to events
        // The eventMap can be used to change the name of triggered events (e.g. 'w': 'forward')
        self.eventMap = {forward: {}, reverse: {}};
        self.map(self.settings.eventMap); // Apply any provided eventMap
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
            self.log.debug(self.l('Initializing Plugin:'), plugin.NAME);
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
            self.log.debug(self.l('Pause: Removing event listeners ', self.settings.listenEvents));
            self.settings.listenEvents.forEach(function(event) {
                var opts = self.settings.eventOptions[event] || true;
                if (isFunction(self['_'+event])) {
                    self.elem.removeEventListener(event, self['_'+event], opts);
                }
            });
        });
        self.off(['hi:initialized', 'hi:resume']); // In case of re-init
        self.on(['hi:initialized', 'hi:resume'], function() {
            self.log.debug('HumanInput Version: ' + self.VERSION);
            self.log.debug(self.l('Start/Resume: Addding event listeners'), self.settings.listenEvents);
            self.settings.listenEvents.forEach(function(event) {
                var opts = self.settings.eventOptions[event] || true;
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
        this.state.modifiers = {};
        this.state.seqBuffer = [];
        this.state.down = [];
        this.state.downAlt = [];
        this.state.holdArgs = [];
        lastDownLength = 0;
        finishedKeyCombo = false;
        clearTimeout(this.state.holdTimeout);
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

        Sorts and returns the given *events* array (which is normally just a copy of ``self.state.down``) according to HumanInput's event sorting rules.
        */
        var priorities = this.MODPRIORITY;
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
        var index = this.state.down.indexOf(event);
        if (index === -1) {
            index = this.state.downAlt.indexOf(event);
        }
        if (index === -1 && alt) {
            index = this.state.downAlt.indexOf(alt);
        }
        if (index === -1) {
            this.state.down.push(event);
            if (alt) {
                this.state.downAlt.push(alt);
            } else {
                this.state.downAlt.push(event);
            }
        }
        this.trigger('hi:adddown', event, alt); // So plugins and modules can do stuff when this happens
    }

    _removeDown(event) {
        // Removes the given *event* from this.state.down and this.state.downAlt (if found); keeping the two in sync in terms of indexes
        var index = this.state.down.indexOf(event);
        clearTimeout(this.state.holdTimeout);
        if (index === -1) {
            // Event changed between 'down' and 'up' events
            index = this.state.downAlt.indexOf(event);
        }
        if (index === -1) { // Still no index?  Try one more thing: Upper case
            index = this.state.downAlt.indexOf(event.toUpperCase()); // Handles the situation where the user releases a key *after* a Shift key combo
        }
        if (index !== -1) {
            this.state.down.splice(index, 1);
            this.state.downAlt.splice(index, 1);
        }
        lastDownLength = this.state.down.length;
        if (this.settings.listenEvents.includes('hold')) {
            this.state.holdArgs.pop();
            this.state.heldTime = this.settings.holdInterval;
            this.state.holdStart = Date.now(); // This needs to be reset whenever this.state.down changes
            if (this.state.down.length) {
                // Continue 'hold' events for any remaining 'down' events
                this.state.holdTimeout = setTimeout(this._holdCounter, this.settings.holdInterval);
            }
        }
        this.trigger('hi:removedown', event); // So plugins and modules can do stuff when this happens
    }

    _doDownEvent(event) {
        /*
            Adds the given *event* to this.state.down, calls this._handleDownEvents(), removes the event from this.state.down, then returns the triggered results.
            Any additional arguments after the given *event* will be passed to this._handleDownEvents().
        */
        var args = Array.from(arguments).slice(1);
        this._addDown(event);
        var results = this._handleDownEvents.apply(this, args);
        this._handleSeqEvents(args[0]); // args[0] will be the browser event
        this._removeDown(event);
        return results;
    }

    _keyEvent(key) {
        // Given a *key* like 'ShiftLeft' returns the "official" key event or just the given *key* in lower case
        if (this.CONTROLKEYS.indexOf(key) !== -1) {
            return this.ControlKeyEvent;
        } else if (this.ALTKEYS.indexOf(key) !== -1) {
            return this.AltKeyEvent;
        } else if (this.SHIFTKEYS.indexOf(key) !== -1) {
            return this.ShiftKeyEvent;
        } else if (this.OSKEYS.indexOf(key) !== -1) {
            return this.OSKeyEvent;
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
        var lastItemIndex = down.length - 1;
        var shiftKeyIndex = -1;
        if (this.state.modifiers.shift) {
            // Shift key is held; find it
            for (let i=0; i < down.length; i++) {
                shiftKeyIndex = down[i].indexOf('Shift');
                if (shiftKeyIndex !== -1) { break; }
            }
        }
        if (shiftKeyIndex !== -1) {
            // The last key in the 'down' array is all we care about...
            // Use the difference between the 'key' and 'code' (aka the 'alt' name) to detect chars that require shift but aren't uppercase:
            if (down[lastItemIndex] != this.state.downAlt[lastItemIndex]) {
                down.splice(shiftKeyIndex, 1); // Remove the shift key
                return true; // We're done here
            }
        }
    }

    _handleDownEvents() {
        var events = this._downEvents();
        var results;
        var args = Array.from(arguments);
        for (let i=0; i < events.length; i++) {
            results = this._triggerWithSelectors(events[i], args);
        }
        if (this.settings.listenEvents.includes('hold')) {
            this.state.holdArgs.push(args);
            this.state.heldTime = this.settings.holdInterval; // Restart it
            this.state.holdStart = Date.now();
            // Start the 'hold:' counter! If no changes to this.state.down, fire a hold:<n>:<event> event for every second the down events are held
            clearTimeout(this.state.holdTimeout); // Just in case
            this.state.holdTimeout = setTimeout(this._holdCounter, this.settings.holdInterval);
        }
        return results;
    }

    _handleSeqEvents(e) {
        // NOTE: This function should only be called when a button or key is released (i.e. when state changes to UP)
        var results;
        var down = this.state.down.slice(0);
        if (lastDownLength < down.length) { // User just finished a combo (e.g. ctrl-a)
            if (this.sequenceFilter(e)) {
                this._handleShifted(down);
                this._sortEvents(down);
                this.state.seqBuffer.push(down);
                if (this.state.seqBuffer.length > this.settings.maxSequenceBuf) {
                    // Make sure it stays within the specified max
                    this.state.seqBuffer.shift();
                }
                if (this.state.seqBuffer.length > 1) {
                    // Trigger all combinations of sequence buffer events
                    var combos = this._seqCombinations(this.state.seqBuffer);
                    for (let i=0; i<combos.length; i++) {
                        let sliced = this._seqSlicer(combos[i]);
                        for (let j=0; j < sliced.length; j++) {
                            results = this.trigger(this.scope + sliced[j], this);
                        }
                    }
                    if (results.length) {
                    // Reset the sequence buffer on matched event so we don't end up triggering more than once per sequence
                        this.state.seqBuffer = [];
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

    _setModifiers(code, bool) {
        // Set all modifiers matching *code* to *bool*
        if (this.ALLMODIFIERS.indexOf(code)) {
            if (this.SHIFTKEYS.indexOf(code) !== -1) {
                this.state.modifiers.shift = bool;
            }
            if (this.CONTROLKEYS.indexOf(code) !== -1) {
                this.state.modifiers.ctrl = bool;
            }
            if (this.ALTKEYS.indexOf(code) !== -1) {
                this.state.modifiers.alt = bool;
                this.state.modifiers.option = bool;
                this.state.modifiers['⌥'] = bool;
            }
            if (this.OSKEYS.indexOf(code) !== -1) {
                this.state.modifiers.meta = bool;
                this.state.modifiers.command = bool;
                this.state.modifiers.os = bool;
                this.state.modifiers['⌘'] = bool;
            }
            this.state.modifiers[code] = bool; // Required for differentiating left and right variants
        }
    }

    _holdCounter() {
        // This function triggers 'hold' events every <holdInterval ms> when events are 'down'.
        var self = this;
        var events = self._downEvents();
        if (!events.length) { return; }
        clearTimeout(self.state.holdTimeout);
        var lastArg = self.state.holdArgs[self.state.holdArgs.length-1] || [];
        var realHeldTime = Date.now() - self.state.holdStart;
        self._resetSeqTimeout(); // Make sure the sequence buffer reset function doesn't clear out our hold times
        for (let i=0; i < events.length; i++) {
            // This is mostly so plugins and whatnot can do stuff when hold events are triggered
            self.trigger('hold', events[i], realHeldTime);
            // This is the meat of hold events:
            self._triggerWithSelectors('hold:'+self.state.heldTime+':'+events[i], lastArg.concat([realHeldTime]));
        }
        self.state.heldTime += self.settings.holdInterval;
        if (self.state.heldTime < 5001) { // Any longer than this and it probably means something went wrong (e.g. browser bug with touchend not firing)
            self.state.holdTimeout = setTimeout(self._holdCounter, self.settings.holdInterval);
        }
    }

    _triggerWithSelectors(event, args) {
        // A DRY function that triggers the given *event* normally and then via this._handleSelectors()
        var results = [];
        var scopedEvent = this.scope + event;
        results = results.concat(this.trigger.apply(this, [scopedEvent].concat(args)));
        results = results.concat(this._handleSelectors.apply(this, [scopedEvent].concat(args)));
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
            if (events.indexOf(joined) === -1) {
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
        }
        out = [out.join(' ')]; // Make a version that has the original key/modifier names (e.g. shiftleft)
        for (i=0; i < buffer.length; i++) {
            // Normalize names (shiftleft becomes shift)
            for (j=0; j < buffer[i].length; j++) {
                replacement[i][j] = [this._keyEvent(buffer[i][j])];
            }
        }
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
        var events = [];
        var shiftedKey;
        var down = this.state.down.slice(0); // Make a copy because we're going to mess with it
        var downLength = down.length; // Need the original length for reference
        var unshiftedDown = this.state.downAlt.slice(0); // The 'alt' chars (from the code) represent the un-shifted form of the key
        if (downLength) {
            if (downLength === 1) {
                return this._seqCombinations([down]);
            }
            if (downLength > 1) { // Combo; may need shift key removed to generate the correct event (e.g. '!' instead of 'shift-!')
                shiftedKey = this._handleShifted(down);
                // Before sorting, fire the precise combo event
                events = events.concat(this._seqCombinations([down], '->'));
                if (shiftedKey) {
                    // Generate events for the un-shifted chars (e.g. shift->1, shift->2, etc)
                    events = events.concat(this._seqCombinations([unshiftedDown], '->'));
                }
            }
            if (down.length > 1) { // Is there more than one item *after* we may have removed shift?
                this._sortEvents(down);
                // Make events for all alternate names (e.g. 'controlleft-a' and 'ctrl-a'):
                events = events.concat(this._seqCombinations([down]));
            }
            if (shiftedKey) {
                this._sortEvents(unshiftedDown);
                events = events.concat(this._seqCombinations([unshiftedDown]));
            }
        }
        return events;
    }

    _keydown(e) {
        // NOTE: e.which and e.keyCode will be incorrect for a *lot* of keys
        //       and basically always incorrect with alternate keyboard layouts
        //       which is why we replace self.state.down[<the key>] inside _keypress()
        //       when we can (for browsers that don't support KeyboardEvent.key).
        var results;
        var keyCode = e.which || e.keyCode;
        var location = e.location || 0;
// NOTE: Should I put e.code first below?  Hmmm.  Should we allow keyMaps to override the browser's native key name if it's available?
        var code = this.keyMaps[location][keyCode] || this.keyMaps[0][keyCode] || e.code;
        var key = e.key || code;
        var event = e.type;
        var fpEvent = this.scope + 'faceplant';
        if (e.repeat && this.settings.noKeyRepeat) {
            e.preventDefault(); // Make sure keypress doesn't fire after this
            return false; // Don't do anything if key repeat is disabled
        }
        key = this._normSpecial(location, key, code);
        // Set modifiers and mark the key as down whether we're filtered or not:
        this._setModifiers(key, true);
        if (key == 'Compose') { // This indicates that the user is entering a composition
            this.state.composing = true;
            return;
        }
        if (this.state.down.indexOf(key) === -1) {
            this._addDown(key, code);
        }
        // Don't let the sequence buffer reset if the user is active:
        this._resetSeqTimeout();
        if (this.filter(e)) {
            // This is in case someone wants just on('keydown'):
            results = this._triggerWithSelectors(event, [e, key, code]);
            // Now trigger the more specific keydown:<key> event:
            results = results.concat(this._triggerWithSelectors(event += ':' + key.toLowerCase(), [e, key, code]));
            if (this.state.down.length > 5) { // 6 or more keys down at once?  FACEPLANT!
                results = results.concat(this.trigger(fpEvent, e)); // ...or just key mashing :)
            }
/* NOTE: For browsers that support KeyboardEvent.key we can trigger the usual
        events inside _keydown() (which is faster) but other browsers require
        _keypress() be called first to fix localized/shifted keys.  So for those
        browser we call _handleDownEvents() inside _keyup(). */
            if (KEYSUPPORT) {
                results = results.concat(this._handleDownEvents(e, key, code));
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
        var results;
        var keyCode = e.which || e.keyCode;
        var location = e.location || 0;
// NOTE: Should I put e.code first below?  Hmmm.  Should we allow keyMaps to override the browser's native key name if it's available?
        var code = this.keyMaps[location][keyCode] || this.keyMaps[0][keyCode] || e.code;
        var key = e.key || code;
        var event = e.type;
        key = this._normSpecial(location, key, code);
        if (!this.state.downAlt.length) { // Implies key states were reset or out-of-order somehow
            return; // Don't do anything since our state is invalid
        }
        if (this.state.composing) {
            this.state.composing = false;
            return;
        }
        if (this.filter(e)) {
            if (!KEYSUPPORT) {
                this._handleDownEvents(e);
            }
            // This is in case someone wants just on('keyup'):
            results = this._triggerWithSelectors(event, [e, key, code]);
            // Now trigger the more specific keyup:<key> event:
            results = results.concat(this._triggerWithSelectors(event + ':' + key.toLowerCase(), [e, key, code]));
            this._handleSeqEvents(e);
            handlePreventDefault(e, results);
        }
        // Remove the key from this.state.down even if we're filtered (state must stay accurate)
        this._removeDown(key);
        this._setModifiers(code, false); // Modifiers also need to stay accurate
    }

    _composition(e) {
        var data = e.data;
        var event = 'compos';
        if (this.filter(e)) {
            let results = this._triggerWithSelectors(e.type, [e, data]);
            if (data) {
                if (e.type == 'compositionupdate') {
                    event += 'ing:"' + data + '"';
                } else if (e.type == 'compositionend') {
                    event += 'ed:"' + data + '"';
                }
                results = results.concat(this._triggerWithSelectors(event, [e]));
                handlePreventDefault(e, results);
            }
        }
    }

    _clipboard(e) {
        var data;
        var event = e.type + ':"';
        if (this.filter(e)) {
            if (window.clipboardData) { // IE
                data = window.clipboardData.getData('Text');
            } else if (e.clipboardData) { // Standards-based browsers
                data = e.clipboardData.getData('text/plain');
            }
            if (!data && (e.type == 'copy' || e.type == 'cut')) {
                data = this.getSelText();
            }
            if (data) {
                // First trigger a generic event so folks can just grab the copied/cut/pasted data
                let results = this._triggerWithSelectors(e.type, [e, data]);
                // Now trigger a more specific event that folks can match against
                results = results.concat(this._triggerWithSelectors(event + data + '"', [e]));
                handlePreventDefault(e, results);
            }
        }
    }

    _select(e) {
        // Handles triggering 'select' *and* 'input' events (since they're so similar)
        var event = e.type + ':"';
        if (e.type == 'select') { var data = self.getSelText(); }
        else if (e.type == 'input') { var data = e.data || e.target.value; }
        if (self.filter(e)) {
            let results = self._triggerWithSelectors(e.type, [e, data]);
            if (data) {
                results = results.concat(self._triggerWithSelectors(event + data + '"', [e]));
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
        if (this.scope.length) {
            this.scope = this.scope.slice(0, -1) + '.' + scope + ':';
        } else {
            this.scope = scope + ':';
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
        if (this.scope.length) {
            this.scope = this.scope.slice(0, -1).split('.').slice(0, -1).join('.') + ':';
        }
        if (this.scope == ':') { this.scope = ''; }
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
        this.recording = true;
        recordedEvents = [];
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
        var regex = new RegExp(filter);
        var hasSelector = function(str) {
            return (str.indexOf(':#') === -1 && str.indexOf(':.') === -1);
        };
        this.recording = false;
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

    addListeners(elem, events, func, useCapture) {
        /**:HumanInput.addListeners()

        Calls ``addEventListener()`` on the given *elem* for each event in the given *events* array passing it *func* and *useCapture* which are the same arguments that would normally be passed to ``addEventListener()``.
        */
        events.forEach(function(event) {
            elem.addEventListener(event, func, useCapture);
        });
    }

    removeListeners(elem, events, func, useCapture) {
        /**:HumanInput.removeListeners()

        Calls ``removeEventListener()`` on the given *elem* for each event in the given *events* array passing it *func* and *useCapture* which are the same arguments that would normally be passed to ``removeEventListener()``.
        */
        events.forEach(function(event) {
            elem.removeEventListener(event, func, useCapture);
        });
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

        Returns ``true`` if the given *name* (string) is currently held (aka 'down' or 'pressed').  It works with any kind of key or button as well as combos such as, 'ctrl-a'.  It also works with ``self.eventMap`` if you've remapped any events (e.g. ``HI.isDown('fire') == true``).

        .. note:: Strings are used to track keys because key codes are browser and platform dependent (unreliable).
        */
        var downEvents = this._downEvents();
        name = name.toLowerCase();
        name = this.eventMap.reverse[name] || name;
        if (downEvents.includes(name)) {
            return true;
        }
        for (let i=0; i < this.state.down.length; i++) {
            let down = this.state.down[i].toLowerCase();
            let downAlt = this.state.downAlt[i].toLowerCase(); // In case something changed between down and up events
            if (name == down || name == downAlt) {
                return true;
            } else if (this.SHIFTKEYS.includes(this.state.down[i])) {
                if (name == this.ShiftKeyEvent) {
                    return true;
                }
            } else if (this.CONTROLKEYS.includes(this.state.down[i])) {
                if (name == this.ControlKeyEvent) {
                    return true;
                }
            } else if (this.ALTKEYS.includes(this.state.down[i])) {
                if (name == this.AltKeyEvent) {
                    return true;
                }
            } else if (this.OSKEYS.includes(this.state.down[i])) {
                if (name == this.OSKeyEvent) {
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
        var down = this._sortEvents(this.state.down.slice(0));
        var trailingDash = new RegExp('-$');
        var out = '';
        for (let i=0; i < down.length; i++) {
            out += this._keyEvent(down[i]) + '-';
        }
        return out.replace(trailingDash, ''); // Remove trailing dash
    }

}

HumanInput.instances = instances; // So we can enforce singleton
HumanInput.plugins = plugins;
HumanInput.defaultListenEvents = defaultEvents;

/*
Even though 'module' appears nowhere in this code, 'module.exports' line is how
we make sure HumanInput works with CommonJS, require(), define(), module.exports,
exports, etc.  It's the WebPack way.
*/
module.exports = HumanInput;
// NOTE: Meant to be used with `libraryTarget: "umd"` in webpack.config.js

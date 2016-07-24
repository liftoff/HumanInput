/**
 * humaninput.js - HumanInput is a Human-generated event library for humans (keyboard, mouse, gesture, touch, gamepad, speech recognition and more)
 * Copyright (c) 2016, Dan McDougall
 * @link https://github.com/liftoff/HumanInput
 * @license Apache-2.0
 */

import { polyfill } from './polyfills';
polyfill(); // Won't do anything unless we execute it

import { OSKEYS, ALTKEYS, CONTROLKEYS, SHIFTKEYS, OSKeyEvent, AltKeyEvent, ControlKeyEvent, ShiftKeyEvent } from './constants';
import { getNode, noop, debounce, isFunction, getLoggingName, seqSlicer, handlePreventDefault, cloneArray, arrayCombinations, sortEvents, addListeners } from './utils';
import { Logger } from './logger';
import { EventHandler } from './events';
// Remove this line if you don't care about Safari keyboard support:
import { keyMaps } from './keymaps'; // Removing this saves ~1.3k in minified output!

// Sandbox-side variables and shortcuts
// const window = this;
const _HI = window.HumanInput; // For noConflict
const screen = window.screen;
const document = window.document;

// NOTE: "blur", "reset", and "submit" are all just handled via _genericEvent()
var defaultEvents = [
    "blur", "click", "compositionend", "compositionstart", "compositionupdate",
    "contextmenu", "focus", "hold", "input", "keydown", "keypress",
    "keyup", "reset", "submit"];

var instances = [];
var plugins = [];

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
            logLevel: 'INFO',
            logPrefix: getLoggingName(elem),
        };
        // Apply settings over the defaults:
        for (var item in settings) {
            defaultSettings[item] = settings[item];
        }
        settings = defaultSettings;
        var log = new Logger(settings.logLevel, settings.logPrefix);
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
        // For localization of our few strings:
        this.l = settings.translate;
        settings.listenEvents.push(...settings.addEvents);
        if (settings.removeEvents.length) {
            settings.listenEvents = settings.listenEvents.filter((item) => {
                return (!settings.removeEvents.includes(item));
            });
        }

        this.settings = settings;
        this.elem = getNode(elem || window);
        this.Logger = Logger; // In case someone wants to use it separately
        this.log = log;
        this.VERSION = __VERSION__;
        this.plugin_instances = []; // Each instance of HumanInput gets its own set of plugin instances
        // NOTE: Most state-tracking variables are set inside HumanInput.init()

        // This needs to be set early on so we don't get errors in the early trigger() calls:
        this.eventMap = {forward: {}, reverse: {}};
        // NOTE: keyMaps are only necessary for Safari
        this.keyMaps = {0: {}, 1: {}, 2: {}};
        if (keyMaps) { this.keyMaps = keyMaps; }

        // Apply some post-instantiation settings
        if (settings.disableSequences) {
            this._handleSeqEvents = noop;
        }
        if (settings.disableSelectors) {
            this._handleSelectors = noop;
        }

        // These functions need to be bound to work properly ('this' will be window or this.elem which isn't what we want)
        ['_composition', '_contextmenu', '_holdCounter', '_resetSeqTimeout',
         '_resetStates', '_keydown', '_keypress', '_keyup', 'trigger'].forEach((event) => {
            this[event] = this[event].bind(this);
        });

        // Take care of our multi-function functions :)
        this._compositionstart = this._composition;
        this._compositionupdate = this._composition;
        this._compositionend = this._composition;

        // Add some generic window/document events so plugins don't need to handle
        // them on their own; it's better to have *one* listener.
        if (typeof document.hidden !== "undefined") {
            document.addEventListener('visibilitychange', (e) => {
                if (document.hidden) {
                    this.trigger('document:hidden', e);
                } else {
                    this.trigger('document:visible', e);
                }
            }, false);
        }
        var genericHandler = this._genericEvent.bind(this, 'window');
        // Window focus and blur are also almost always user-initiated:
        if (window.onblur !== undefined) {
            addListeners(window, ['blur', 'focus'], genericHandler, true);
        }
        if (this.elem === window) { // Only attach window events if HumanInput was instantiated on the 'window'
            // These events are usually user-initiated so they count:
            addListeners(window, ['beforeunload', 'hashchange', 'languagechange'], genericHandler, true);
            // Window resizing needs some de-bouncing or you end up with far too many events being fired while the user drags:
            window.addEventListener('resize', debounce(genericHandler, 250), true);
            // Orientation change is almost always human-initiated:
            if (window.orientation !== undefined) {
                window.addEventListener('orientationchange', (e) => {
                    var event = 'window:orientation';
                    this.trigger(event, e);
                    // NOTE: There's built-in aliases for 'landscape' and 'portrait'
                    if (Math.abs(window.orientation) === 90) {
                        this.trigger(event + ':landscape', e);
                    } else {
                        this.trigger(event + ':portrait', e);
                    }
                }, false);
            }
        }

        // Start er up!
        this.init();
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
        var settings = this.settings;
        var listenEvents = settings.listenEvents;
        var debug = this.log.debug;
        if (this.eventCount) { // It already exists/reset scenario
            // This is so a reset can be detected and handled properly by external stuff
            this.trigger('hi:reset');
        }
        this.scope = ''; // The current event scope (empty string means global scope)
        this.state = { // Stores temporary/fleeting state information
            down: [], // Tracks which keys/buttons are currently held down (pressed)
            downAlt: [], // Used to keep keydown and keyup events in sync when the 'key' gets replaced inside the keypress event
            holdStart: null, // Tracks the start time of hold events
            holdArgs: [], // Keeps track of arguments that will be passed to hold events
            seqBuffer: [] // For tracking sequences like 'a b c'
        };
        this.events = {}; // Tracks functions attached to events
        // The eventMap can be used to change the name of triggered events (e.g. 'w': 'forward')
        this.eventMap = {forward: {}, reverse: {}};
        this.map(settings.eventMap); // Apply any provided eventMap
        // NOTE:  Possible new feature:  Transform events using registerable functions:
//         this.transforms = []; // Used for transforming event names
        finishedKeyCombo = false; // Internal state tracking of keyboard combos like ctrl-c

        // Setup our basic window listen events
        // This tries to emulate fullscreen detection since the Fullscreen API doesn't friggin' work when the user presses F11 or selects fullscreen from the menu...
        if (this.elem === window) {
            this.on('window:resize', () => {
                // NOTE: This may not work with multiple monitors
                if (window.outerWidth === screen.width && window.outerHeight === screen.height) {
                    this.state.fullscreen = true;
                    this.trigger('fullscreen', true);
                } else if (this.state.fullscreen) {
                    this.state.fullscreen = false;
                    this.trigger('fullscreen', false);
                }
            });
        }

        // Reset states if the user alt-tabs away (or similar)
        this.on('window:blur', this._resetStates);

        // Enable plugins
        for (let i=0; i < plugins.length; i++) {
            // Instantiate the plugin (if not already)
            if (!(this.plugin_instances[i] instanceof plugins[i])) {
                this.plugin_instances[i] = new plugins[i](this);
            }
            let plugin = this.plugin_instances[i];
            debug(this.l('Initializing Plugin:'), plugin.constructor.name);
            if (isFunction(plugin.init)) {
                let initResult = plugin.init(this);
                for (let attr in initResult.exports) {
                    this[attr] = initResult.exports[attr];
                }
            }
        }

        // Set or reset our event listeners (enables changing built-in events at a later time)
        this.off('hi:pause');
        this.on('hi:pause', () => {
            debug(this.l('Pause: Removing event listeners ', listenEvents));
            listenEvents.forEach((event) => {
                var opts = settings.eventOptions[event] || true;
                if (isFunction(this['_'+event])) {
                    this.elem.removeEventListener(event, this['_'+event], opts);
                }
            });
        });
        this.off(['hi:initialized', 'hi:resume']); // In case of re-init
        this.on(['hi:initialized', 'hi:resume'], () => {
            debug('HumanInput Version: ' + this.VERSION);
            debug(this.l('Start/Resume: Addding event listeners'), listenEvents);
            listenEvents.forEach((event) => {
                var opts = settings.eventOptions[event] || true;
                if (isFunction(this['_'+event])) {
                    // TODO: Figure out why removeEventListener isn't working
                    this.elem.removeEventListener(event, this['_'+event], opts);
                    this.elem.addEventListener(event, this['_'+event], opts);
                } else { // No function for this event; use the generic event handler and hope for the best
                    this['_'+event] = this._genericEvent.bind(this, '');
                    this.elem.addEventListener(event, this['_'+event], opts);
                }
            });
        });

        this.trigger('hi:initialized', this);
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
        clearTimeout(this.state.seqTimer);
        this.state.seqTimer = setTimeout(() => {
            this.log.debug(this.l('Resetting event sequence states due to timeout'));
            this._resetStates();
        }, this.settings.sequenceTimeout);
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
                for (let i=0; i<toBind.classList.length; i++) {
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
        var state = this.state;
        var settings = this.settings;
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
        var args = Array.from(arguments).slice(1);
        this._addDown(event);
        var results = this._handleDownEvents.apply(this, args);
        this._handleSeqEvents(args[0]); // args[0] will be the browser event
        this._removeDown(event);
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
        var lastItemIndex = down.length - 1;
        var shiftKeyIndex = -1;
        for (let i=0; i < down.length; i++) {
            shiftKeyIndex = down[i].indexOf('Shift');
            if (shiftKeyIndex != -1) { break; }
        }
        if (shiftKeyIndex != -1) {
            // The last key in the 'down' array is all we care about...
            // Use the difference between the 'key' and 'code' (aka the 'alt' name) to detect chars that require shift but aren't uppercase:
            if (down[lastItemIndex] != this.state.downAlt[lastItemIndex]) {
                down.splice(shiftKeyIndex, 1); // Remove the shift key
                return true; // We're done here
            }
        }
    }

    _handleDownEvents() {
        var settings = this.settings;
        var state = this.state;
        var events = this._downEvents();
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
            state.holdTimeout = setTimeout(this._holdCounter, settings.holdInterval);
        }
        return results;
    }

    _handleSeqEvents(e) {
        // NOTE: This function should only be called when a button or key is released (i.e. when state changes to UP)
        var state = this.state;
        var seqBuffer = state.seqBuffer;
        var results = [];
        var down = state.down.slice(0);
        if (lastDownLength < down.length) { // User just finished a combo (e.g. ctrl-a)
            if (this.sequenceFilter(e)) {
                this._handleShifted(down);
                sortEvents(down);
                seqBuffer.push(down);
                if (seqBuffer.length > this.settings.maxSequenceBuf) {
                    // Make sure it stays within the specified max
                    seqBuffer.shift();
                }
                if (seqBuffer.length > 1) {
                    // Trigger all combinations of sequence buffer events
                    var combos = this._seqCombinations(seqBuffer);
                    for (let i=0; i<combos.length; i++) {
                        let sliced = seqSlicer(combos[i]);
                        for (let j=0; j < sliced.length; j++) {
                            results = results.concat(this.trigger(this.scope + sliced[j], this));
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
        var state = this.state;
        var settings = this.settings;
        var events = this._downEvents();
        if (!events.length) { return; }
        clearTimeout(state.holdTimeout);
        var lastArg = state.holdArgs[state.holdArgs.length-1] || [];
        var realHeldTime = Date.now() - state.holdStart;
        this._resetSeqTimeout(); // Make sure the sequence buffer reset function doesn't clear out our hold times
        for (let i=0; i < events.length; i++) {
            // This is mostly so plugins and whatnot can do stuff when hold events are triggered
            this.trigger('hold', events[i], realHeldTime);
            // This is the meat of hold events:
            this._triggerWithSelectors('hold:'+state.heldTime+':'+events[i], lastArg.concat([realHeldTime]));
        }
        state.heldTime += settings.holdInterval;
        if (state.heldTime < 5001) { // Any longer than this and it probably means something went wrong (e.g. browser bug with touchend not firing)
            state.holdTimeout = setTimeout(this._holdCounter, settings.holdInterval);
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

    _seqCombinations(buffer, joinChar) {
        /**:HumanInput._seqCombinations(buffer[, joinChar])

        Returns all possible alternate name combinations of events (as an Array) for a given buffer (*buffer*) which must be an Array of Arrays in the form of::

            [['ControlLeft', 'c'], ['a']]

        The example above would be returned as an Array of strings that can be passed to :js:func:`utils.seqSlicer` like so::

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
                sortEvents(down);
                // Make events for all alternate names (e.g. 'controlleft-a' and 'ctrl-a'):
                events = events.concat(this._seqCombinations([down]));
            }
            if (shiftedKey) {
                sortEvents(unshiftedDown);
                events = events.concat(this._seqCombinations([unshiftedDown]));
            }
        }
        return events;
    }

    _keydown(e) {
        // NOTE: e.which and e.keyCode will be incorrect for a *lot* of keys
        //       and basically always incorrect with alternate keyboard layouts
        //       which is why we replace this.state.down[<the key>] inside _keypress()
        //       when we can (for browsers that don't support KeyboardEvent.key).
        var state = this.state;
        var results;
        var keyCode = e.which || e.keyCode;
        var location = e.location || 0;
// NOTE: Should I put e.code first below?  Hmmm.  Should we allow keyMaps to override the browser's native key name if it's available?
        var code = this.keyMaps[location][keyCode] || this.keyMaps[0][keyCode] || e.code;
        var key = e.key || code;
        var event = e.type;
        var notFiltered = this.filter(e);
        var fpEvent = this.scope + 'faceplant';
        if (e.repeat && notFiltered && this.settings.noKeyRepeat) {
            e.preventDefault(); // Make sure keypress doesn't fire after this
            return false; // Don't do anything if key repeat is disabled
        }
        key = this._normSpecial(location, key, code);
        if (key == 'Compose') { // This indicates that the user is entering a composition
            state.composing = true;
            return;
        }
        if (!state.down.includes(key)) {
            this._addDown(key, code);
        }
        // Don't let the sequence buffer reset if the user is active:
        this._resetSeqTimeout();
        if (notFiltered) {
            // This is in case someone wants just on('keydown'):
            results = this._triggerWithSelectors(event, [e, key, code]);
            // Now trigger the more specific keydown:<key> event:
            results = results.concat(this._triggerWithSelectors(event += ':' + key.toLowerCase(), [e, key, code]));
            if (state.down.length > 5) { // 6 or more keys down at once?  FACEPLANT!
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
        var state = this.state;
        var results;
        var keyCode = e.which || e.keyCode;
        var location = e.location || 0;
// NOTE: Should I put e.code first below?  Hmmm.  Should we allow keyMaps to override the browser's native key name if it's available?
        var code = this.keyMaps[location][keyCode] || this.keyMaps[0][keyCode] || e.code;
        var key = e.key || code;
        var event = e.type;
        key = this._normSpecial(location, key, code);
        if (!state.downAlt.length) { // Implies key states were reset or out-of-order somehow
            return; // Don't do anything since our state is invalid
        }
        if (state.composing) {
            state.composing = false;
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
            return (!(str.includes(':#') || str.includes(':.')));
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
        var state = this.state;
        var downEvents = this._downEvents();
        name = name.toLowerCase();
        name = this.eventMap.reverse[name] || name;
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
        var down = sortEvents(this.state.down.slice(0));
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

export default HumanInput;

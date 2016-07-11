(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["humaninput"] = factory();
	else
		root["HumanInput"] = root["HumanInput"] || {}, root["HumanInput"]["humaninput"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.l = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// identity function for calling harmory imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };

/******/ 	// define getter function for harmory exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		Object.defineProperty(exports, name, {
/******/ 			configurable: false,
/******/ 			enumerable: true,
/******/ 			get: getter
/******/ 		});
/******/ 	};

/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports) {

var g;

// This works in non-strict mode
g = (function() { return this; })();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1,eval)("this");
} catch(e) {
	// This works if the window reference is available
	if(typeof window === "object")
		g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {module.exports = global["HumanInput"] = __webpack_require__(8);
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {module.exports = global["HumanInput"] = __webpack_require__(3);
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
'use strict';

exports.__esModule = true;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _polyfills = __webpack_require__(12);

var _utils = __webpack_require__(1);

var _logger = __webpack_require__(11);

var _events = __webpack_require__(9);

var _keymaps = __webpack_require__(10);

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * humaninput.js - HumanInput is a Human-generated event library for humans (keyboard, mouse, gesture, touch, gamepad, speech recognition and more)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Copyright (c) 2016, Dan McDougall
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @link https://github.com/liftoff/HumanInput
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @license Apache-2.0
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */

(0, _polyfills.polyfill)(); // Won't do anything unless we execute it

// Remove this line if you don't care about Safari keyboard support:
// Removing this saves ~1.3k in minified output!

// Sandbox-side variables and shortcuts
// const window = this;
var _HI = window.HumanInput; // For noConflict
var screen = window.screen;
var document = window.document;
var OSKEYS = ['OS', 'OSLeft', 'OSRight'];
var CONTROLKEYS = ['Control', 'ControlLeft', 'ControlRight'];
var ALTKEYS = ['Alt', 'AltLeft', 'AltRight'];
var SHIFTKEYS = ['Shift', 'ShiftLeft', 'ShiftRight', '⇧'];
var MODPRIORITY = {}; // This gets filled out below
var ControlKeyEvent = 'ctrl';
var ShiftKeyEvent = 'shift';
var AltKeyEvent = 'alt';
var OSKeyEvent = 'os';
var AltAltNames = ['option', '⌥'];
var AltOSNames = ['meta', 'win', '⌘', 'cmd', 'command'];

// Original defaultEvents (before modularization)
// var defaultEvents = [
//     "blur", "click", "compositionend", "compositionstart", "compositionupdate",
//     "contextmenu", "copy", "cut", "focus", "hold", "input", "keydown", "keypress",
//     "keyup", "pan", "paste", "reset", "scroll", "select", "submit", "wheel"];

// NOTE: "blur", "reset", and "submit" are all just handled via _genericEvent()
var defaultEvents = ["blur", "click", "compositionend", "compositionstart", "compositionupdate", "contextmenu", "focus", "hold", "input", "keydown", "keypress", "keyup", "reset", "submit"];

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

var HumanInput = function (_EventHandler) {
    _inherits(HumanInput, _EventHandler);

    // Core API functions

    function HumanInput(elem, settings) {
        _classCallCheck(this, HumanInput);

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
            translate: _utils.noop,
            logLevel: 'INFO'
        };
        // Apply settings over the defaults:
        for (var item in settings) {
            defaultSettings[item] = settings[item];
        }
        settings = defaultSettings;
        var log = new _logger.Logger(settings.logLevel, (0, _utils.getLoggingName)(elem));

        // Interestingly, you can't just return an existing instance if you haven't called super() yet
        // (may be a WebPack thing) which is why this is down here and not at the top of the constructor:
        var _this = _possibleConstructorReturn(this, _EventHandler.call(this, log));

        if (instances.length) {
            // Existing instance(s); check them for duplicates on the same element
            for (var inst in instances) {
                if (instances[inst].elem === elem) {
                    var _ret;

                    return _ret = instances[inst], _possibleConstructorReturn(_this, _ret); // Enforce singleton per element (efficiency!)
                }
            }
        }
        instances.push(_this); // Used when enforcing singletons
        var listenEvents = settings.listenEvents;
        // For localization of our few strings:
        _this.l = settings.translate;
        listenEvents = listenEvents.concat(settings.addEvents);
        if (settings.removeEvents.length) {
            listenEvents = listenEvents.filter(function (item) {
                return !settings.removeEvents.includes(item);
            });
        }

        _this.settings = settings;
        _this.elem = (0, _utils.getNode)(elem || window);
        _this.Logger = _logger.Logger; // In case someone wants to use it separately
        _this.log = log;
        _this.VERSION = "1.1.3";
        // NOTE: Most state-tracking variables are set inside HumanInput.init()

        // Setup the modifier priorities so we can maintain a consistent ordering of combo events
        var ctrlKeys = CONTROLKEYS.concat(['ctrl']);
        var altKeys = ALTKEYS.concat(AltAltNames);
        var osKeys = OSKEYS.concat(AltOSNames);
        for (i = 0; i < ctrlKeys.length; i++) {
            MODPRIORITY[ctrlKeys[i].toLowerCase()] = 5;
        }
        for (i = 0; i < SHIFTKEYS.length; i++) {
            MODPRIORITY[SHIFTKEYS[i].toLowerCase()] = 4;
        }
        for (i = 0; i < altKeys.length; i++) {
            MODPRIORITY[altKeys[i].toLowerCase()] = 3;
        }
        for (i = 0; i < osKeys.length; i++) {
            MODPRIORITY[osKeys[i].toLowerCase()] = 2;
        }

        // This needs to be set early on so we don't get errors in the early trigger() calls:
        _this.eventMap = { forward: {}, reverse: {} };
        // NOTE: keyMaps are only necessary for Safari
        _this.keyMaps = { 0: {}, 1: {}, 2: {} };
        if (_keymaps.keyMaps) {
            _this.keyMaps = _keymaps.keyMaps;
        }

        // Apply some post-instantiation settings
        if (settings.disableSequences) {
            _this._handleSeqEvents = _utils.noop;
        }
        if (settings.disableSelectors) {
            _this._handleSelectors = _utils.noop;
        }
        // This tries to emulate fullscreen detection since the Fullscreen API doesn't friggin' work when the user presses F11 or selects fullscreen from the menu...
        if (_this.elem === window) {
            _this.on('window:resize', function () {
                // NOTE: This may not work with multiple monitors
                if (window.outerWidth === screen.width && window.outerHeight === screen.height) {
                    _this.state.fullscreen = true;
                    _this.trigger('fullscreen', true);
                } else if (_this.state.fullscreen) {
                    _this.state.fullscreen = false;
                    _this.trigger('fullscreen', false);
                }
            });
        }

        // Reset states if the user alt-tabs away (or similar)
        _this.on('window:blur', _this._resetStates);

        // These functions need to be bound to work properly ('this' will be window or this.elem which isn't what we want)
        ['_composition', '_contextmenu', '_holdCounter', '_keydown', '_keypress', '_keyup', 'trigger'].forEach(function (event) {
            _this[event] = _this[event].bind(_this);
        });

        // Take care of our multi-function functions :)
        _this._compositionstart = _this._composition;
        _this._compositionupdate = _this._composition;
        _this._compositionend = _this._composition;

        // Start er up!
        _this.init();
        return _this;
    }

    HumanInput.prototype.map = function map(eventMap) {
        /**:HumanInput.map(eventMap)
         This function will update ``this.eventMap`` with the given *obj*'s keys and values and then with it's values and keys (so lookups can be performed in reverse).
        */
        for (var item in eventMap) {
            // Create both forward and reverse mappings
            this.eventMap.forward[item] = eventMap[item];
            this.eventMap.reverse[eventMap[item]] = item;
        }
    };

    HumanInput.prototype.init = function init() {
        var _this2 = this;

        var settings = this.settings;
        var listenEvents = settings.listenEvents;
        var debug = this.log.debug;
        if (this.eventCount) {
            // It already exists/reset scenario
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
        this.eventMap = { forward: {}, reverse: {} };
        this.map(settings.eventMap); // Apply any provided eventMap
        // NOTE:  Possible new feature:  Transform events using registerable functions:
        //         this.transforms = []; // Used for transforming event names
        finishedKeyCombo = false; // Internal state tracking of keyboard combos like ctrl-c

        // Enable plugins
        for (var i = 0; i < plugins.length; i++) {
            // Instantiate the plugin (if not already)
            if (!(plugin_instances[i] instanceof plugins[i])) {
                plugin_instances[i] = new plugins[i](this);
            }
            var plugin = plugin_instances[i];
            debug(this.l('Initializing Plugin:'), plugin.constructor.name);
            if ((0, _utils.isFunction)(plugin.init)) {
                var initResult = plugin.init(this);
                for (var attr in initResult.exports) {
                    this[attr] = initResult.exports[attr];
                }
            }
        }

        // Set or reset our event listeners (enables changing built-in events at a later time)
        this.off('hi:pause');
        this.on('hi:pause', function () {
            debug(_this2.l('Pause: Removing event listeners ', listenEvents));
            listenEvents.forEach(function (event) {
                var opts = settings.eventOptions[event] || true;
                if ((0, _utils.isFunction)(_this2['_' + event])) {
                    _this2.elem.removeEventListener(event, _this2['_' + event], opts);
                }
            });
        });
        this.off(['hi:initialized', 'hi:resume']); // In case of re-init
        this.on(['hi:initialized', 'hi:resume'], function () {
            debug('HumanInput Version: ' + _this2.VERSION);
            debug(_this2.l('Start/Resume: Addding event listeners'), listenEvents);
            listenEvents.forEach(function (event) {
                var opts = settings.eventOptions[event] || true;
                if ((0, _utils.isFunction)(_this2['_' + event])) {
                    // TODO: Figure out why removeEventListener isn't working
                    _this2.elem.removeEventListener(event, _this2['_' + event], opts);
                    _this2.elem.addEventListener(event, _this2['_' + event], opts);
                } else {
                    // No function for this event; use the generic event handler and hope for the best
                    _this2['_' + event] = _this2._genericEvent.bind(_this2, '');
                    _this2.elem.addEventListener(event, _this2['_' + event], opts);
                }
            });
        });

        this.trigger('hi:initialized', this);
    };

    HumanInput.prototype.noConflict = function noConflict() {
        window.HumanInput = _HI;
        return HumanInput;
    };

    // Core *internal* API functions

    HumanInput.prototype._resetStates = function _resetStates() {
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
    };

    HumanInput.prototype._resetSeqTimeout = function _resetSeqTimeout() {
        var _this3 = this;

        // Ensure that the seqBuffer doesn't get emptied (yet):
        clearTimeout(this.state.seqTimer);
        this.state.seqTimer = setTimeout(function () {
            _this3.log.debug(_this3.l('Resetting event sequence states due to timeout'));
            _this3._resetStates();
        }, this.settings.sequenceTimeout);
    };

    HumanInput.prototype._genericEvent = function _genericEvent(prefix, e) {
        // Can be used with any event handled via addEventListener() to trigger a corresponding event in HumanInput
        var notFiltered = this.filter(e),
            results;
        if (notFiltered) {
            if (prefix.type) {
                e = prefix;prefix = null;
            }
            if (prefix) {
                prefix = prefix + ':';
            } else {
                prefix = '';
            }
            results = this.trigger(this.scope + prefix + e.type, e);
            if (e.target) {
                // Also triger events like '<event>:#id' or '<event>:.class':
                results = results.concat(this._handleSelectors(prefix + e.type, e));
            }
            (0, _utils.handlePreventDefault)(e, results);
        }
    };

    HumanInput.prototype._sortEvents = function _sortEvents(events) {
        /**:HumanInput._sortEvents(events)
         Sorts and returns the given *events* array (which is normally just a copy of ``this.state.down``) according to HumanInput's event sorting rules.
        */
        var priorities = MODPRIORITY;
        // Basic (case-insensitive) lexicographic sorting first
        events.sort(function (a, b) {
            return a.toLowerCase().localeCompare(b.toLowerCase());
        });
        // Now sort by length
        events.sort(function (a, b) {
            return b.length - a.length;
        });
        // Now apply our special sorting rules
        events.sort(function (a, b) {
            a = a.toLowerCase();
            b = b.toLowerCase();
            if (a in priorities) {
                if (b in priorities) {
                    if (priorities[a] > priorities[b]) {
                        return -1;
                    } else if (priorities[a] < priorities[b]) {
                        return 1;
                    } else {
                        return 0;
                    }
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

    HumanInput.prototype._handleSelectors = function _handleSelectors(eventName) {
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
                for (var i = 0; i < toBind.classList.length; i++) {
                    constructedEvent = eventName + ':.' + toBind.classList.item(i);
                    results = results.concat(this.trigger.apply(toBind, [constructedEvent].concat(args)));
                }
            }
        }
        return results;
    };

    HumanInput.prototype._addDown = function _addDown(event, alt) {
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
    };

    HumanInput.prototype._removeDown = function _removeDown(event) {
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
        if (index === -1) {
            // Still no index?  Try one more thing: Upper case
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
    };

    HumanInput.prototype._doDownEvent = function _doDownEvent(event) {
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
    };

    HumanInput.prototype._keyEvent = function _keyEvent(key) {
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
    };

    // NOTE: Context menu support can't be modularized (see note below for details)


    HumanInput.prototype._contextmenu = function _contextmenu(e) {
        if (this.filter(e)) {
            var results = this._triggerWithSelectors(e.type, [e]);
            /* NOTE: Unless the contextmenu is cancelled (i.e. preventDefault) we need to ensure that we reset all 'down' events.
               The reason for this is because when the context menu comes up in the browser it immediately loses track of all
               keys/buttons just like if the user were to alt-tab to a different application; the 'up' events will never fire.
            */
            if (!(0, _utils.handlePreventDefault)(e, results)) {
                this._resetStates();
            }
        }
    };

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

    HumanInput.prototype._handleShifted = function _handleShifted(down) {
        /* A DRY function to remove the shift key from *down* if warranted (e.g. just ['!'] instead of ['ShiftLeft', '!']).  Returns true if *down* was modified.
         Note that *down* should be a copy of ``this.state.down`` and not the actual ``this.state.down`` array.
        */
        var lastItemIndex = down.length - 1;
        var shiftKeyIndex = -1;
        for (var i = 0; i < down.length; i++) {
            shiftKeyIndex = down[i].indexOf('Shift');
            if (shiftKeyIndex != -1) {
                break;
            }
        }
        if (shiftKeyIndex != -1) {
            // The last key in the 'down' array is all we care about...
            // Use the difference between the 'key' and 'code' (aka the 'alt' name) to detect chars that require shift but aren't uppercase:
            if (down[lastItemIndex] != this.state.downAlt[lastItemIndex]) {
                down.splice(shiftKeyIndex, 1); // Remove the shift key
                return true; // We're done here
            }
        }
    };

    HumanInput.prototype._handleDownEvents = function _handleDownEvents() {
        var settings = this.settings;
        var state = this.state;
        var events = this._downEvents();
        var results = [];
        var args = Array.from(arguments);
        for (var i = 0; i < events.length; i++) {
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
    };

    HumanInput.prototype._handleSeqEvents = function _handleSeqEvents(e) {
        // NOTE: This function should only be called when a button or key is released (i.e. when state changes to UP)
        var state = this.state;
        var seqBuffer = state.seqBuffer;
        var results = [];
        var down = state.down.slice(0);
        if (lastDownLength < down.length) {
            // User just finished a combo (e.g. ctrl-a)
            if (this.sequenceFilter(e)) {
                this._handleShifted(down);
                this._sortEvents(down);
                seqBuffer.push(down);
                if (seqBuffer.length > this.settings.maxSequenceBuf) {
                    // Make sure it stays within the specified max
                    seqBuffer.shift();
                }
                if (seqBuffer.length > 1) {
                    // Trigger all combinations of sequence buffer events
                    var combos = this._seqCombinations(seqBuffer);
                    for (var i = 0; i < combos.length; i++) {
                        var sliced = (0, _utils.seqSlicer)(combos[i]);
                        for (var j = 0; j < sliced.length; j++) {
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
    };

    HumanInput.prototype._normSpecial = function _normSpecial(location, key, code) {
        // Just a DRY function for keys that need some extra love
        if (key == ' ') {
            // Spacebar
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
    };

    HumanInput.prototype._holdCounter = function _holdCounter() {
        // This function triggers 'hold' events every <holdInterval ms> when events are 'down'.
        var state = this.state;
        var settings = this.settings;
        var events = this._downEvents();
        if (!events.length) {
            return;
        }
        clearTimeout(state.holdTimeout);
        var lastArg = state.holdArgs[state.holdArgs.length - 1] || [];
        var realHeldTime = Date.now() - state.holdStart;
        this._resetSeqTimeout(); // Make sure the sequence buffer reset function doesn't clear out our hold times
        for (var i = 0; i < events.length; i++) {
            // This is mostly so plugins and whatnot can do stuff when hold events are triggered
            this.trigger('hold', events[i], realHeldTime);
            // This is the meat of hold events:
            this._triggerWithSelectors('hold:' + state.heldTime + ':' + events[i], lastArg.concat([realHeldTime]));
        }
        state.heldTime += settings.holdInterval;
        if (state.heldTime < 5001) {
            // Any longer than this and it probably means something went wrong (e.g. browser bug with touchend not firing)
            state.holdTimeout = setTimeout(this._holdCounter, settings.holdInterval);
        }
    };

    HumanInput.prototype._triggerWithSelectors = function _triggerWithSelectors(event, args) {
        // A DRY function that triggers the given *event* normally and then via this._handleSelectors()
        var results = [];
        var scopedEvent = this.scope + event;
        results = results.concat(this.trigger.apply(this, [scopedEvent].concat(args)));
        results = results.concat(this._handleSelectors.apply(this, [scopedEvent].concat(args)));
        return results;
    };

    HumanInput.prototype._seqCombinations = function _seqCombinations(buffer, joinChar) {
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
        var replacement = (0, _utils.cloneArray)(buffer);
        var out = [];
        var temp = [];
        for (i = 0; i < buffer.length; i++) {
            out.push(replacement[i].join(joinChar_).toLowerCase());
            // Normalize names (shiftleft becomes shift)
            for (j = 0; j < buffer[i].length; j++) {
                replacement[i][j] = [this._keyEvent(buffer[i][j])];
            }
        }
        out = [out.join(' ')]; // Make a version that has the original key/modifier names (e.g. shiftleft)
        for (i = 0; i < replacement.length; i++) {
            if (replacement[i].length) {
                temp.push((0, _utils.arrayCombinations)(replacement[i], joinChar_));
            }
        }
        for (i = 0; i < temp.length; i++) {
            temp[i] = this.eventMap.forward[temp[i]] || temp[i];
        }
        temp = temp.join(' ');
        if (temp != out[0]) {
            // Only if they're actually different
            out.push(temp);
        }
        return out;
    };

    HumanInput.prototype._downEvents = function _downEvents() {
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
            if (downLength > 1) {
                // Combo; may need shift key removed to generate the correct event (e.g. '!' instead of 'shift-!')
                shiftedKey = this._handleShifted(down);
                // Before sorting, fire the precise combo event
                events = events.concat(this._seqCombinations([down], '->'));
                if (shiftedKey) {
                    // Generate events for the un-shifted chars (e.g. shift->1, shift->2, etc)
                    events = events.concat(this._seqCombinations([unshiftedDown], '->'));
                }
            }
            if (down.length > 1) {
                // Is there more than one item *after* we may have removed shift?
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
    };

    HumanInput.prototype._keydown = function _keydown(e) {
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
        var fpEvent = this.scope + 'faceplant';
        if (e.repeat && this.settings.noKeyRepeat) {
            e.preventDefault(); // Make sure keypress doesn't fire after this
            return false; // Don't do anything if key repeat is disabled
        }
        key = this._normSpecial(location, key, code);
        if (key == 'Compose') {
            // This indicates that the user is entering a composition
            state.composing = true;
            return;
        }
        if (!state.down.includes(key)) {
            this._addDown(key, code);
        }
        // Don't let the sequence buffer reset if the user is active:
        this._resetSeqTimeout();
        if (this.filter(e)) {
            // This is in case someone wants just on('keydown'):
            results = this._triggerWithSelectors(event, [e, key, code]);
            // Now trigger the more specific keydown:<key> event:
            results = results.concat(this._triggerWithSelectors(event += ':' + key.toLowerCase(), [e, key, code]));
            if (state.down.length > 5) {
                // 6 or more keys down at once?  FACEPLANT!
                results = results.concat(this.trigger(fpEvent, e)); // ...or just key mashing :)
            }
            /* NOTE: For browsers that support KeyboardEvent.key we can trigger the usual
                    events inside _keydown() (which is faster) but other browsers require
                    _keypress() be called first to fix localized/shifted keys.  So for those
                    browser we call _handleDownEvents() inside _keyup(). */
            if (KEYSUPPORT) {
                results = results.concat(this._handleDownEvents(e, key, code));
            }
            (0, _utils.handlePreventDefault)(e, results);
        }
    };
    // NOTE: Use of _keypress is only necessary until Safari supports KeyboardEvent.key!


    HumanInput.prototype._keypress = function _keypress(e) {
        // NOTE: keypress events don't always fire when modifiers are used!
        //       This means that such browsers may never get sequences like 'ctrl-?'
        var charCode = e.charCode || e.which,
            key = e.key || String.fromCharCode(charCode);
        if (!KEYSUPPORT && charCode > 47 && key.length) {
            // Replace the possibly-incorrect key with the correct one
            this.state.down.pop();
            this.state.down.push(key);
        }
    };

    HumanInput.prototype._keyup = function _keyup(e) {
        var state = this.state;
        var results;
        var keyCode = e.which || e.keyCode;
        var location = e.location || 0;
        // NOTE: Should I put e.code first below?  Hmmm.  Should we allow keyMaps to override the browser's native key name if it's available?
        var code = this.keyMaps[location][keyCode] || this.keyMaps[0][keyCode] || e.code;
        var key = e.key || code;
        var event = e.type;
        key = this._normSpecial(location, key, code);
        if (!state.downAlt.length) {
            // Implies key states were reset or out-of-order somehow
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
            (0, _utils.handlePreventDefault)(e, results);
        }
        // Remove the key from this.state.down even if we're filtered (state must stay accurate)
        this._removeDown(key);
    };

    HumanInput.prototype._composition = function _composition(e) {
        var data = e.data;
        var event = 'compos';
        if (this.filter(e)) {
            var results = this._triggerWithSelectors(e.type, [e, data]);
            if (data) {
                if (e.type == 'compositionupdate') {
                    event += 'ing:"' + data + '"';
                } else if (e.type == 'compositionend') {
                    event += 'ed:"' + data + '"';
                }
                results = results.concat(this._triggerWithSelectors(event, [e]));
                (0, _utils.handlePreventDefault)(e, results);
            }
        }
    };

    // Public API functions

    HumanInput.prototype.filter = function filter(event) {
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
    };

    HumanInput.prototype.sequenceFilter = function sequenceFilter(event) {
        /**:HumanInput.sequenceFilter(event)
         This function gets called before HumanInput events are added to the sequence buffer.  If it returns ``False`` then the event will not be added to the sequence buffer.
         Override this function to implement your own filter.
         .. note:: The given *event* won't always be a browser-generated event but it should always have a 'type' and 'target'.
        */
        return true; // Don't filter out anything
    };

    HumanInput.prototype.pushScope = function pushScope(scope) {
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

    HumanInput.prototype.popScope = function popScope() {
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
        if (this.scope == ':') {
            this.scope = '';
        }
    };

    HumanInput.prototype.pause = function pause() {
        /**:HumanInput.pause()
         Halts all triggering of events until :js:func:`HumanInput.resume` is called.
        */
        this.state.paused = true;
        this.trigger('hi:pause', this);
    };

    HumanInput.prototype.resume = function resume() {
        /**:HumanInput.resume()
         Restarts triggering of events after a call to :js:func:`HumanInput.pause`.
        */
        this.state.paused = false;
        this.trigger('hi:resume', this);
    };

    HumanInput.prototype.startRecording = function startRecording() {
        /**:HumanInput.startRecording()
         Starts recording all triggered events.  The array of recorded events will be returned when :js:func:`HumanInput.stopRecording` is called.
         .. note:: You can tell if HumanInput is currently recording events by examining the ``HI.recording`` (instance) attribute (boolean).
         .. warning:: Don't leave the recording running for too long as there's no limit to how big it can get!
        */
        this.state.recording = true;
        this.state.recordedEvents = [];
    };

    HumanInput.prototype.stopRecording = function stopRecording(filter) {
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
        var hasSelector = function hasSelector(str) {
            return str.includes(':#') || str.includes(':.');
        };
        this.state.recording = false;
        if (!filter) {
            return recordedEvents;
        }
        if (filter == 'keystroke') {
            // Filter out events with selectors since we don't want those for this sort of thing:
            var filteredEvents = recordedEvents.filter(hasSelector);
            // Return the event that comes before the last 'keyup'
            regex = new RegExp('keyup');
            for (var i = 0; i < filteredEvents.length; i++) {
                if (regex.test(filteredEvents[i])) {
                    break;
                }
                keystroke = filteredEvents[i];
            }
            return keystroke;
        }
        // Apply the filter
        var events = recordedEvents.filter(function (item) {
            return regex.test(item);
        });
        return events;
    };

    HumanInput.prototype.getSelText = function getSelText() {
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
    };

    HumanInput.prototype.isDown = function isDown(name) {
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
        for (var i = 0; i < state.down.length; i++) {
            var down = state.down[i].toLowerCase();
            var downAlt = state.downAlt[i].toLowerCase(); // In case something changed between down and up events
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
    };

    HumanInput.prototype.getDown = function getDown() {
        /**:HumanInput.getDown()
         ...and boogie!  Returns the current state of all keys/buttons/whatever inside the ``this.state.down`` array in a user friendly format.  For example, if the user is holding down the shift, control, and 'i' this function would return 'ctrl-shift-i' (it will always match HumanInput's event ordering).  The results it returns will always be lowercase.
         .. note:: This function does not return location-specific names like 'shiftleft'.  It will always use the short name (e.g. 'shift').
        */
        var down = this._sortEvents(this.state.down.slice(0));
        var trailingDash = new RegExp('-$');
        var out = '';
        for (var i = 0; i < down.length; i++) {
            out += this._keyEvent(down[i]) + '-';
        }
        return out.replace(trailingDash, ''); // Remove trailing dash
    };

    _createClass(HumanInput, [{
        key: 'instances',
        get: function get() {
            return instances;
        }
    }, {
        key: 'plugins',
        get: function get() {
            return plugins;
        }
    }]);

    return HumanInput;
}(_events.EventHandler);

HumanInput.instances = instances; // So we can enforce singleton
HumanInput.plugins = plugins;
HumanInput.defaultListenEvents = defaultEvents;

exports.default = HumanInput;
module.exports = exports['default'];

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
'use strict';

exports.__esModule = true;
exports.EventHandler = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * events.js - Event emitter for HumanInput
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Copyright (c) 2016, Dan McDougall
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * @link https://github.com/liftoff/HumanInput/src/events.js
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * @license Apache-2.0
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */

// import { Promise } from 'es6-promise-polyfill';


var _utils = __webpack_require__(1);

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var EventHandler = exports.EventHandler = function () {
    function EventHandler(logger) {
        _classCallCheck(this, EventHandler);

        // Built-in aliases
        this.aliases = {
            tap: 'click',
            taphold: 'hold:1500:pointer:left',
            clickhold: 'hold:1500:pointer:left',
            middleclick: 'pointer:middle',
            rightclick: 'pointer:right',
            doubleclick: 'dblclick', // For consistency with naming
            konami: 'up up down down left right left right b a enter',
            portrait: 'window:orientation:portrait',
            landscape: 'window:orientation:landscape',
            hulksmash: 'faceplant',
            twofingertap: 'multitouch:2:tap',
            threefingertap: 'multitouch:3:tap',
            fourfingertap: 'multitouch:4:tap'
        };
        this.events = {};
        this.log = logger; // NOTE: The logger must already be instantiated
        // Handy aliases
        this.one = this.once; // Handy dandy alias so jQuery folks don't get confused =)
        this.emit = this.trigger; // Some people prefer 'emit()'; we can do that!
    }

    EventHandler.prototype._handleAliases = function _handleAliases(event) {
        // DRY function to handle swapping out event aliases and making sure 'shift-' gets added where necessary
        event = this.aliases[event] || event; // Resolve any aliases
        if (event.length === 1 && (0, _utils.isUpper)(event)) {
            // Convert uppercase chars to shift-<key> equivalents
            event = 'shift-' + event;
        }
        return event;
    };

    EventHandler.prototype.on = function on(events, callback, context, times) {
        var _this = this;

        (0, _utils.normEvents)(events).forEach(function (event) {
            if (event.includes(':')) {
                // Contains a scope (or other divider); we need to split it up to resolve aliases
                var splitChar = ':';
            } else if (event.includes(' ')) {
                // It's (likely) a sequence
                var splitChar = ' ';
            }
            if (splitChar) {
                // NOTE: This won't hurt anything if we accidentally matched on something in quotes
                var splitRegex = new RegExp(splitChar + '(?=(?:(?:[^"]*"){2})*[^"]*$)', 'g');
                var splitEvents = event.split(splitRegex);
                event = '';
                for (var i = 0; i < splitEvents.length; i++) {
                    event += _this._handleAliases(splitEvents[i]) + splitChar;
                }
                event = event.replace(new RegExp(splitChar + '+$'), ""); // Remove trailing colons
            } else {
                event = _this._handleAliases(event);
            }
            event = event.toLowerCase(); // All events are normalized to lowercase for consistency
            if (event.includes('-')) {
                // Combo
                if (event.includes('->')) {
                    // Pre-sort non-ordered combos
                    event = _this._normCombo(event);
                }
            }
            // Force an empty object as the context if none given (simplifies things)
            if (!context) {
                context = {};
            }
            var callList = _this.events[event];
            var callObj = {
                callback: callback,
                context: context,
                times: times
            };
            if (!callList) {
                callList = _this.events[event] = [];
            }
            callList.push(callObj);
        });
        return this;
    };

    EventHandler.prototype.once = function once(events, callback, context) {
        return this.on(events, callback, context, 1);
    };

    EventHandler.prototype.off = function off(events, callback, context) {
        if (!arguments.length) {
            // Called with no args?  Remove all events:
            this.events = {};
        } else {
            events = events ? (0, _utils.normEvents)(events) : Object.keys(this.events);
            for (var _iterator = events, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
                var _ref;

                if (_isArray) {
                    if (_i >= _iterator.length) break;
                    _ref = _iterator[_i++];
                } else {
                    _i = _iterator.next();
                    if (_i.done) break;
                    _ref = _i.value;
                }

                var i = _ref;

                var event = events[i];
                var callList = this.events[event];
                if (callList) {
                    var newList = [];
                    if (!context) {
                        if (!callback) {
                            // No context or callback? Just delete the event and be done:
                            delete this.events[event];
                            break;
                        }
                    }
                    for (var n = 0; n < callList.length; n++) {
                        if (callback) {
                            if (callList[n].callback.toString() == callback.toString()) {
                                // Functions are the same but are the contexts?  Let's check...
                                if ((context === null || context === undefined) && callList[n].context) {
                                    newList.push(callList[n]);
                                } else if (!(0, _utils.isEqual)(callList[n].context, context)) {
                                    newList.push(callList[n]);
                                }
                            } else {
                                newList.push(callList[n]);
                            }
                        } else if (context && callList[n].context !== context) {
                            newList.push(callList[n]);
                        }
                    }
                    if (!newList.length) {
                        delete this.events[event];
                    } else {
                        this.events[event] = newList;
                    }
                }
            }
        }
        return this;
    };

    EventHandler.prototype.trigger = function trigger(events) {
        var _this2 = this;

        var results = []; // Did we successfully match and trigger an event?
        var args = Array.from(arguments).slice(1);
        (0, _utils.normEvents)(events).forEach(function (event) {
            event = _this2.aliases[event] || event; // Apply the alias, if any
            event = _this2.eventMap.forward[event] || event; // Apply any event re-mapping
            _this2.log.debug('Triggering:', event, args.length ? args : '');
            if (_this2.recording) {
                recordedEvents.push(event);
            }
            var callList = _this2.events[event];
            if (callList) {
                for (var i = 0; i < callList.length; i++) {
                    var callObj = callList[i];
                    if (callObj.context !== window) {
                        // Only update the context with HIEvent if it's not the window (no messing with global namespace!)
                        callObj.context.HIEvent = event;
                    }
                    if (callObj.times) {
                        callObj.times -= 1;
                        if (callObj.times === 0) {
                            _this2.off(event, callObj.callback, callObj.context);
                        }
                    }
                    results.push(callObj.callback.apply(callObj.context || _this2, args));
                }
            }
        });
        return results;
    };

    _createClass(EventHandler, [{
        key: 'eventCount',
        get: function get() {
            var i = 0;
            for (var item in this.events) {
                i++;
            }
            return i;
        }
    }]);

    return EventHandler;
}();

/***/ },
/* 5 */
/***/ function(module, exports) {

"use strict";
'use strict';

exports.__esModule = true;
// Key mappings for browsers that don't support KeyboardEvent.key (i.e. Safari!)

// NOTE: We *may* have to deal with control codes at some point in the future so I'm leaving this here for the time being:
//     self.controlCodes = {0: "NUL", 1: "DC1", 2: "DC2", 3: "DC3", 4: "DC4", 5: "ENQ", 6: "ACK", 7: "BEL", 8: "BS", 9: "HT", 10: "LF", 11: "VT", 12: "FF", 13: "CR", 14: "SO", 15: "SI", 16: "DLE", 21: "NAK", 22: "SYN", 23: "ETB", 24: "CAN", 25: "EM", 26: "SUB", 27: "ESC", 28: "FS", 29: "GS", 30: "RS", 31: "US"};
//     for (var key in self.controlCodes) { self.controlCodes[self.controlCodes[key]] = key; } // Also add the reverse mapping

// BEGIN CODE THAT IS ONLY NECESSARY FOR SAFARI

// NOTE: These location-based keyMaps will only be necessary as long as Safari lacks support for KeyboardEvent.key.
//       Some day we'll be able to get rid of these (hurry up Apple!).
var MACOS = window.navigator.userAgent.includes('Mac OS X');
var keyMaps = exports.keyMaps = { // NOTE: 0 will be used if not found in a specific location
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
        'Down': 40,
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
    },
    3: { // KeyboardEvent.DOM_LOCATION_NUMPAD
        '*': 106,
        '+': 107,
        '-': 109,
        '.': 46,
        '/': 111
    }
};
// The rest of the keyMaps are straightforward:
// 1 - 0
for (var i = 48; i <= 57; i++) {
    keyMaps[0][i] = '' + (i - 48);
}
// A - Z
for (var _i = 65; _i <= 90; _i++) {
    keyMaps[0][_i] = String.fromCharCode(_i);
}
// NUM_PAD_0 - NUM_PAD_9
for (var _i2 = 96; _i2 <= 105; _i2++) {
    keyMaps[3][_i2] = 'Numpad' + (_i2 - 96);
}
// F1 - F12
for (var _i3 = 112; _i3 <= 123; _i3++) {
    keyMaps[0][_i3] = 'F' + (_i3 - 112 + 1);
}
// Extra Mac keys:
if (MACOS) {
    var macSpecials = {
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
    for (var attr in macSpecials) {
        keyMaps[0][attr] = macSpecials[attr];
    }
    for (var _i4 = 63236; _i4 <= 63242; _i4++) {
        keyMaps[0][_i4] = 'F' + (_i4 - 63236 + 1);
    }
}
// Make keyMaps work both forward and in reverse:
var _loop = function _loop(_i5) {
    Object.keys(keyMaps[_i5]).forEach(function (key) {
        if (key.length > 1 && !isNaN(key)) {
            key = parseInt(key);
        }
        keyMaps[_i5][keyMaps[_i5][key]] = key;
    });
};

for (var _i5 = 0; _i5 <= 3; _i5++) {
    _loop(_i5);
}

// END CODE THAT IS ONLY NECESSARY FOR SAFARI

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
'use strict';

exports.__esModule = true;
exports.Logger = undefined;

var _utils = __webpack_require__(1);

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } } /**
                                                                                                                                                           * logger.js - HumanInput Logger: A really nice logging class
                                                                                                                                                           * Copyright (c) 2016, Dan McDougall
                                                                                                                                                           * @link https://github.com/liftoff/HumanInput/src/logger.js
                                                                                                                                                           * @license Apache-2.0
                                                                                                                                                           */

var console = window.console;
var levels = {
    40: 'ERROR', 30: 'WARNING', 20: 'INFO', 10: 'DEBUG', // Forward
    'ERROR': 40, 'WARNING': 30, 'INFO': 20, 'DEBUG': 10 // Reverse
};

var Logger = exports.Logger = function () {
    function Logger(lvl, prefix) {
        _classCallCheck(this, Logger);

        this.prefix = prefix;
        this.setLevel(lvl);
        this.writeErr = this.fallback;
        this.writeWarn = this.fallback;
        this.writeInfo = this.fallback;
        this.writeDebug = this.fallback;
        if ((0, _utils.isFunction)(console.error)) {
            this.writeErr = console.error;
        }
        if ((0, _utils.isFunction)(console.warn)) {
            this.writeWarn = console.warn;
        }
        if ((0, _utils.isFunction)(console.info)) {
            this.writeInfo = console.info;
        }
        if ((0, _utils.isFunction)(console.debug)) {
            this.writeDebug = console.debug;
        }
    }

    Logger.prototype.setLevel = function setLevel(level) {
        level = level.toUpperCase();
        this.error = this.write.bind(this, 40);
        this.warn = this.write.bind(this, 30);
        this.info = this.write.bind(this, 20);
        this.debug = this.write.bind(this, 10);
        this.logLevel = level;
        if (isNaN(level)) {
            this.logLevel = level = levels[level];
        }
        // These conditionals are just a small performance optimization:
        if (level > 40) {
            this.error = _utils.noop;
        }
        if (level > 30) {
            this.warn = _utils.noop;
        }
        if (level > 20) {
            this.info = _utils.noop;
        }
        if (level > 10) {
            this.debug = _utils.noop;
        }
    };

    Logger.prototype.fallback = function fallback(level) {
        var args = Array.from(arguments);
        args[0] = this.prefix + levels[level] + ' ' + args[0];
        if ((0, _utils.isFunction)(console.log)) {
            console.log.apply(console, args);
        }
    };

    Logger.prototype.write = function write(level) {
        var logLevel = this.logLevel;
        var args = Array.from(arguments).slice(1);
        if (this.prefix.length) {
            args.unshift(this.prefix);
        }
        if (level === 40 && logLevel <= 40) {
            this.writeErr.apply(console, args);
        } else if (level === 30 && logLevel <= 30) {
            this.writeWarn.apply(console, args);
        } else if (level === 20 && logLevel <= 20) {
            this.writeInfo.apply(console, args);
        } else if (level === 10 && logLevel <= 10) {
            this.writeDebug.apply(console, args);
        }
    };

    return Logger;
}();

/***/ },
/* 7 */
/***/ function(module, exports) {

"use strict";
'use strict';

exports.__esModule = true;
exports.polyfill = polyfill;
// Just the polyfills we need; not the entire monster that is babel-polyfill

function polyfill() {
    // Array polyfills
    if (!Array.from) {
        Array.prototype.from = function (object) {
            return [].slice.call(object);
        };
    }
    if (!Array.prototype.includes) {
        Array.prototype.includes = function (searchElement /*, fromIndex*/) {
            var k,
                currentElement,
                O = Object(this),
                len = parseInt(O.length, 10) || 0,
                n = parseInt(arguments[1], 10) || 0;
            if (len === 0) {
                return false;
            }
            if (n >= 0) {
                k = n;
            } else {
                k = len + n;
                if (k < 0) {
                    k = 0;
                }
            }
            while (k < len) {
                currentElement = O[k];
                if (searchElement === currentElement || searchElement !== searchElement && currentElement !== currentElement) {
                    // NaN !== NaN
                    return true;
                }
                k++;
            }
            return false;
        };
    }
    // String polyfills
    if (!String.prototype.includes) {
        String.prototype.includes = function (search, start) {
            if (typeof start !== 'number') {
                start = 0;
            }
            if (start + search.length > this.length) {
                return false;
            } else {
                return this.indexOf(search, start) !== -1;
            }
        };
    }
    if (!String.prototype.endsWith) {
        String.prototype.endsWith = function (searchString, position) {
            var subjectString = this.toString();
            if (typeof position !== 'number' || !isFinite(position) || Math.floor(position) !== position || position > subjectString.length) {
                position = subjectString.length;
            }
            position -= searchString.length;
            var lastIndex = subjectString.indexOf(searchString, position);
            return lastIndex !== -1 && lastIndex === position;
        };
    }
    if (!String.prototype.startsWith) {
        String.prototype.startsWith = function (searchString, position) {
            position = position || 0;
            return this.substr(position, searchString.length) === searchString;
        };
    }
};

/***/ },
/* 8 */
/***/ function(module, exports) {

"use strict";
"use strict";

exports.__esModule = true;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

exports.noop = noop;
exports.getLoggingName = getLoggingName;
exports.getNode = getNode;
exports.normEvents = normEvents;
exports.handlePreventDefault = handlePreventDefault;
exports.seqSlicer = seqSlicer;
exports.cloneArray = cloneArray;
exports.arrayCombinations = arrayCombinations;
exports.isFunction = isFunction;
exports.isString = isString;
exports.partial = partial;
exports.debounce = debounce;
exports.isEqual = isEqual;
exports.isUpper = isUpper;
exports._normCombo = _normCombo;
exports.addListeners = addListeners;
exports.removeListeners = removeListeners;

// Utility functions
function noop(a) {
    return a;
};

function getLoggingName(obj) {
    // Try to get a usable name/prefix for the default logger
    var name = '';
    if (obj.name) {
        name += " " + obj.name;
    } else if (obj.id) {
        name += " " + obj.id;
    } else if (obj.nodeName) {
        name += " " + obj.nodeName;
    }
    return '[HI' + name + ']';
};

function getNode(nodeOrSelector) {
    if (typeof nodeOrSelector == 'string') {
        var result = document.querySelector(nodeOrSelector);
        return result;
    }
    return nodeOrSelector;
};

function normEvents(events) {
    // Converts events to an array if it's a single event (a string)
    if (isString(events)) {
        return [events];
    }
    return events;
};

function handlePreventDefault(e, results) {
    // Just a DRY method
    // If any of the 'results' are false call preventDefault()
    if (results.includes(false)) {
        e.preventDefault();
        return true; // Reverse the logic meaning, "default was prevented"
    }
};

function seqSlicer(seq) {
    /**:utils.seqSlicer(seq)
     Returns all possible combinations of sequence events given a string of keys.  For example::
         'a b c d'
     Would return:
         ['a b c d', 'b c d', 'c d']
     .. note:: There's no need to emit 'a b c' since it would have been emitted before the 'd' was added to the sequence.
    */
    var events = [],
        i,
        s,
        joined;
    // Split by spaces but ignore spaces inside quotes:
    seq = seq.split(/ +(?=(?:(?:[^"]*"){2})*[^"]*$)/g);
    for (i = 0; i < seq.length - 1; i++) {
        s = seq.slice(i);
        joined = s.join(' ');
        if (!events.includes(joined)) {
            events.push(joined);
        }
    }
    return events;
};

function cloneArray(arr) {
    // Performs a deep copy of the given *arr*
    if (isArray(arr)) {
        var copy = arr.slice(0);
        for (var i = 0; i < copy.length; i++) {
            copy[i] = cloneArray(copy[i]);
        }
        return copy;
    } else {
        return arr;
    }
};

function arrayCombinations(arr, separator) {
    var result = [];
    if (arr.length === 1) {
        return arr[0];
    } else {
        var remaining = arrayCombinations(arr.slice(1), separator);
        for (var i = 0; i < remaining.length; i++) {
            for (var n = 0; n < arr[0].length; n++) {
                result.push(arr[0][n] + separator + remaining[i]);
            }
        }
        return result;
    }
};
var toString = exports.toString = Object.prototype.toString;
function isFunction(obj) {
    return toString.call(obj) == '[object Function]';
};
function isString(obj) {
    return toString.call(obj) == '[object String]';
};
var isArray = exports.isArray = Array.isArray;

function partial(func) {
    var args = Array.from(arguments).slice(1);
    return function () {
        return func.apply(this, args.concat(Array.from(arguments)));
    };
};

function debounce(func, wait, immediate) {
    var timeout, result;
    return function () {
        var context = this;
        var args = arguments;
        var later = function later() {
            timeout = null;
            if (!immediate) {
                result = func.apply(context, args);
            }
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) {
            result = func.apply(context, args);
        }
        return result;
    };
};

function isEqual(x, y) {
    return x && y && (typeof x === "undefined" ? "undefined" : _typeof(x)) === 'object' && (typeof y === "undefined" ? "undefined" : _typeof(y)) === 'object' ? Object.keys(x).length === Object.keys(y).length && Object.keys(x).reduce(function (isEqual, key) {
        return isEqual && isEqual(x[key], y[key]);
    }, true) : x === y;
};

function isUpper(str) {
    if (str == str.toUpperCase() && str != str.toLowerCase()) {
        return true;
    }
};

function _normCombo(event) {
    /**:_normCombo(event)
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
    var self = this;
    var events = event.split('-'); // Separate into parts
    var ctrlCheck = function ctrlCheck(key) {
        if (key == 'control') {
            // This one is simpler than the others
            return self.ControlKeyEvent;
        }
        return key;
    };
    var altCheck = function altCheck(key) {
        for (var j = 0; j < self.AltAltNames.length; j++) {
            if (key == self.AltAltNames[j]) {
                return self.AltKeyEvent;
            }
        }
        return key;
    };
    var osCheck = function osCheck(key) {
        for (var j = 0; j < self.AltOSNames.length; j++) {
            if (key == self.AltOSNames[j]) {
                return self.OSKeyEvent;
            }
        }
        return key;
    };
    // First ensure all the key names are consistent
    for (var i = 0; i < events.length; i++) {
        events[i] = events[i].toLowerCase();
        events[i] = ctrlCheck(events[i]);
        events[i] = altCheck(events[i]);
        events[i] = osCheck(events[i]);
    }
    // Now sort them
    self._sortEvents(events);
    return events.join('-');
};

function addListeners(elem, events, func, useCapture) {
    /**:HumanInput.addListeners()
     Calls ``addEventListener()`` on the given *elem* for each event in the given *events* array passing it *func* and *useCapture* which are the same arguments that would normally be passed to ``addEventListener()``.
    */
    events.forEach(function (event) {
        elem.addEventListener(event, func, useCapture);
    });
}

function removeListeners(elem, events, func, useCapture) {
    /**:HumanInput.removeListeners()
     Calls ``removeEventListener()`` on the given *elem* for each event in the given *events* array passing it *func* and *useCapture* which are the same arguments that would normally be passed to ``removeEventListener()``.
    */
    events.forEach(function (event) {
        elem.removeEventListener(event, func, useCapture);
    });
}

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {module.exports = global["HumanInput"] = __webpack_require__(4);
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {module.exports = global["HumanInput"] = __webpack_require__(5);
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {module.exports = global["HumanInput"] = __webpack_require__(6);
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {module.exports = global["HumanInput"] = __webpack_require__(7);
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ }
/******/ ])
});
;
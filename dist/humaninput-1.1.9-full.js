(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["humaninput-full"] = factory();
	else
		root["HumanInput"] = root["HumanInput"] || {}, root["HumanInput"]["humaninput-full"] = factory();
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
/******/ 	return __webpack_require__(__webpack_require__.s = 28);
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

/* WEBPACK VAR INJECTION */(function(global) {module.exports = global["HumanInput"] = __webpack_require__(10);
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {module.exports = global["HumanInput"] = __webpack_require__(4);
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {module.exports = global["HumanInput"] = __webpack_require__(5);
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
'use strict';

exports.__esModule = true;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _polyfills = __webpack_require__(14);

var _constants = __webpack_require__(3);

var _utils = __webpack_require__(1);

var _logger = __webpack_require__(13);

var _events = __webpack_require__(11);

var _keymaps = __webpack_require__(12);

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

// NOTE: "blur", "reset", and "submit" are all just handled via _genericEvent()
var defaultEvents = ["blur", "click", "compositionend", "compositionstart", "compositionupdate", "contextmenu", "focus", "hold", "input", "keydown", "keypress", "keyup", "reset", "submit"];

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

var HumanInput = function (_EventHandler) {
    _inherits(HumanInput, _EventHandler);

    // Core API functions

    function HumanInput(elem, settings) {
        var _settings$listenEvent;

        _classCallCheck(this, HumanInput);

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
            logLevel: 'INFO',
            logPrefix: (0, _utils.getLoggingName)(elem)
        };
        // Apply settings over the defaults:
        for (var item in settings) {
            defaultSettings[item] = settings[item];
        }
        settings = defaultSettings;
        var log = new _logger.Logger(settings.logLevel, settings.logPrefix);

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
        // For localization of our few strings:
        _this.l = settings.translate;
        (_settings$listenEvent = settings.listenEvents).push.apply(_settings$listenEvent, settings.addEvents);
        if (settings.removeEvents.length) {
            settings.listenEvents = settings.listenEvents.filter(function (item) {
                return !settings.removeEvents.includes(item);
            });
        }

        _this.settings = settings;
        _this.elem = (0, _utils.getNode)(elem || window);
        _this.Logger = _logger.Logger; // In case someone wants to use it separately
        _this.log = log;
        _this.VERSION = "1.1.9";
        _this.plugin_instances = []; // Each instance of HumanInput gets its own set of plugin instances
        // NOTE: Most state-tracking variables are set inside HumanInput.init()

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

        // These functions need to be bound to work properly ('this' will be window or this.elem which isn't what we want)
        ['_composition', '_contextmenu', '_holdCounter', '_resetSeqTimeout', '_resetStates', '_keydown', '_keypress', '_keyup', 'trigger'].forEach(function (event) {
            _this[event] = _this[event].bind(_this);
        });

        // Take care of our multi-function functions :)
        _this._compositionstart = _this._composition;
        _this._compositionupdate = _this._composition;
        _this._compositionend = _this._composition;

        // Add some generic window/document events so plugins don't need to handle
        // them on their own; it's better to have *one* listener.
        if (typeof document.hidden !== "undefined") {
            document.addEventListener('visibilitychange', function (e) {
                if (document.hidden) {
                    _this.trigger('document:hidden', e);
                } else {
                    _this.trigger('document:visible', e);
                }
            }, false);
        }
        var genericHandler = _this._genericEvent.bind(_this, 'window');
        // Window focus and blur are also almost always user-initiated:
        if (window.onblur !== undefined) {
            (0, _utils.addListeners)(window, ['blur', 'focus'], genericHandler, true);
        }
        if (_this.elem === window) {
            // Only attach window events if HumanInput was instantiated on the 'window'
            // These events are usually user-initiated so they count:
            (0, _utils.addListeners)(window, ['beforeunload', 'hashchange', 'languagechange'], genericHandler, true);
            // Window resizing needs some de-bouncing or you end up with far too many events being fired while the user drags:
            window.addEventListener('resize', (0, _utils.debounce)(genericHandler, 250), true);
            // Orientation change is almost always human-initiated:
            if (window.orientation !== undefined) {
                window.addEventListener('orientationchange', function (e) {
                    var event = 'window:orientation';
                    _this.trigger(event, e);
                    // NOTE: There's built-in aliases for 'landscape' and 'portrait'
                    if (Math.abs(window.orientation) === 90) {
                        _this.trigger(event + ':landscape', e);
                    } else {
                        _this.trigger(event + ':portrait', e);
                    }
                }, false);
            }
        }

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

        // Setup our basic window listen events
        // This tries to emulate fullscreen detection since the Fullscreen API doesn't friggin' work when the user presses F11 or selects fullscreen from the menu...
        if (this.elem === window) {
            this.on('window:resize', function () {
                // NOTE: This may not work with multiple monitors
                if (window.outerWidth === screen.width && window.outerHeight === screen.height) {
                    _this2.state.fullscreen = true;
                    _this2.trigger('fullscreen', true);
                } else if (_this2.state.fullscreen) {
                    _this2.state.fullscreen = false;
                    _this2.trigger('fullscreen', false);
                }
            });
        }

        // Reset states if the user alt-tabs away (or similar)
        this.on('window:blur', this._resetStates);

        // Enable plugins
        for (var i = 0; i < plugins.length; i++) {
            // Instantiate the plugin (if not already)
            if (!(this.plugin_instances[i] instanceof plugins[i])) {
                this.plugin_instances[i] = new plugins[i](this);
            }
            var plugin = this.plugin_instances[i];
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
        if (_constants.CONTROLKEYS.includes(key)) {
            return _constants.ControlKeyEvent;
        } else if (_constants.ALTKEYS.includes(key)) {
            return _constants.AltKeyEvent;
        } else if (_constants.SHIFTKEYS.includes(key)) {
            return _constants.ShiftKeyEvent;
        } else if (_constants.OSKEYS.includes(key)) {
            return _constants.OSKeyEvent;
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
                (0, _utils.sortEvents)(down);
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
                (0, _utils.sortEvents)(down);
                // Make events for all alternate names (e.g. 'controlleft-a' and 'ctrl-a'):
                events = events.concat(this._seqCombinations([down]));
            }
            if (shiftedKey) {
                (0, _utils.sortEvents)(unshiftedDown);
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
            return !(str.includes(':#') || str.includes(':.'));
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
            } else if (_constants.SHIFTKEYS.includes(state.down[i])) {
                if (name == _constants.ShiftKeyEvent) {
                    return true;
                }
            } else if (_constants.CONTROLKEYS.includes(state.down[i])) {
                if (name == _constants.ControlKeyEvent) {
                    return true;
                }
            } else if (_constants.ALTKEYS.includes(state.down[i])) {
                if (name == _constants.AltKeyEvent) {
                    return true;
                }
            } else if (_constants.OSKEYS.includes(state.down[i])) {
                if (name == _constants.OSKeyEvent) {
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
        var down = (0, _utils.sortEvents)(this.state.down.slice(0));
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
/* 5 */
/***/ function(module, exports) {

"use strict";
'use strict';

exports.__esModule = true;
var OSKEYS = exports.OSKEYS = ['OS', 'OSLeft', 'OSRight'];
var CONTROLKEYS = exports.CONTROLKEYS = ['Control', 'ControlLeft', 'ControlRight'];
var ALTKEYS = exports.ALTKEYS = ['Alt', 'AltLeft', 'AltRight'];
var SHIFTKEYS = exports.SHIFTKEYS = ['Shift', 'ShiftLeft', 'ShiftRight', '⇧'];
var ControlKeyEvent = exports.ControlKeyEvent = 'ctrl';
var ShiftKeyEvent = exports.ShiftKeyEvent = 'shift';
var AltKeyEvent = exports.AltKeyEvent = 'alt';
var OSKeyEvent = exports.OSKeyEvent = 'os';
var AltAltNames = exports.AltAltNames = ['option', '⌥'];
var AltOSNames = exports.AltOSNames = ['meta', 'win', '⌘', 'cmd', 'command'];
var MODPRIORITY = exports.MODPRIORITY = {};

// Setup the modifier priorities so we can maintain a consistent ordering of combo events
var ctrlKeys = CONTROLKEYS.concat(['ctrl']);
var altKeys = ALTKEYS.concat(AltAltNames);
var osKeys = OSKEYS.concat(AltOSNames);
for (var i = 0; i < ctrlKeys.length; i++) {
    MODPRIORITY[ctrlKeys[i].toLowerCase()] = 5;
}
for (var _i = 0; _i < SHIFTKEYS.length; _i++) {
    MODPRIORITY[SHIFTKEYS[_i].toLowerCase()] = 4;
}
for (var _i2 = 0; _i2 < altKeys.length; _i2++) {
    MODPRIORITY[altKeys[_i2].toLowerCase()] = 3;
}
for (var _i3 = 0; _i3 < osKeys.length; _i3++) {
    MODPRIORITY[osKeys[_i3].toLowerCase()] = 2;
}

/***/ },
/* 6 */
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
            anykey: 'keyup', // We've found it!  The "any" key!
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
                event = event.replace(new RegExp(splitChar + '$'), ""); // Remove trailing colons
            } else {
                event = _this._handleAliases(event);
            }
            event = event.toLowerCase(); // All events are normalized to lowercase for consistency
            if (event.includes('-')) {
                // Combo
                if (!event.includes('->')) {
                    // Pre-sort non-ordered combos
                    event = (0, _utils.normCombo)(event);
                }
            }
            // Force an empty object as the context if none given (simplifies things)
            if (!context) {
                context = {};
            }
            var callObj = {
                callback: callback,
                context: context,
                times: times
            };
            if (!_this.events[event]) {
                _this.events[event] = [];
            }
            _this.events[event].push(callObj);
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
            for (var i in events) {
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
            if (_this2.state.recording) {
                _this2.state.recordedEvents.push(event);
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
/* 7 */
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
/* 8 */
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
/* 9 */
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
/* 10 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
'use strict';

exports.__esModule = true;
exports.isArray = exports.toString = undefined;

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
exports.sortEvents = sortEvents;
exports.normCombo = normCombo;
exports.addListeners = addListeners;
exports.removeListeners = removeListeners;

var _constants = __webpack_require__(3);

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
    return x && y && (typeof x === 'undefined' ? 'undefined' : _typeof(x)) === 'object' && (typeof y === 'undefined' ? 'undefined' : _typeof(y)) === 'object' ? Object.keys(x).length === Object.keys(y).length && Object.keys(x).reduce(function (equal, key) {
        return equal && isEqual(x[key], y[key]);
    }, true) : x === y;
};

function isUpper(str) {
    if (str == str.toUpperCase() && str != str.toLowerCase()) {
        return true;
    }
};

function sortEvents(events) {
    /**:utils.sortEvents(events)
     Sorts and returns the given *events* array (which is normally just a copy of ``this.state.down``) according to HumanInput's event sorting rules.
    */
    var priorities = _constants.MODPRIORITY;
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
}

function normCombo(event) {
    /**:normCombo(event)
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
    var events = event.split('-'); // Separate into parts
    var ctrlCheck = function ctrlCheck(key) {
        if (key == 'control') {
            // This one is simpler than the others
            return _constants.ControlKeyEvent;
        }
        return key;
    };
    var altCheck = function altCheck(key) {
        for (var j = 0; j < _constants.AltAltNames.length; j++) {
            if (key == _constants.AltAltNames[j]) {
                return _constants.AltKeyEvent;
            }
        }
        return key;
    };
    var osCheck = function osCheck(key) {
        for (var j = 0; j < _constants.AltOSNames.length; j++) {
            if (key == _constants.AltOSNames[j]) {
                return _constants.OSKeyEvent;
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
    sortEvents(events);
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
/* 11 */
/***/ function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {module.exports = global["HumanInput"] = __webpack_require__(6);
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {module.exports = global["HumanInput"] = __webpack_require__(7);
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {module.exports = global["HumanInput"] = __webpack_require__(8);
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {module.exports = global["HumanInput"] = __webpack_require__(9);
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
'use strict';

exports.__esModule = true;

var _humaninput = __webpack_require__(2);

var _humaninput2 = _interopRequireDefault(_humaninput);

var _clipboard = __webpack_require__(25);

var _clipboard2 = _interopRequireDefault(_clipboard);

var _scroll = __webpack_require__(31);

var _scroll2 = _interopRequireDefault(_scroll);

var _pointer = __webpack_require__(30);

var _pointer2 = _interopRequireDefault(_pointer);

var _speechrec = __webpack_require__(32);

var _speechrec2 = _interopRequireDefault(_speechrec);

var _gamepad = __webpack_require__(27);

var _gamepad2 = _interopRequireDefault(_gamepad);

var _clapper = __webpack_require__(24);

var _clapper2 = _interopRequireDefault(_clapper);

var _idle = __webpack_require__(29);

var _idle2 = _interopRequireDefault(_idle);

var _feedback = __webpack_require__(26);

var _feedback2 = _interopRequireDefault(_feedback);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Idle timeout detection support


// Gamepad support


// Pointer, mouse, touch, and multitouch event support


// Clipboard, selection, and input event support
exports.default = _humaninput2.default;

// Feedback plugin support


// Clap detection support


// Speech recognition


// Scroll event support
// The bare minimum of HumanInput:
//  keyboard, contextmenu, window, and other basic events that don't need special handling

module.exports = exports['default'];

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
'use strict';

exports.__esModule = true;
exports.ClapperPlugin = undefined;

var _humaninput = __webpack_require__(2);

var _humaninput2 = _interopRequireDefault(_humaninput);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } } /**
                                                                                                                                                           * clapper.js - HumanInput Clapper Plugin: Adds support detecting clap events like "the clapper" (classic)
                                                                                                                                                           * Copyright (c) 2016, Dan McDougall
                                                                                                                                                           * @link https://github.com/liftoff/HumanInput/src/clapper.js
                                                                                                                                                           * @license Apache-2.0
                                                                                                                                                           */

// Add ourselves to the default listen events since we won't start listening for claps unless explicitly told to do so (won't be used otherwise)
_humaninput2.default.defaultListenEvents.push('clapper');
// Setup getUserMedia
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

var AudioContext = window.AudioContext || window.webkitAudioContext;
var throttleMS = 60; // Only process audio once every throttleMS milliseconds
var historyLength = 50; // How many samples to keep in the history buffer (50 is about 3 seconds worth)
var sum = function sum(arr) {
    return arr.reduce(function (a, b) {
        return a + b;
    });
};
var findPeaks = function findPeaks(arr) {
    // returns the indexes of all the peaks in *arr*
    var indexes = [];
    for (var i = 1; i < arr.length - 1; ++i) {
        if (arr[i - 1] < arr[i] && arr[i] > arr[i + 1]) {
            indexes.push(i);
        }
    }
    return indexes;
};

var ClapperPlugin = exports.ClapperPlugin = function () {
    function ClapperPlugin(HI) {
        _classCallCheck(this, ClapperPlugin);

        // HI == current instance of HumanInput
        this.HI = HI;
        this.l = HI.l;
        this.exports = {};
        this.history = [];
        this.rollingAvg = [];
        this.calcHistoryAverage = this.calcHistoryAverage.bind(this);
        this.startClapper = this.startClapper.bind(this);
        this.stopClapper = this.stopClapper.bind(this);
    }

    ClapperPlugin.prototype.init = function init(HI) {
        var _this = this;

        var state = HI.state;
        this.log = new HI.Logger(HI.settings.logLevel || 'INFO', '[HI Clapper]');
        HI.settings.autostartClapper = HI.settings.autostartClapper || false; // Don't autostart by default
        HI.settings.clapThreshold = HI.settings.clapThreshold || 130;
        HI.settings.autotoggleClapper = HI.settings.autotoggleClapper || true; // Should we stop automatically on page:hidden?
        if (HI.settings.listenEvents.indexOf('clapper') != -1) {
            if (AudioContext) {
                if (HI.settings.autostartClapper) {
                    this.startClapper();
                }
                if (HI.settings.autotoggleClapper) {
                    HI.on('document:hidden', function () {
                        if (_this._started) {
                            _this.stopClapper();
                        }
                    });
                    HI.on('document:visible', function () {
                        if (!_this._started && HI.settings.autostartClapper) {
                            _this.startClapper();
                        }
                    });
                }
            } else {
                // Disable the clapper functions to ensure no weirdness with document:hidden
                this.startClapper = HI.noop;
                this.stopClapper = HI.noop;
            }
        }
        // Exports (these will be applied to the current instance of HumanInput)
        this.exports.startClapper = this.startClapper;
        this.exports.stopClapper = this.stopClapper;
        return this;
    };

    ClapperPlugin.prototype.calcHistoryAverage = function calcHistoryAverage() {
        // Updates this.rollingAvg with the latest data from this.history so that each item in the array reflects the average amplitude for that chunk of the frequency spectrum
        var i,
            j,
            temp = 0;
        for (i = 0; i < this.analyser.frequencyBinCount; i++) {
            if (this.history[i]) {
                for (j = 0; j < this.history.length; j++) {
                    temp += this.history[j][i];
                }
                this.rollingAvg[i] = temp / this.history.length;
                temp = 0;
            }
        }
    };

    ClapperPlugin.prototype.startClapper = function startClapper() {
        var _this2 = this;

        var handleStream = function handleStream(stream) {
            var previous, detectedClap, detectedDoubleClap;
            _this2.stream = stream;
            _this2.scriptProcessor.connect(_this2.context.destination);
            _this2.analyser.smoothingTimeConstant = 0.4;
            _this2.analyser.fftSize = 128;
            _this2.streamSource = _this2.context.createMediaStreamSource(stream);
            _this2.streamSource.connect(_this2.analyser);
            _this2.analyser.connect(_this2.scriptProcessor);
            _this2.scriptProcessor.onaudioprocess = function () {
                var elapsed,
                    elapsedSinceClap,
                    elapsedSinceDoubleClap,
                    event,
                    peaks,
                    highestPeak,
                    highestPeakIndex,
                    amplitudeIncrease,
                    magicRatio1,
                    magicRatio2,
                    now = Date.now();
                if (!previous) {
                    previous = now;
                    detectedClap = now;
                }
                elapsed = now - previous;
                elapsedSinceClap = now - detectedClap;
                elapsedSinceDoubleClap = now - detectedDoubleClap;
                if (elapsed > throttleMS) {
                    _this2.freqData = new Uint8Array(_this2.analyser.frequencyBinCount);
                    _this2.analyser.getByteFrequencyData(_this2.freqData);
                    peaks = findPeaks(_this2.freqData);
                    highestPeakIndex = _this2.freqData.indexOf(Math.max.apply(null, _this2.freqData));
                    highestPeak = _this2.freqData[highestPeakIndex];
                    // Measure the amplitude increase against the rolling average not the previous data set (which can include ramping-up data which messes up our calculations)
                    amplitudeIncrease = _this2.freqData[highestPeakIndex] - _this2.rollingAvg[highestPeakIndex];
                    if (elapsedSinceClap >= throttleMS * 4) {
                        // Highest peak is right near the beginning of the spectrum for (most) claps:
                        if (highestPeakIndex < 8 && amplitudeIncrease > _this2.HI.settings.clapThreshold) {
                            // Sudden large volume change.  Could be a clap...
                            magicRatio1 = sum(_this2.freqData.slice(0, 10)) / sum(_this2.freqData.slice(10, 20)); // Check the magic ratio
                            magicRatio2 = sum(_this2.freqData.slice(0, 3)) / sum(_this2.freqData.slice(3, 6)); // Check the 2nd magic ratio
                            // The peak check below is to prevent accidentally capturing computer-generated sounds which usually have a nice solid curve (few peaks if any)
                            if (magicRatio1 < 1.8 && magicRatio2 < 1.4 && peaks.length > 2) {
                                // Now we're clapping!
                                event = 'clap';
                                if (elapsedSinceClap < throttleMS * 8) {
                                    event = 'doubleclap';
                                    detectedDoubleClap = now;
                                    if (elapsedSinceDoubleClap < throttleMS * 12) {
                                        event = 'applause';
                                    }
                                }
                                _this2.HI._addDown(event);
                                _this2.HI._handleDownEvents();
                                _this2.HI._handleSeqEvents();
                                _this2.HI._removeDown(event);
                                detectedClap = now;
                            }
                        }
                    }
                    previous = now;
                    // Only add this data set to this history if it wasn't a clap (so it doesn't poison our averages)
                    if (detectedClap != now) {
                        _this2.history.push(_this2.freqData);
                        if (_this2.history.length > historyLength) {
                            _this2.history.shift();
                        }
                        _this2.calcHistoryAverage();
                    }
                }
            };
        };
        this.context = new AudioContext();
        this.scriptProcessor = this.context.createScriptProcessor(1024, 1, 1);
        this.analyser = this.context.createAnalyser();
        this.freqData = new Uint8Array(this.analyser.frequencyBinCount);
        this.log.debug(this.l('Starting clap detection'));
        this._started = true;
        navigator.getUserMedia({ audio: true }, handleStream, function (e) {
            _this2.log.error(_this2.l('Could not get audio stream'), e);
        });
    };

    ClapperPlugin.prototype.stopClapper = function stopClapper() {
        this.log.debug(this.l('Stopping clap detection'));
        this.stream.getAudioTracks().forEach(function (track) {
            track.stop();
        });
        this.stream.getVideoTracks().forEach(function (track) {
            track.stop();
        });
        this.streamSource.disconnect(this.analyser);
        this.analyser.disconnect(this.scriptProcessor);
        this.scriptProcessor.disconnect(this.context.destination);
        this._started = false;
    };

    return ClapperPlugin;
}();

_humaninput2.default.plugins.push(ClapperPlugin);

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
'use strict';

exports.__esModule = true;
exports.ClipboardPlugin = undefined;

var _utils = __webpack_require__(1);

var _humaninput = __webpack_require__(2);

var _humaninput2 = _interopRequireDefault(_humaninput);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } } /**
                                                                                                                                                           * clipboard.js - HumanInput Clipboard Plugin: Adds support for cut, copy, paste, select, and input events to HumanInput
                                                                                                                                                           * Copyright (c) 2016, Dan McDougall
                                                                                                                                                           * @link https://github.com/liftoff/HumanInput/src/clipboard.js
                                                                                                                                                           * @license plublic domain
                                                                                                                                                           */

_humaninput2.default.defaultListenEvents = _humaninput2.default.defaultListenEvents.concat(['cut', 'copy', 'paste', 'select']);

var ClipboardPlugin = exports.ClipboardPlugin = function () {
    function ClipboardPlugin(HI) {
        _classCallCheck(this, ClipboardPlugin);

        // HI == current instance of HumanInput
        this.HI = HI;
        HI._clipboard = this._clipboard.bind(HI);
        this._paste = this._clipboard;
        this._copy = this._clipboard;
        this._cut = this._clipboard;
        HI._select = this._select.bind(HI);
        this._input = this._select;
    }

    ClipboardPlugin.prototype.init = function init(HI) {
        return this; // So it gets logged as being initialized
    };

    ClipboardPlugin.prototype._clipboard = function _clipboard(e) {
        var data;
        var event = e.type + ':"';
        if (this.filter(e)) {
            if (window.clipboardData) {
                // IE
                data = window.clipboardData.getData('Text');
            } else if (e.clipboardData) {
                // Standards-based browsers
                data = e.clipboardData.getData('text/plain');
            }
            if (!data && (e.type == 'copy' || e.type == 'cut')) {
                data = this.getSelText();
            }
            if (data) {
                // First trigger a generic event so folks can just grab the copied/cut/pasted data
                var results = this._triggerWithSelectors(e.type, [e, data]);
                // Now trigger a more specific event that folks can match against
                results = results.concat(this._triggerWithSelectors(event + data + '"', [e]));
                (0, _utils.handlePreventDefault)(e, results);
            }
        }
    };

    ClipboardPlugin.prototype._select = function _select(e) {
        // Handles triggering 'select' *and* 'input' events (since they're so similar)
        var event = e.type + ':"';
        if (e.type == 'select') {
            var data = this.getSelText();
        } else if (e.type == 'input') {
            var data = e.data || e.target.value;
        }
        if (this.filter(e)) {
            var results = this._triggerWithSelectors(e.type, [e, data]);
            if (data) {
                results = results.concat(this._triggerWithSelectors(event + data + '"', [e]));
                (0, _utils.handlePreventDefault)(e, results);
            }
        }
    };

    return ClipboardPlugin;
}();

_humaninput2.default.plugins.push(ClipboardPlugin);

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
'use strict';

exports.__esModule = true;
exports.FeedbackPlugin = undefined;

var _humaninput = __webpack_require__(2);

var _humaninput2 = _interopRequireDefault(_humaninput);

var _utils = __webpack_require__(1);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * feedback.js - HumanInput Feedback Plugin: Provides visual, audio, and vibration feedback for HumanInput events.
 * Copyright (c) 2016, Dan McDougall
 * @link https://github.com/liftoff/HumanInput/src/feedback.js
 * @license Apache-2.0
 */

var AudioContext = new (window.AudioContext || window.webkitAudioContext || window.audioContext)();
var AllModifiers = ['OS', 'OSLeft', 'OSRight', 'Control', 'ControlLeft', 'ControlRight', 'Alt', 'AltLeft', 'AltRight', 'Shift', 'ShiftLeft', 'ShiftRight', '⇧'];
var defaultFeedbackEvents = ['keydown', 'dblclick', 'wheel:down', 'wheel:up', 'wheel:left', 'wheel:right', 'pointer:left:down', 'pointer:middle:down', 'pointer:right:down', 'scroll:up', 'scroll:down', 'scroll:left', 'scroll:right'];

var topOrBottom = 'top';
var leftOrRight = 'right';

// NOTE: This is only meant to be a fallback.  Use your own element and styles!
var feedbackStyle = '\n#hi_feedback {\n    position: absolute;\n    ' + topOrBottom + ': 1em;\n    ' + leftOrRight + ': 1em;\n    align-items: flex-end;\n    justify-content: flex-end;\n    font-size: 2em;\n    display: flex;\n    flex-flow: row wrap;\n    width: 8em;\n}\n\n#hi_feedback .event {\n    transition: all .5s ease-in-out;\n    transform-origin: right bottom;\n    opacity: 0;\n    border: black .15rem solid;\n    border-radius: .2em;\n    text-align: center;\n    padding: .2rem;\n    min-width: 1em;\n    padding: .2em;\n    background-color: rgba(0,0,0,0.7);\n    color: #fff;\n    z-index: 9999;\n}\n';
var svgcircle = '<circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" />';

function beep() {
    var ms = arguments.length <= 0 || arguments[0] === undefined ? 50 : arguments[0];
    var freq = arguments.length <= 1 || arguments[1] === undefined ? 500 : arguments[1];
    var type = arguments.length <= 2 || arguments[2] === undefined ? 'sine' : arguments[2];
    var gain = arguments.length <= 3 || arguments[3] === undefined ? 0.5 : arguments[3];

    // ms: Milliseconds to play the beep.
    // freq: Frequency of the beep (1-20000 or so).
    // gain: Value between 0 and 1 representing the gain or volume of the beep.
    // sine: The type of wave to generate for the beep.  One of sine, square, sawtooth, or triangle.

    var gainNode = AudioContext.createGain();
    var oscillator = AudioContext.createOscillator();

    oscillator.connect(gainNode);
    gainNode.connect(AudioContext.destination);

    oscillator.frequency.value = freq;
    gainNode.gain.value = gain;
    oscillator.type = type;

    oscillator.start();
    setTimeout(function () {
        oscillator.stop();
    }, ms ? ms : 50);
};

var FeedbackPlugin = exports.FeedbackPlugin = function () {
    function FeedbackPlugin(HI) {
        _classCallCheck(this, FeedbackPlugin);

        this.HI = HI;
        this.l = HI.l;
        this.exports = { beep: beep };
        return this;
    }

    FeedbackPlugin.prototype.init = function init(HI) {
        this.log = new HI.Logger(HI.settings.logLevel || 'INFO', '[HI Feedback]');
        this.lastActivity = new Date();
        this.timeout = null;
        // Handle settings
        HI.settings.feedbackEvents = HI.settings.feedbackEvents || defaultFeedbackEvents;
        HI.settings.visualFeedback = HI.settings.visualFeedback || false;
        HI.settings.audioFeedback = HI.settings.audioFeedback || false;
        HI.settings.vibrationFeedback = HI.settings.vibrationFeedback || false;
        HI.settings.feedbackClass = HI.settings.feedbackClass || 'event';
        this.feedbackElem = (0, _utils.getNode)(HI.settings.feedbackElem);
        // Double-check that we didn't already create one
        if (!this.feedbackElem) {
            this.feedbackElem = (0, _utils.getNode)('#hi_feedback');
        }
        // Now start yer engines!
        if (!this.feedbackElem) {
            HI.settings.feedbackElem = '#hi_feedback';
            // Create a reasonable location (and style) to display visual feedback
            this.feedbackStyle = document.createElement('style');
            this.feedbackStyle.type = 'text/css';
            this.feedbackStyle.appendChild(document.createTextNode(feedbackStyle));
            document.body.appendChild(this.feedbackStyle);
            this.feedbackElem = document.createElement('div');
            this.feedbackElem.id = 'hi_feedback';
            if (HI.elem !== window) {
                // Try to use the element HumanInput was instantiated on first
                HI.elem.appendChild(this.feedbackElem);
            } else {
                // Fall back to document.body
                document.body.appendChild(this.feedbackElem);
                // NOTE: We add this element whether visual feedback is enabled or not since it doesn't show anything if empty
            }
        }
        if (HI.settings.visualFeedback) {
            HI.on(HI.settings.feedbackEvents, this.visualEvent, this);
        }
        if (HI.settings.audioFeedback) {
            HI.on(HI.settings.feedbackEvents, this.audioEvent, this);
        }
        // TODO:
        //         if (HI.settings.vibrationFeedback) {
        //
        //         }
        return this;
    };

    FeedbackPlugin.prototype.containsModifiers = function containsModifiers(item, index, arr) {
        return AllModifiers.includes(item);
    };

    FeedbackPlugin.prototype.visualEvent = function visualEvent(e) {
        // Shows the just-triggered key/event in the feedbackElem (with lots of formatting and checks to ensure we display the most human-friendly event as possible)
        var event = this.HIEvent,
            clipboardEvents = ['cut', 'copy', 'paste', 'select'],
            downEvents = HI.getDown(),
            eventElem = document.createElement('div');
        eventElem.classList.add(this.HI.settings.feedbackClass);
        if (clipboardEvents.includes(e.type) && arguments.length - 1) {
            eventElem.innerHTML = event + ':' + (arguments.length <= 1 ? undefined : arguments[1]);
        } else if (e.type == 'keydown') {
            event = arguments.length <= 1 ? undefined : arguments[1]; // Use the 'key' as the event name instead of 'keydown:<key>'
            eventElem.innerHTML = event;
            if (AllModifiers.includes(event) && !downEvents.includes('-')) {
                // This is just to demonstrate that HumanInput knows the difference between the left and right variants
                eventElem.innerHTML = event.toLowerCase(); // e.g. 'shiftleft'
            } else if (HI.state.down.some(this.containsModifiers)) {
                eventElem.innerHTML = downEvents; // e.g. 'ctrl-shift-i'
            }
        } else if (event.startsWith('pointer')) {
            var clickElem = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            clickElem.setAttribute("width", 100);
            clickElem.setAttribute("height", 100);
            clickElem.style.position = 'absolute';
            clickElem.style.top = e.clientY - 50 + 'px';
            clickElem.style.left = e.clientX - 50 + 'px';
            clickElem.style.transition = 'all .33s ease-out';
            clickElem.style.transform = 'scale(0.1)';
            clickElem.style.zIndex = 10000;
            clickElem.innerHTML = svgcircle;
            document.body.appendChild(clickElem);
            setTimeout(function () {
                clickElem.style.transform = 'scale(2)';
                clickElem.style.opacity = 0;
                setTimeout(function () {
                    clickElem.parentNode.removeChild(clickElem);
                }, 500);
            }, 10);
            // Remove the :down part of each event (if present)
            if (event.includes(':down')) {
                event = event.substr(0, event.length - 5);
            }
            eventElem.innerHTML = event;
        } else {
            if (downEvents.length) {
                eventElem.innerHTML = downEvents;
            } else {
                eventElem.innerHTML = event;
            }
        }
        // Fade it out all nice:
        eventElem.style.opacity = 1;
        this.feedbackElem.appendChild(eventElem);
        setTimeout(function () {
            // ...then fade it out all nice:
            eventElem.style.opacity = 0;
            showEventTimeout = setTimeout(function () {
                eventElem.parentNode.removeChild(eventElem);
            }, 500);
        }, 1000);
    };

    FeedbackPlugin.prototype.audioEvent = function audioEvent(e) {
        beep(33, 500, 'triangle');
    };

    //     vibrationEvent(e, ...args) {
    //
    //     }


    return FeedbackPlugin;
}();

_humaninput2.default.plugins.push(FeedbackPlugin);

/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
'use strict';

exports.__esModule = true;
exports.GamepadPlugin = undefined;

var _utils = __webpack_require__(1);

var _humaninput = __webpack_require__(2);

var _humaninput2 = _interopRequireDefault(_humaninput);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } } /**
                                                                                                                                                           * gamepad.js - HumanInput Gamepad Plugin: Adds support for gamepads and joysticks to HumanInput.
                                                                                                                                                           * Copyright (c) 2016, Dan McDougall
                                                                                                                                                           * @link https://github.com/liftoff/HumanInput/src/gamepad.js
                                                                                                                                                           * @license Apache-2.0
                                                                                                                                                           */

var gpadPresent = function gpadPresent(index) {
    // Returns true if the gamepad with *index* is detected
    var gamepads = navigator.getGamepads();
    for (var i = 0; i < gamepads.length; i++) {
        if (gamepads[i] && gamepads[i].index == index) {
            return true;
        }
    }
};

var GamepadPlugin = exports.GamepadPlugin = function () {
    /**:GamePadPlugin
     The HumanInput Gamepad plugin adds support for gamepads and joysticks allowing the use of the following event types:
     ========================= =============================     =======================================
    Event                     Description                       Arguments
    ========================= =============================     =======================================
    ``gpad:connected``        A gamepad was connected           (<Gamepad object>)
    ``gpad:disconnected``     A gamepad was connected           (<Gamepad object>)
    ``gpad:button:<n>``       State of button *n* changed       (<Button Value>, <Gamepad object>)
    ``gpad:button:<n>:down``  Button *n* was pressed (down)     (<Button Value>, <Gamepad object>)
    ``gpad:button:<n>:up``    Button *n* was released (up)      (<Button Value>, <Gamepad object>)
    ``gpad:button:<n>:value`` Button *n* value has changed      (<Button Value>, <Gamepad object>)
    ``gpad:axis:<n>``         Gamepad axis *n* changed          (<Button axis value>, <Gamepad object>)
    ========================= =============================     =======================================
     Detection Events
    ----------------
    Whenever a new gamepad is detected the 'gpad:connected' event will fire with the Gamepad object as the only argument.
     Button Events
    -------------
    When triggered, gpad:button events are called like so::
         trigger(event, buttonValue, gamepadObj);
     You can listen for button events using :js:func:`HumanInput.on` like so::
         // Ensure 'gamepad' is included in listenEvents if not calling gamepadUpdate() in your own loop:
        var settings = {addEvents: ['gamepad']};
        var HI = new HumanInput(window, settings);
        var shoot = function(buttonValue, gamepadObj) {
            console.log('Fire! Button value:', buttonValue, 'Gamepad object:', gamepadObj);
        };
        HI.on('gpad:button:1:down', shoot); // Call shoot(buttonValue, gamepadObj) when gamepad button 1 is down
        var stopShooting = function(buttonValue, gamepadObj) {
            console.log('Cease fire! Button value:', buttonValue, 'Gamepad object:', gamepadObj);
        };
        HI.on('gpad:button:1:up', stopShooting); // Call stopShooting(buttonValue, gamepadObj) when gamepad button 1 is released (up)
     For more detail with button events (e.g. you want fine-grained control with pressure-sensitive buttons) just neglect to add ':down' or ':up' to the event::
         HI.on('gpad:button:6', shoot);
     .. note:: The given buttonValue can be any value between 0 (up) and 1 (down).  Pressure sensitive buttons (like L2 and R2 on a DualShock controller) will often have floating point values representing how far down the button is pressed such as ``0.8762931823730469``.
     Button Combo Events
    -------------------
    When multiple gamepad buttons are held down a button combo event will be fired like so::
         trigger("gpad:button:0-gpad:button:1", gamepadObj);
     In the above example gamepad button 0 and button 1 were both held down simultaneously.  This works with as many buttons as the gamepad supports and can be extremely useful for capturing diagonal movement on a dpad.  For example, if you know that button 14 is left and button 13 is right you can use them to define diagonal movement like so::
         on("gpad:button:13-gpad:button:14", downLeft);
     Events triggered in this way will be passed the Gamepad object as the only argument.
     .. note:: Button combo events will always trigger *before* other button events.
     Axis Events
    -----------
     When triggered, gpad:axis events are called like so::
         trigger(event, axisValue, GamepadObj);
     You can listen for axis events using :js:func:`HumanInput.on` like so::
         var moveBackAndForth = function(axisValue, gamepadObj) {
            if (axisValue < 0) {
                console.log('Moving forward at speed: ' + axisValue);
            } else if (axisValue > 0) {
                console.log('Moving backward at speed: ' + axisValue);
            }
        };
        HI.on('gpad:axis:1', moveBackAndForth);
     .. topic:: Game and Application Loops
         If your game or application has its own event loop that runs at least once every ~100ms or so then it may be beneficial to call :js:func:`HumanInput.gamepadUpdate` inside your own loop *instead* of passing 'gamepad' via the 'listenEvents' (or 'addEvents') setting.  Calling :js:func:`HumanInput.gamepadUpdate` is very low overhead (takes less than a millisecond) but HumanInput's default gamepad update loop is only once every 100ms. If you don't want to use your own loop but want HumanInput to update the gamepad events more rapidly you can reduce the 'gpadInterval' setting.  Just note that if you set it too low it will increase CPU utilization which may have negative consequences for your application.
     .. note:: The update interval timer will be disabled if the page is no longer visible (i.e. the user switched tabs).  The interval timer will be restored when the page becomes visible again.  This is handled via the Page Visibility API (the 'document:visibile' and 'document:hidden' events triggered by HumanInput).
     Gamepad State
    -------------
    The state of all buttons and axes on all connected gamepads/joysticks can be read at any time via the `HumanInput.gamepads` property::
         var HI = HumanInput();
        for (var i=0; i < HI.gamepads.length; i++) {
            console.log('Gamepad ' + i + ':', HI.gamepads[i]);
        });
     .. note:: The index position of a gamepad in the `HumanInput.gamepads` array will always match the Gamepad object's 'index' property.
    */

    function GamepadPlugin(HI) {
        _classCallCheck(this, GamepadPlugin);

        // HI == current instance of HumanInput
        this.HI = HI;
        this.log = new HI.Logger(HI.settings.logLevel || 'INFO', '[HI Gamepad]');
        this.gamepads = [];
        this._gamepadTimer = null;
        // Exports (these will be applied to the current instance of HumanInput)
        this.exports = {
            gamepads: this.gamepads,
            _gamepadTimer: this._gamepadTimer,
            gamepadUpdate: this.gamepadUpdate,
            loadController: this.loadController,
            stopGamepadUpdates: this.stopGamepadUpdates,
            startGamepadUpdates: this.startGamepadUpdates
        };
        return this;
    }

    GamepadPlugin.prototype.init = function init(HI) {
        /**:GamepadPlugin.init(HI)
         Initializes the Gamepad Plugin by performing the following:
             * Checks for the presence of the 'gpadInterval' and 'gpadCheckInterval' settings and applies defaults if not found.
            * Sets up an interval timer using 'gpadInterval' or 'gpadCheckInterval' that runs :js:func:`GamepadPlugin.gamepadUpdate` if a gamepad is found or not found, respectively *if* 'gamepad' is set in `HI.settings.listenEvents`.
            * Exports `GamepadPlugin.gamepads`, `GamepadPlugin._gamepadTimer`, and :js:func:`GamepadPlugin.gamepadUpdate` to the current instance of HumanInput.
            * Attaches to the 'visibilitychange' event so that we can disable/enable the interval timer that calls :js:func:`GamepadPlugin.gamepadUpdate` (`GamepadPlugin._gamepadTimer`).
        */
        var settings = HI.settings;
        // Hopefully this timing is fast enough to remain responsive without wasting too much CPU:
        settings.gpadInterval = settings.gpadInterval || 100; // .1s
        settings.gpadCheckInterval = settings.gpadCheckInterval || 3000; // 3s
        clearInterval(this._gamepadTimer); // In case it's already set
        if (settings.listenEvents.includes('gamepad')) {
            this.gamepadUpdate();
            this.startGamepadUpdates();
            // Make sure we play nice and disable our interval timer when the user changes tabs
            HI.on('document:hidden', this.stopGamepadUpdates);
            HI.on('document:visibile', this.startGamepadUpdates);
            // This ensures the gpadCheckInterval is replaced with the gpadInterval
            HI.on('gpad:connected', this.startGamepadUpdates);
        }
        return this;
    };

    GamepadPlugin.prototype.gamepadUpdate = function gamepadUpdate() {
        /**:GamepadPlugin.gamepadUpdate()
         .. note:: This method needs to be called in a loop.  See the 'Game and Application Loops' topic for how you can optimize gamepad performance in your own game or application.
         Updates the state of `HumanInput.gamepads` and triggers 'gpad:button' or 'gamepad:axes' events if the state of any buttons or axes has changed, respectively.
         This method will also trigger a 'gpad:connected' event when a new Gamepad is detected (i.e. the user plugged it in or the first time the page is loaded).
        */
        var i,
            j,
            index,
            prevState,
            gp,
            buttonState,
            event,
            bChanged,
            pseudoEvent = { 'type': 'gamepad', 'target': this.HI.elem },
            gamepads = navigator.getGamepads();
        // Check for disconnected gamepads
        for (i = 0; i < this.gamepads.length; i++) {
            if (this.gamepads[i] && !gpadPresent(i)) {
                this.HI.trigger('gpad:disconnected', this.gamepads[i]);
                this.gamepads[i] = null;
            }
        }
        for (i = 0; i < gamepads.length; ++i) {
            if (gamepads[i]) {
                index = gamepads[i].index, gp = this.gamepads[index];
                if (!gp) {
                    // TODO: Add controller layout detection here
                    this.log.debug('Gamepad ' + index + ' detected:', gamepads[i]);
                    this.HI.trigger('gpad:connected', gamepads[i]);
                    this.gamepads[index] = {
                        axes: [],
                        buttons: [],
                        timestamp: gamepads[i].timestamp,
                        id: gamepads[i].id
                    };
                    gp = this.gamepads[index];
                    // Prepopulate the axes and buttons arrays so the comparisons below will work:
                    for (j = 0; j < gamepads[i].buttons.length; j++) {
                        gp.buttons[j] = { value: 0, pressed: false };
                    }
                    for (j = 0; j < gamepads[i].axes.length; j++) {
                        gp.axes[j] = 0;
                    }
                    continue;
                } else {
                    if (gp.timestamp == gamepads[i].timestamp) {
                        continue; // Nothing changed
                    }
                    // NOTE: We we have to make value-by-value copy of the previous gamepad state because Gamepad objects retain references to their internal state (i.e. button and axes values) when copied using traditional methods.  Benchmarking has shown the JSON.parse/JSON.stringify method to be the fastest so far (0.3-0.5ms per call to gamepadUpdate() VS 0.7-1.2ms per call when creating a new object literal, looping over the axes and buttons to copy their values).
                    prevState = JSON.parse(JSON.stringify(gp)); // This should be slower but I think the JS engine has an optimization for this specific parse(stringify()) situation resulting in it being the fastest method
                    gp.timestamp = gamepads[i].timestamp;
                    gp.axes = gamepads[i].axes.slice(0);
                    for (j = 0; j < prevState.buttons.length; j++) {
                        gp.buttons[j].pressed = gamepads[i].buttons[j].pressed;
                        gp.buttons[j].value = gamepads[i].buttons[j].value;
                    }
                }
                if (this.HI.filter(pseudoEvent)) {
                    // Update the state of all down buttons (axes stand alone)
                    for (j = 0; j < gp.buttons.length; j++) {
                        buttonState = 'up';
                        if (gp.buttons[j].pressed) {
                            buttonState = 'down';
                        }
                        event = 'gpad:button:' + j;
                        if (buttonState == 'down') {
                            if (!this.HI.isDown(event)) {
                                this.HI._addDown(event);
                            }
                        } else {
                            if (this.HI.isDown(event)) {
                                this.HI._handleSeqEvents();
                                this.HI._removeDown(event);
                            }
                        }
                        if (gp.buttons[j].pressed != prevState.buttons[j].pressed) {
                            this.HI.trigger(this.HI.scope + event, gp.buttons[j].value, gamepads[i]);
                            this.HI.trigger(this.HI.scope + 'gpad:button:' + buttonState, gp.buttons[j].value, gamepads[i]);
                            this.HI.trigger(this.HI.scope + event + ':' + buttonState, gp.buttons[j].value, gamepads[i]);
                            bChanged = true;
                        } else if (gp.buttons[j].value != prevState.buttons[j].value) {
                            this.HI.trigger(HI.scope + event, gp.buttons[j].value, gamepads[i]);
                        }
                    }
                    for (j = 0; j < prevState.axes.length; j++) {
                        if (gp.axes[j] != prevState.axes[j]) {
                            event = 'gpad:axis:' + j;
                            this.HI.trigger(HI.scope + event, gp.axes[j], gamepads[i]);
                        }
                    }
                    if (bChanged) {
                        this.HI._handleDownEvents(gamepads[i]);
                    }
                }
            }
        }
    };

    GamepadPlugin.prototype.loadController = function loadController(controller) {
        // Loads the given controller (object)
        for (var alias in controller) {
            this.HI.aliases[alias] = controller[alias];
        }
    };

    GamepadPlugin.prototype.stopGamepadUpdates = function stopGamepadUpdates() {
        clearInterval(this._gamepadTimer);
    };

    GamepadPlugin.prototype.startGamepadUpdates = function startGamepadUpdates() {
        clearInterval(this._gamepadTimer);
        if (this.gamepads.length) {
            // At least one gamepad is connected
            this._gamepadTimer = setInterval(this.gamepadUpdate, this.HI.settings.gpadInterval);
        } else {
            // Check for a new gamepad every few seconds in case the user plugs one in later
            this._gamepadTimer = setInterval(this.gamepadUpdate, this.HI.settings.gpadCheckInterval);
        }
    };

    return GamepadPlugin;
}();

// The following is a WIP for adding aliases automatically depending on the detected gamepad type:

// The default controller layout.  The keys of this object represent alias names
// that will be assigned to HumanInput.aliases:
// GamepadPlugin.prototype.standardLayout = {
//     // NOTE: This layout should cover DualShock, Xbox controllers, and similar
//     'gpad:up': 'gpad:button:12',
//     'gpad:down': 'gpad:button:13',
//     'gpad:left': 'gpad:button:14',
//     'gpad:right': 'gpad:button:15',
//     'gpad:select': 'gpad:button:8',
//     'gpad:share': 'gpad:button:8',
//     'gpad:start': 'gpad:button:9',
//     'gpad:options': 'gpad:button:9',
//     'gpad:l1': 'gpad:button:4',
//     'gpad:l2': 'gpad:button:6',
//     'gpad:r1': 'gpad:button:5',
//     'gpad:r2': 'gpad:button:7'
// }

_humaninput2.default.plugins.push(GamepadPlugin);

/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
'use strict';

exports.__esModule = true;
exports.IdlePlugin = undefined;

var _humaninput = __webpack_require__(2);

var _humaninput2 = _interopRequireDefault(_humaninput);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } } /**
                                                                                                                                                           * idle.js - HumanInput Idle Plugin: Adds support for gracefully (low-overhead) detecting if the user is idle.
                                                                                                                                                           * Copyright (c) 2016, Dan McDougall
                                                                                                                                                           * @link https://github.com/liftoff/HumanInput/src/idle.js
                                                                                                                                                           * @license Apache-2.0
                                                                                                                                                           */

// Add ourselves to the default listen events
_humaninput2.default.defaultListenEvents.push('idle');

function convertTime(timeStr) {
    // Returns a *timeStr* like "20m" in milliseconds (s: seconds, m: minutes, h: hours, d: days, M: months, y: years)
    if (isNaN(timeStr)) {
        var num = parseInt(timeStr.slice(0, -1));
        if (timeStr.endsWith('s')) {
            return num * 1000;
        } else if (timeStr.endsWith('m')) {
            return num * 1000 * 60;
        } else if (timeStr.endsWith('h')) {
            return num * 1000 * 60 * 60;
        } else if (timeStr.endsWith('d')) {
            return num * 1000 * 60 * 60 * 24;
        } else if (timeStr.endsWith('M')) {
            return num * 1000 * 60 * 60 * 24 * 30; // Yeah it's approximate
        } else if (timeStr.endsWith('y')) {
            return num * 1000 * 60 * 60 * 24 * 365; // Sorry, no leap year support!
        } else {
            return parseInt(timeStr); // Fall back to milliseconds
        }
    } else {
        return timeStr;
    } // It's already a number; return as-is
};

var IdlePlugin = exports.IdlePlugin = function () {
    function IdlePlugin(HI) {
        _classCallCheck(this, IdlePlugin);

        this.HI = HI; // Since we're using the "total prototype" method below
        this.l = HI.l;
        // Exports (these will be applied to the current instance of HumanInput)
        this.startIdleChecker = this.startIdleChecker.bind(this);
        this.stopIdleChecker = this.stopIdleChecker.bind(this);
        this.mouseMoveCheck = this.mouseMoveCheck.bind(this);
        this.resetTimeout = this.resetTimeout.bind(this);
        this.idleCheck = this.idleCheck.bind(this);
        this.exports = {
            startIdleChecker: this.startIdleChecker,
            stopIdleChecker: this.stopIdleChecker
        };
        return this;
    }

    IdlePlugin.prototype.init = function init(HI) {
        var timeout, checkInterval;
        this.log = new HI.Logger(HI.settings.logLevel || 'INFO', '[HI Idle]');
        this.lastActivity = new Date();
        this.timeout = null;
        // Handle settings
        HI.settings.autostartIdle = HI.settings.autostartIdle || true; // Autostart by default
        timeout = HI.settings.idleTimeout || '5m'; // 5 minutes
        this.idleTimeout = convertTime(timeout);
        checkInterval = HI.settings.idleCheckInterval || '5s'; // Check every 5s by default
        this.idleCheckInterval = convertTime(checkInterval);
        // Now start yer engines!
        if (HI.settings.listenEvents.includes('idle')) {
            if (HI.settings.autostartIdle) {
                // Setup our event listeners
                this.startIdleChecker();
            }
        }
        return this;
    };

    IdlePlugin.prototype.mouseMoveCheck = function mouseMoveCheck() {
        var _this = this;

        // This function gets attached to the 'mousemove' event on the window.  It will remove itthis immediately if run and re-add itthis after idleCheckInterval.  In this way it is able to keep a reasonable amount of idle-checking without adding much CPU overhead (especially for gaming mice).
        clearTimeout(this.mouseMoveTimeout);
        this.lastActivity = new Date();
        // HumanInput doesn't listen for mousemove events by default so we'll manage our own
        window.removeEventListener('mousemove', this.mouseMoveCheck, true);
        // Also remove this in case we are resuming from a previous idle state:
        window.removeEventListener('mousemove', this.resetTimeout, true);
        this.mouseMoveTimeout = setTimeout(function () {
            window.addEventListener('mousemove', _this.mouseMoveCheck, true);
        }, this.idleCheckInterval);
    };

    IdlePlugin.prototype.resetTimeout = function resetTimeout() {
        // Reset the timeout and start it back up again
        this.log.debug(this.l("Activity detected; resetting idle timeout"));
        this.mouseMoveCheck(); // Start it up (if not already); also resets our lastActivity
        clearTimeout(this.timeout);
        this.timeout = setTimeout(this.idleCheck, this.idleCheckInterval);
    };

    IdlePlugin.prototype.startIdleChecker = function startIdleChecker() {
        var _this2 = this;

        // Attaches resetTimeout() to the 'click', 'keydown', and 'scroll' HumanInput events and also a function once('idle') that stops checking for idle timeouts (to save resources).
        this.HI.on(['click', 'keydown', 'scroll'], this.resetTimeout);
        this.resetTimeout();
        // Stop checking for idleness if we trigger the 'idle' event:
        this.HI.on('idle', function () {
            _this2.stopIdleChecker();
            // Make sure we resume checking when the user returns
            _this2.HI.once(['click', 'keydown', 'scroll'], _this2.resetTimeout);
            window.addEventListener('mousemove', _this2.resetTimeout, true);
        });
        this.HI.once('hi:reset', this.stopIdleChecker);
    };

    IdlePlugin.prototype.stopIdleChecker = function stopIdleChecker() {
        // Stops checking for idle timeouts; removes event listeners and whatnot
        window.removeEventListener('mousemove', this.mouseMoveCheck, true);
        this.HI.off(['click', 'keydown', 'scroll'], this.resetTimeout);
        clearTimeout(this.timeout);
        clearTimeout(this.mouseMoveTimeout);
    };

    IdlePlugin.prototype.idleCheck = function idleCheck() {
        // Checks this.lastActivity to see if we've got past this.idleTimeout and triggers the 'idle' event if so.
        clearTimeout(this.timeout);
        if (Date.now() - this.lastActivity.getTime() > this.idleTimeout) {
            this.HI.trigger('idle', this.lastActivity);
        } else {
            // Keep re-checking
            this.timeout = setTimeout(this.idleCheck, this.idleCheckInterval);
        }
    };

    return IdlePlugin;
}();

_humaninput2.default.plugins.push(IdlePlugin);

/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
'use strict';

exports.__esModule = true;
exports.PointerPlugin = undefined;

var _utils = __webpack_require__(1);

var _humaninput = __webpack_require__(2);

var _humaninput2 = _interopRequireDefault(_humaninput);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } } /**
                                                                                                                                                           * pointer.js - HumanInput Pointer Plugin: Adds support for pointer, mouse, touch, and multitouch events.
                                                                                                                                                           * Copyright (c) 2016, Dan McDougall
                                                                                                                                                           * @link https://github.com/liftoff/HumanInput/src/pointer.js
                                                                                                                                                           * @license Apache-2.0
                                                                                                                                                           */

var pointerEvents = ['pan', 'pointerdown', 'pointerup', 'pointercancel', 'wheel']; // Better than mouse/touch!
var mouseTouchEvents = ['pan', 'mousedown', 'mouseup', 'touchstart', 'touchend', 'touchcancel', 'wheel'];
var POINTERSUPPORT = false; // If the browser supports Pointer events
var motionEvents = ['pointermove'];
var noMouseEvents; // Minor state tracking

// Setup our default listenEvents
if (POINTERSUPPORT) {
    // If we have Pointer Events we don't need mouse/touch
    _humaninput2.default.defaultListenEvents = _humaninput2.default.defaultListenEvents.concat(pointerEvents);
} else {
    _humaninput2.default.defaultListenEvents = _humaninput2.default.defaultListenEvents.concat(mouseTouchEvents);
    motionEvents = ['mousemove', 'touchmove'];
}

var PointerPlugin = exports.PointerPlugin = function () {
    function PointerPlugin(HI) {
        var _this = this;

        _classCallCheck(this, PointerPlugin);

        // HI == current instance of HumanInput
        this.HI = HI;
        // These functions need to be bound to the HumanInput instance to work properly
        ['_click', '_dragendPointerup', '_pointerdown', '_pointerup', '_pointercancel', '_pointerMoveCheck', '_trackMotion', '_wheel'].forEach(function (event) {
            HI[event] = _this[event].bind(HI);
        });
        HI.on('hold', function (event) {
            if (event.includes('pointer:')) {
                // Pointer events are special in that we don't want to trigger 'hold' if the pointer moves
                (0, _utils.removeListeners)(window, motionEvents, HI._pointerMoveCheck, true);
                // Unfortunately the only way to figure out the current pointer position is to use the mousemove/touchmove/pointermove events:
                (0, _utils.addListeners)(window, motionEvents, HI._pointerMoveCheck, true);
                // NOTE: We'll remove the 'mousemove' event listener when the 'hold' events are finished
            }
        });
        HI._mousedown = HI._pointerdown;
        HI._touchstart = HI._pointerdown;
        HI._mouseup = HI._pointerup;
        HI._touchend = HI._pointerup;
        HI._touchcancel = HI._pointercancel;
        HI._tap = HI._click;
        HI.on('hi:resetstates', this._resetStates, HI);
        HI.on('hi:removedown', function (e) {
            (0, _utils.removeListeners)(window, motionEvents, HI._pointerMoveCheck, true);
        });
        HI.on('hold', this._holdCheck, HI);
    }

    PointerPlugin.prototype.init = function init(HI) {
        var state = HI.state;
        state.multitap = 0; // Tracks multitouch taps
        state.pointerCount = 0; // Tracks how many pointers/touches are currently active
        state.pointers = {}; // Tracks pointer/touch events
        state.scrollX = 0; // Tracks the distance scrolled in 'scroll' events
        state.scrollY = 0; // Ditto
        (0, _utils.removeListeners)(window, motionEvents, HI._pointerMoveCheck, true);
        (0, _utils.removeListeners)(HI.elem, motionEvents, HI._trackMotion, true);
        // Exports (these will be applied to the current instance of HumanInput)
        this.exports = {
            mouse: this.mouse
        };
        return this;
    };

    PointerPlugin.prototype._resetStates = function _resetStates() {
        (0, _utils.removeListeners)(window, motionEvents, this._pointerMoveCheck, true);
        (0, _utils.removeListeners)(this.elem, motionEvents, this._trackMotion, true);
        this.state.pointers = {};
        this.state.pointerCount = 0;
    };

    PointerPlugin.prototype._holdCheck = function _holdCheck(event) {
        if (event.includes('pointer:')) {
            // Pointer events are special in that we don't want to trigger 'hold' if the pointer moves
            (0, _utils.removeListeners)(window, motionEvents, this._pointerMoveCheck, true);
            // Unfortunately the only way to figure out the current pointer position is to use the mousemove/touchmove/pointermove events:
            (0, _utils.addListeners)(window, motionEvents, this._pointerMoveCheck, true);
            // NOTE: We'll remove the 'mousemove' event listener when the 'hold' events are finished
        }
    };

    PointerPlugin.prototype._pointerMoveCheck = function _pointerMoveCheck(e) {
        // This function gets attached to the 'mousemove' event and is used by this._holdCounter to figure out if the mouse moved and if so stop considering it a 'hold' event.
        var x,
            y,
            id,
            pointer,
            moveThreshold = this.settings.moveThreshold,
            pointers = this.state.pointers,
            touches = e.touches,
            ptype = e.pointerType;
        if (ptype || e.type == 'mousemove') {
            // PointerEvent or MouseEvent
            id = e.pointerId || 1;
        } else if (touches && touches.length) {
            // TouchEvent
            for (i = 0; i < touches.length; i++) {
                id = touches[i].identifier;
            }
        }
        pointer = pointers[id];
        if (pointer) {
            x = e.clientX || pointer.event.clientX;
            y = e.clientY || pointer.event.clientY;
            if (x && y) {
                if (Math.abs(pointer.x - x) > moveThreshold || Math.abs(pointer.y - y) > moveThreshold) {
                    clearTimeout(this.state.holdTimeout);
                    (0, _utils.removeListeners)(window, motionEvents, this._pointerMoveCheck, true);
                }
            }
        }
    };

    PointerPlugin.prototype._trackMotion = function _trackMotion(e) {
        // Gets attached to the 'touchmove' or 'pointermove' event if one or more fingers are down in order to track the movements (if 'pan' is in listenEvents).
        var id,
            pointer,
            results = [],
            event = 'pan',
            // Single finger version
        panObj = {},
            pointers = this.state.pointers,
            touches = e.touches,
            ptype = e.pointerType;
        // This keeps track of our pointer/touch state in this.state.pointers:
        if (ptype || e.type == 'mousemove') {
            // PointerEvent or MouseEvent
            id = e.pointerId || 1; // MouseEvent is always 0
            pointer = pointers[id];
            if (!pointer) {
                return;
            } // Got removed in the middle of everything
            pointer.event = e;
        } else if (touches && touches.length) {
            // TouchEvent
            for (i = 0; i < touches.length; i++) {
                id = touches[i].identifier;
                pointer = pointers[id];
                if (!pointer) {
                    return;
                }
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
        this._resetSeqTimeout();
        if (this.filter(e)) {
            if (this.state.pointerCount > 1) {
                event = 'multitouch:';
                results = results.concat(this._triggerWithSelectors(event + 'pan', [e, pointers]));
                results = results.concat(this._triggerWithSelectors(event + this.state.pointerCount + ':pan', [e, pointers]));
            } else {
                results = results.concat(this._triggerWithSelectors(event, [e, panObj]));
            }
            (0, _utils.handlePreventDefault)(e, results);
        }
    };

    PointerPlugin.prototype._dragendPointerup = function _dragendPointerup(e) {
        // This function is primarily a means to deal with the fact that mouseup/pointerup never fire when clicking and dragging with a mouse.
        // It creates a simulated mouseup/pointerup event so our state tracking doesn't get out of whack.
        var id = e.pointerId || 1;
        var pointers = this.state.pointers;
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
        if (!pointers[id]) {
            return;
        } // Got removed in the middle of everything
        if (POINTERSUPPORT) {
            // Fall back ("some day" we can get rid of this)
            upEvent = new PointerEvent('pointerup', eventDict);
        }
        this._pointerup(e); // Pass the potato
        // Don't need this anymore
        window.removeEventListener('dragend', this._dragendPointerup, true);
    };

    PointerPlugin.prototype._pointerdown = function _pointerdown(e) {
        var i,
            id,
            state = this.state,
            mouse = this.mouse(e),
            results,
            changedTouches = e.changedTouches,
            ptype = e.pointerType,
            event = 'pointer',
            d = ':down';
        if (e.type == 'mousedown' && noMouseEvents) {
            return; // We already handled this via touch/pointer events
        }
        // Regardless of the filter status we need to keep track of things
        if (ptype || e.type == 'mousedown') {
            // PointerEvent or MouseEvent
            id = e.pointerId || 1; // 1 is used for MouseEvent
            state.pointers[id] = {
                x: e.clientX,
                y: e.clientY,
                event: e,
                timestamp: Date.now()
            };
        } else if (changedTouches && changedTouches.length) {
            // TouchEvent
            for (i = 0; i < changedTouches.length; i++) {
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
        window.addEventListener('dragend', this._dragendPointerup, true);
        // Handle multitouch
        state.pointerCount++; // Keep track of how many we have down at a time
        if (state.pointerCount > 1 || this.settings.listenEvents.includes('pan')) {
            // Ensure we only have *one* eventListener no matter how many pointers/touches:
            (0, _utils.removeListeners)(window, motionEvents, this._trackMotion, true);
            (0, _utils.addListeners)(window, motionEvents, this._trackMotion, true);
        }
        this._addDown(event + ':' + mouse.buttonName);
        this._resetSeqTimeout();
        if (this.filter(e)) {
            // Make sure we trigger both pointer:down and the more specific pointer:<button>:down (if available):
            results = this._triggerWithSelectors(event + d, [e]);
            if (mouse.buttonName !== undefined) {
                event += ':' + mouse.buttonName;
                results = results.concat(this._triggerWithSelectors(event + d, [e]));
            }
            results = results.concat(this._handleDownEvents(e));
            (0, _utils.handlePreventDefault)(e, results);
        }
    };

    PointerPlugin.prototype._pointerup = function _pointerup(e) {
        var i,
            id,
            mouse,
            event,
            results,
            state = this.state,
            moveThreshold = this.settings.moveThreshold,
            clientX = e.clientX,
            clientY = e.clientY,
            pointers = state.pointers,
            diffs = {},
            // Tracks the x/y coordinate changes
        changedTouches = e.changedTouches,
            ptype = e.pointerType,
            swipeThreshold = this.settings.swipeThreshold,
            u = 'up',
            pEvent = 'pointer:',
            notFiltered = this.filter(e);
        if (e.type == 'mouseup' && noMouseEvents) {
            return; // We already handled this via touch/pointer events
        }
        if (ptype || e.type == 'mouseup') {
            // PointerEvent or MouseEvent
            id = e.pointerId || 1; // 1 is used for MouseEvent
        } else if (changedTouches && changedTouches.length) {
            // TouchEvent
            for (i = 0; i < changedTouches.length; i++) {
                id = changedTouches[i].identifier;
                clientX = changedTouches[i].clientX;
                clientY = changedTouches[i].clientY;
            }
        }
        if (pointers[id]) {
            // This can happen when the contextmenu intervenes
            diffs.x = pointers[id].x - clientX;
            diffs.y = pointers[id].y - clientY;
        }
        this._resetSeqTimeout();
        if (notFiltered) {
            // Make sure we trigger both pointer:up and the more specific pointer:<button>:up:
            results = this._triggerWithSelectors(pEvent + u, [e]);
            mouse = this.mouse(e);
            if (mouse.buttonName !== undefined) {
                pEvent += mouse.buttonName;
            } else {
                // :left is assumed/emulated for touch events
                pEvent += 'left';
            }
            results = results.concat(this._triggerWithSelectors(pEvent + ':' + u, [e]));
            // Now perform swipe detection...
            event = 'swipe:';
            if (Math.abs(diffs.x) > Math.abs(diffs.y)) {
                if (diffs.x > swipeThreshold) {
                    event += 'left';
                } else if (diffs.x < -swipeThreshold) {
                    event += 'right';
                }
            } else {
                if (diffs.y > swipeThreshold) {
                    event += 'up';
                } else if (diffs.y < -swipeThreshold) {
                    event += 'down';
                }
            }
        }
        // Cleanup
        delete pointers[id];
        state.pointerCount--;
        if (state.pointerCount > 0) {
            // Still more? Multitouch!
            if (diffs.x < moveThreshold && diffs.y < moveThreshold) {
                state.multitap++;
            } else {
                // One finger out of whack throws off the whole stack
                state.multitap = 0;
            }
        } else {
            if (state.multitap) {
                event = 'multitouch:' + (state.multitap + 1) + ':tap';
                results = this._triggerWithSelectors(event, [e]);
                this._removeDown(pEvent);
                this._addDown(event);
                if (notFiltered) {
                    results = results.concat(this._handleDownEvents(e));
                    this._handleSeqEvents(e);
                }
                this._removeDown(event);
                state.multitap = 0;
            } else {
                if (event != 'swipe:') {
                    // If there's a :<direction> it means it was a swipe
                    this._removeDown(pEvent);
                    this._addDown(event);
                    if (notFiltered) {
                        results = results.concat(this._handleDownEvents(e));
                        this._handleSeqEvents(e);
                    }
                    this._removeDown(event);
                } else {
                    if (notFiltered) {
                        this._handleSeqEvents(e);
                    }
                    this._removeDown(pEvent);
                }
            }
            (0, _utils.handlePreventDefault)(e, results);
            (0, _utils.removeListeners)(window, motionEvents, this._trackMotion, true);
        }
    };

    PointerPlugin.prototype._pointercancel = function _pointercancel(e) {
        // Cleans up any leftovers from _pointerdown()
        var i,
            id,
            state = this.state,
            pointers = state.pointers,
            changedTouches = e.changedTouches,
            ptype = e.pointerType,
            event = 'pointer:',
            mouse = this.mouse(e);
        if (ptype || e.type.includes('mouse')) {
            // No 'mousecancel' (yet) but you never know
            id = e.pointerId || 1; // 1 is used for MouseEvent
            if (pointers[id]) {
                delete pointers[id];
            }
        } else if (changedTouches && changedTouches.length) {
            // TouchEvent
            for (i = 0; i < changedTouches.length; i++) {
                id = changedTouches[i].identifier;
                if (pointers[id]) {
                    delete pointers[id];
                }
            }
            // Touch events emulate left mouse button
            mouse.buttonName = 'left';
        }
        this._removeDown(event + mouse.buttonName);
        state.pointerCount--;
        if (!state.pointerCount) {
            // It's empty; clean up the 'move' event listeners
            (0, _utils.removeListeners)(window, motionEvents, this._trackMotion, true);
        }
    };

    PointerPlugin.prototype._click = function _click(e) {
        var event = e.type;
        var numClicks = e.detail;
        if (numClicks === 2) {
            event = 'dblclick';
        } else if (numClicks === 3) {
            event = 'tripleclick';
        }
        // NOTE: No browsers seem to keep track beyond 3 clicks (yet).  When they do it might be a good idea to add 'quadrupleclick' and 'clickattack' events to this function =)
        this._resetSeqTimeout();
        if (this.filter(e)) {
            var results = this._triggerWithSelectors(event, [e]);
            (0, _utils.handlePreventDefault)(e, results);
        }
    };

    PointerPlugin.prototype._wheel = function _wheel(e) {
        var event = 'wheel';
        this._resetSeqTimeout();
        if (this.filter(e)) {
            // Trigger just 'wheel' first
            var results = this._triggerWithSelectors(event, [e]);
            // Up and down scrolling is simplest:
            if (e.deltaY > 0) {
                results = results.concat(this._doDownEvent(event + ':down', e));
            } else if (e.deltaY < 0) {
                results = results.concat(this._doDownEvent(event + ':up', e));
            }
            // Z-axis scrolling is also straightforward:
            if (e.deltaZ > 0) {
                results = results.concat(this._doDownEvent(event + ':out', e));
            } else if (e.deltaZ < 0) {
                results = results.concat(this._doDownEvent(event + ':in', e));
            }
            /*
            NOTE: Since browsers implement left and right scrolling via shift+scroll we can't
                  be certain if a developer wants to listen for say, 'shift-wheel:left' or
                  just 'wheel:left'.  Therefore we must trigger both events for every left
                  and right scroll action (if shift is down at the time).  If you can think
                  of a better way to handle this situation please submit a PR or at least
                  open an issue at Github indicating how this problem can be better solved.
            */
            if (e.deltaX > 0) {
                results = results.concat(this._doDownEvent(event + ':right', e));
                if (this.isDown('shift')) {
                    // Ensure that the singular 'wheel:right' is triggered even though the shift key is held
                    results = results.concat(this._triggerWithSelectors(event + ':right', [e]));
                }
            } else if (e.deltaX < 0) {
                results = results.concat(this._doDownEvent(event + ':left', e));
                if (this.isDown('shift')) {
                    // Ensure that the singular 'wheel:left' is triggered even though the shift key is held
                    results = results.concat(this._triggerWithSelectors(event + ':left', [e]));
                }
            }
            (0, _utils.handlePreventDefault)(e, results);
        }
    };

    PointerPlugin.prototype.mouse = function mouse(e) {
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
            if (e.button === 0) {
                m.left = true;m.buttonName = 'left';
            } else if (e.button === 1) {
                m.middle = true;m.buttonName = 'middle';
            } else if (e.button === 2) {
                m.right = true;m.buttonName = 'right';
            } else if (e.button === 3) {
                m.back = true;m.buttonName = 'back';
            } else if (e.button === 4) {
                m.forward = true;m.buttonName = 'forward';
            } else if (e.button === 5) {
                m.forward = true;m.buttonName = 'eraser';
            } else {
                m.buttonName = e.button;
            }
        }
        m.button = e.button; // Save original button number
        return m;
    };

    return PointerPlugin;
}();

_humaninput2.default.plugins.push(PointerPlugin);

/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
'use strict';

exports.__esModule = true;
exports.ScrollPlugin = undefined;

var _utils = __webpack_require__(1);

var _humaninput = __webpack_require__(2);

var _humaninput2 = _interopRequireDefault(_humaninput);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } } /**
                                                                                                                                                           * scroll.js - HumanInput Scroll Plugin: Adds support for scroll events.
                                                                                                                                                           * Copyright (c) 2016, Dan McDougall
                                                                                                                                                           * @link https://github.com/liftoff/HumanInput/src/scroll.js
                                                                                                                                                           * @license Apache-2.0
                                                                                                                                                           */

_humaninput2.default.defaultListenEvents.push('scroll');

var ScrollPlugin = exports.ScrollPlugin = function () {
    function ScrollPlugin(HI) {
        _classCallCheck(this, ScrollPlugin);

        // HI == current instance of HumanInput
        this.HI = HI;
        HI._scroll = (0, _utils.debounce)(this._scroll.bind(HI), 50);
        HI.on('hi:resetstates', this._resetStates, HI);
    }

    ScrollPlugin.prototype.init = function init(HI) {
        var state = HI.state;
        state.scrollX = 0; // Tracks the distance scrolled in 'scroll' events
        state.scrollY = 0; // Ditto
        return this;
    };

    ScrollPlugin.prototype._resetStates = function _resetStates() {
        this.state.scrollX = 0;
        this.state.scrollY = 0;
    };

    ScrollPlugin.prototype._scroll = function _scroll(e) {
        // NOTE:  Intentionally not adding scroll events to the sequence buffer since a whole lot of them can be generated in a single scroll
        var results,
            scrollXDiff,
            scrollYDiff,
            state = this.state,
            target = e.target,
            scrollX = target.scrollLeft,
            scrollY = target.scrollTop;
        if (target.scrollingElement) {
            // If it's available use it
            scrollX = target.scrollingElement.scrollLeft;
            scrollY = target.scrollingElement.scrollTop;
        }
        scrollXDiff = scrollX - state.scrollX;
        scrollYDiff = scrollY - state.scrollY;
        if (scrollYDiff === 0 && scrollXDiff === 0) {
            // Silly browser fired a scroll event when nothing actually moved.  WHY DO THEY DO THIS?!?
            return;
        }
        results = this._triggerWithSelectors(e.type, [e, { x: scrollXDiff, y: scrollYDiff }]);
        // NOTE:  this.state.scrollX and this.state.scrollY just track the previous position; not the diff
        if (scrollX !== undefined && scrollX !== state.scrollX) {
            scrollXDiff = Math.abs(scrollXDiff);
            if (scrollX > state.scrollX) {
                results = results.concat(this._triggerWithSelectors(e.type + ':right', [e, scrollXDiff]));
            } else {
                results = results.concat(this._triggerWithSelectors(e.type + ':left', [e, scrollXDiff]));
            }
            state.scrollX = scrollX;
        }
        if (scrollY !== undefined && scrollY !== state.scrollY) {
            scrollYDiff = Math.abs(scrollYDiff);
            if (scrollY > state.scrollY) {
                results = results.concat(this._triggerWithSelectors(e.type + ':down', [e, scrollYDiff]));
            } else {
                results = results.concat(this._triggerWithSelectors(e.type + ':up', [e, scrollYDiff]));
            }
            state.scrollY = scrollY;
        }
        (0, _utils.handlePreventDefault)(e, results);
    };

    return ScrollPlugin;
}();

_humaninput2.default.plugins.push(ScrollPlugin);

/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
'use strict';

exports.__esModule = true;
exports.SpeechRecPlugin = undefined;

var _utils = __webpack_require__(1);

var _humaninput = __webpack_require__(2);

var _humaninput2 = _interopRequireDefault(_humaninput);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } } /**
                                                                                                                                                           * speechrec.js - HumanInput Speech Recognition Plugin: Adds support for speech recognition.
                                                                                                                                                           * Copyright (c) 2016, Dan McDougall
                                                                                                                                                           * @link https://github.com/liftoff/HumanInput/src/speechrec.js
                                                                                                                                                           * @license Apache-2.0
                                                                                                                                                           */

// Add ourselves to the default listen events since we won't start speech unless explicitly told to do so (won't be used otherwise)
_humaninput2.default.defaultListenEvents.push('speech');

var speechEvent = window.SpeechRecognition || window.webkitSpeechRecognition || window.mozSpeechRecognition || window.msSpeechRecognition || window.oSpeechRecognition;

var SpeechRecPlugin = exports.SpeechRecPlugin = function () {
    function SpeechRecPlugin(HI) {
        _classCallCheck(this, SpeechRecPlugin);

        // HI == current instance of HumanInput
        // Exports (these will be applied to the current instance of HumanInput)
        this.exports = {
            startSpeechRec: this.startSpeechRec.bind(this),
            stopSpeechRec: this.stopSpeechRec.bind(this)
        };
        this.HI = HI; // Save reference to the current instance
        this.l = HI.l;
        this.log = new HI.Logger(HI.settings.logLevel || 'INFO', '[HI SpeechRec]');
        this._rtSpeech = []; // Tracks real-time speech so we don't repeat ourselves
        this._rtSpeechTimer = null;
        return this;
    }

    SpeechRecPlugin.prototype.init = function init() {
        var _this = this;

        var HI = this.HI;
        var settings = HI.settings;
        settings.autostartSpeech = settings.autostartSpeech || false; // Don't autostart by default
        if (settings.listenEvents.includes('speech')) {
            if (speechEvent) {
                if (settings.autostartSpeech) {
                    this.startSpeechRec();
                }
                HI.on('document:hidden', function () {
                    if (_this._started) {
                        _this.stopSpeechRec();
                    }
                });
                HI.on('document:visible', function () {
                    if (!_this._started && settings.autostartSpeech) {
                        _this.startSpeechRec();
                    }
                });
            } else {
                // Disable the speech functions
                this.startSpeechRec = _utils.noop;
                this.stopSpeechRec = _utils.noop;
            }
        }
        return this;
    };

    SpeechRecPlugin.prototype.startSpeechRec = function startSpeechRec() {
        var _this2 = this;

        var HI = this.HI;
        this._recognition = new speechEvent();
        this.log.debug(this.l('Starting speech recognition'), this._recognition);
        this._recognition.lang = HI.settings.speechLang || navigator.language || "en-US";
        this._recognition.continuous = true;
        this._recognition.interimResults = true;
        this._recognition.onresult = function (e) {
            for (var i = e.resultIndex; i < e.results.length; ++i) {
                var event = "speech";
                var transcript = e.results[i][0].transcript.trim();
                if (e.results[i].isFinal) {
                    // Make sure we trigger() just the 'speech' event first so folks can use with nonspecific on() events (e.g. to do transcription)
                    _this2.HI._addDown(event);
                    _this2.HI._handleDownEvents(e, transcript);
                    _this2.HI._removeDown(event);
                    // Now we craft the event with the transcript...
                    // NOTE: We have to replace - with – (en dash aka \u2013) because strings like 'real-time' would mess up event combos
                    event += ':"' + transcript.replace(/-/g, '–') + '"';
                    _this2.HI._addDown(event);
                    _this2.HI._handleDownEvents(e, transcript);
                    _this2.HI._handleSeqEvents();
                    _this2.HI._removeDown(event);
                } else {
                    // Speech recognition that comes in real-time gets the :rt: designation:
                    event += ':rt';
                    // Fire basic 'speech:rt' events so the status of detection can be tracked (somewhat)
                    _this2.HI._addDown(event);
                    _this2.HI._handleDownEvents(e, transcript);
                    _this2.HI._removeDown(event);
                    event += ':"' + transcript.replace(/-/g, '–') + '"';
                    if (_this2._rtSpeech.indexOf(event) == -1) {
                        _this2._rtSpeech.push(event);
                        _this2.HI._addDown(event);
                        _this2.HI._handleDownEvents(e, transcript);
                        // NOTE: Real-time speech events don't go into the sequence buffer because it would
                        //       fill up with garbage too quickly and mess up the ordering of other sequences.
                        _this2.HI._removeDown(event);
                    }
                }
            }
        };
        this._started = true;
        this._recognition.start();
    };

    SpeechRecPlugin.prototype.stopSpeechRec = function stopSpeechRec() {
        this.log.debug(this.l('Stopping speech recognition'));
        this._recognition.stop();
        this._started = false;
    };

    return SpeechRecPlugin;
}();

_humaninput2.default.plugins.push(SpeechRecPlugin);

/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {module.exports = global["HumanInput"] = __webpack_require__(16);
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {module.exports = global["HumanInput"] = __webpack_require__(17);
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {module.exports = global["HumanInput"] = __webpack_require__(18);
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {module.exports = global["HumanInput"] = __webpack_require__(19);
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {module.exports = global["HumanInput"] = __webpack_require__(15);
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {module.exports = global["HumanInput"] = __webpack_require__(20);
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {module.exports = global["HumanInput"] = __webpack_require__(21);
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {module.exports = global["HumanInput"] = __webpack_require__(22);
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {module.exports = global["HumanInput"] = __webpack_require__(23);
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ }
/******/ ])
});
;